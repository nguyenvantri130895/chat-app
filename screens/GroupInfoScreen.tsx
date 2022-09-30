import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ChatRoom, ChatRoomUser, User} from "../src/models";
import {Auth, DataStore} from "aws-amplify";
import {useRoute} from "@react-navigation/native";
import UserItem from "../components/UserItem";

const GroupInfoScreen = () => {
    const route = useRoute();
    const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    useEffect(() => {
        fetchChatRoom();
        fetchUsers();
    }, []);

    const fetchChatRoom = async () => {
        if (!route.params?.id) {
            console.warn("No chatroom id provided");
            return;
        }
        const chatRoomData = await DataStore.query(ChatRoom, route.params?.id);
        if (!chatRoomData) {
            console.error("Couldn't find a chat room with this id");
            return;
        }
        setChatRoom(chatRoomData);
    }

    const fetchUsers = async () => {
        const fetchedUsers = (await DataStore.query(ChatRoomUser))
            .filter(chatRoomUser => chatRoomUser.chatRoom.id === route.params?.id)
            .map(chatRoomUser => chatRoomUser.user);
        setAllUsers(fetchedUsers);
    }

    const confirmDelete = async (user: User) => {
        const currentUser = await Auth.currentAuthenticatedUser();
        if (chatRoom?.Admin?.id !== currentUser.attributes.sub) {
            alert('You are not the admin of this group.');
            return;
        }

        if (user.id === chatRoom?.Admin?.id) {
            alert('You are the admin, you cannot delete yourself.');
            return;
        }
        // Alert.alert(
        //     'Confirm delete',
        //     `Are you sure you want to delete ${user.name} from the group.`,
        //     [
        //         {
        //             text: 'Delete',
        //             onPress: () => deleteUser(user),
        //             style: 'destructive'
        //         },
        //         {
        //             text: 'Cancel',
        //         }
        //     ]
        // )
        deleteUser(user);
    }

    const deleteUser = async (user: User) => {
        alert('Deleting user.');
        const chatRoomUsersToDelete =
            (await DataStore.query(ChatRoomUser))
                .filter(
                    cru => cru.chatRoom.id === chatRoom?.id && cru.user.id === user.id
                );
        console.log(chatRoomUsersToDelete);
        if (chatRoomUsersToDelete.length > 0) {
            await DataStore.delete(chatRoomUsersToDelete[0]);
            setAllUsers(allUsers.filter((u) => u.id !== user.id))
        }
    }

    return (
        <View style={styles.root}>
            <Text style={styles.title}>{chatRoom?.name}</Text>
            <Text style={styles.title}>Users ({allUsers.length})</Text>
            <FlatList data={allUsers}
                      renderItem={({item}) => (
                          <UserItem
                              user={item}
                              isAdmin={chatRoom?.Admin?.id === item.id}
                              onLongPress={() => confirmDelete(item)}
                          />
                      )}
            />
        </View>
    );
}

export default GroupInfoScreen;

const styles = StyleSheet.create({
    root: {
        backgroundColor: "white",
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10
    }
});
