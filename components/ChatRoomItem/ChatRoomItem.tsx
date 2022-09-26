import React, {useEffect, useState} from "react";
import {Text, Image, View, Pressable, ActivityIndicator} from "react-native";
import styles from "./styles";
import {useNavigation} from "@react-navigation/native";
import {User, ChatRoom, ChatRoomUser, Message} from "../../src/models";
import {Auth, DataStore} from "aws-amplify";

export default function ChatRoomItem({chatRoom}) {
    const [user, setUser] = useState<User | null>(null); // the display user
    const [lastMessage, setLastMessage] = useState<Message | undefined>();

    const navigation = useNavigation();
    useEffect(() => {
        const fetchUsers = async () => {
            const chatRoomUsers = (await DataStore.query(ChatRoomUser))
                .filter(chatRoomUser => chatRoomUser.chatRoom?.id === chatRoom.id)
                .map(chatRoomUser => chatRoomUser.user);
            const authUser = await Auth.currentAuthenticatedUser();
            setUser(chatRoomUsers.find(user => user?.id !== authUser.attributes.sub) || null);
        }
        fetchUsers();
        if (!chatRoom.chatRoomLastMessageId) {
            return;
        }
        DataStore.query(Message, chatRoom.chatRoomLastMessageId).then(setLastMessage);
    }, [])

    const onPress = () => {
        navigation.navigate('ChatRoom', {id: chatRoom.id});
    }

    if (!user) {
        return <ActivityIndicator/>
    }

    return (
        <Pressable onPress={onPress} style={styles.container}>
            <Image
                source={{uri: user?.imageUri || ""}}
                style={styles.image}
            />

            {!!chatRoom.newMessages && (
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{chatRoom.newMessages}</Text>
                </View>
            )}

            <View style={styles.rightContainer}>
                <View style={styles.row}>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.text}>{lastMessage?.createdAt}</Text>
                </View>
                <Text numberOfLines={1} style={styles.text}>
                    {lastMessage?.content}
                </Text>
            </View>
        </Pressable>

    );
}