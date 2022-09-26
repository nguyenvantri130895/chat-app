import {FlatList, StyleSheet, Pressable, Text, View} from 'react-native';
import ChatRoomItem from "../components/ChatRoomItem";
import React, {useEffect, useState} from 'react';
import {Auth, DataStore} from "aws-amplify";
import {ChatRoomUser, ChatRoom} from "../src/models";

export default function HomeScreen() {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

    useEffect(() => {
        const fetchChatRooms = async () => {
            const userData = await Auth.currentAuthenticatedUser();
            const chatRooms = await DataStore.query(ChatRoomUser);
            const chatRoomsOfCurrentUser = chatRooms
                .filter(chatRoomUser => chatRoomUser.user?.id === userData.attributes.sub)
                .map(chatRoomUser => chatRoomUser.chatRoom);
            setChatRooms(chatRoomsOfCurrentUser);
        }
        fetchChatRooms();
    }, [])

    const logout = () => {
        Auth.signOut();
    };

    return (
        <View style={styles.page}>
            <FlatList
                data={chatRooms}
                renderItem={({item}) => <ChatRoomItem chatRoom={item}/>}
                showsVerticalScrollIndicator={false}
            />

            <Pressable
                onPress={logout}
                style={{
                    backgroundColor: "orange",
                    height: 50,
                    margin: 10,
                    borderRadius: 50,
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                <Text>Logout</Text>
            </Pressable>

        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: "white",
        flex: 1,
    },
});
