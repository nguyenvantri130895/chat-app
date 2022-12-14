import React, {useEffect, useState} from "react";
import {Text, Image, View, Pressable, ActivityIndicator} from "react-native";
import styles from "./styles";
import {useNavigation} from "@react-navigation/native";
import {User, ChatRoom, ChatRoomUser, Message} from "../../src/models";
import {Auth, DataStore} from "aws-amplify";
import moment from "moment";

type ChatRoomItemProps = {
    chatRoom: ChatRoom;
}

export default function ChatRoomItem(props: ChatRoomItemProps) {
    const {chatRoom} = props;
    const [user, setUser] = useState<User | null>(null); // the display user
    const [lastMessage, setLastMessage] = useState<Message | undefined>();
    const [isLoading, setIsLoading] = useState(true);

    const navigation = useNavigation();
    useEffect(() => {
        const fetchUsers = async () => {
            const chatRoomUsers = (await DataStore.query(ChatRoomUser))
                .filter(chatRoomUser => chatRoomUser.chatRoom?.id === chatRoom.id)
                .map(chatRoomUser => chatRoomUser.user);
            const authUser = await Auth.currentAuthenticatedUser();
            setUser(chatRoomUsers.find(user => user?.id !== authUser.attributes.sub) || null);
            setIsLoading(false);
        }
        fetchUsers();
        if (!chatRoom.chatRoomLastMessageId) {
            return;
        }
        DataStore.query(Message, chatRoom.chatRoomLastMessageId).then(setLastMessage);
    }, [])

    const onPress = () => {
        navigation.navigate('ChatRoom', {id: chatRoom?.id});
    }

    if (isLoading) {
        return <ActivityIndicator/>
    }

    const time = moment(lastMessage?.createdAt).from(moment());

    return (
        <Pressable onPress={onPress} style={styles.container}>
            <Image
                source={{uri: chatRoom?.imageUri || user?.imageUri || ""}}
                style={styles.image}
            />

            {!!chatRoom.newMessages && (
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{chatRoom.newMessages}</Text>
                </View>
            )}

            <View style={styles.rightContainer}>
                <View style={styles.row}>
                    <Text style={styles.name} numberOfLines={1}>{chatRoom?.name || user?.name}</Text>
                    <Text style={styles.text}>{time}</Text>
                </View>
                <Text numberOfLines={1} style={styles.text}>
                    {lastMessage?.content}
                </Text>
            </View>
        </Pressable>

    );
}