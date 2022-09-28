import Message from "../components/Message";
import {ActivityIndicator, FlatList, StyleSheet, View} from "react-native";
import MessageInput from "../components/MessageInput";
import React, {useEffect, useState} from "react";
import {useRoute} from "@react-navigation/native";
import {DataStore, SortDirection} from "aws-amplify";
import {ChatRoom, Message as MessageModel} from "../src/models";
import {OpType} from "@aws-amplify/datastore";

export default function ChatRoomScreen() {
    const route = useRoute();

    const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
    const [messages, setMessages] = useState<MessageModel[]>([])

    useEffect(() => {
        fetchChatRoom();
        const subscription = DataStore.observe(MessageModel).subscribe(msg => {
            if (msg.model === MessageModel && msg.opType === OpType.INSERT) {
                setMessages(oldMessages => [msg.element, ...oldMessages])
            }
        })
        return () => subscription.unsubscribe();
    }, [])

    useEffect(() => {
        (async () => {
            if (!chatRoom) {
                return;
            }
            const fetchedMessages = await DataStore.query(MessageModel,
                message => message.chatroomID("eq", chatRoom.id),
                {
                    sort: message => message.createdAt(SortDirection.DESCENDING)
                }
            );
            setMessages(fetchedMessages)
        })()
    }, [chatRoom])

    const fetchChatRoom = async () => {
        if (!route.params?.id) {
            console.warn("No chatroom id provided");
            return;
        }
        const chatRoom = await DataStore.query(ChatRoom, route.params?.id);
        if (!chatRoom) {
            console.error("Couldn't find a chat room with this id");
            return;
        }
        setChatRoom(chatRoom)
    }

    if (!chatRoom) {
        return <ActivityIndicator/>
    }

    return (
        <View style={styles.page}>
            <FlatList
                data={messages}
                renderItem={({item}) => <Message message={item}/>}
                inverted
            />
            <MessageInput chatRoom={chatRoom}/>
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: 'white',
        flex: 1
    }
});
