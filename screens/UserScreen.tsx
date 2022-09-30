import {FlatList, Pressable, SafeAreaView, StyleSheet, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import UserItem from "../components/UserItem";
import {ChatRoom, ChatRoomUser, User} from '../src/models'
import {Auth, DataStore} from "aws-amplify";
import NewGroupButton from "../components/NewGroupButton";
import {useNavigation} from "@react-navigation/native";

export default function UserScreen() {
    const navigation = useNavigation();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [isNewGroup, setIsNewGroup] = useState(false);

    useEffect(() => {
        DataStore.query(User).then(setUsers);
    }, []);

    const addUserToChatRoom = async (user: User, chatRoom: ChatRoom) => {
        await DataStore.save(
            new ChatRoomUser({user, chatRoom})
        )
    }

    const createChatRoom = async (users: User[]) => {
        // Connect authenticated user with the chat room
        const authUser = await Auth.currentAuthenticatedUser();
        const dbUser = await DataStore.query(User, authUser.attributes.sub);

        // Create a chat room
        const chatRoomData = {
            newMessages: 0,
            Admin: dbUser,
            name: '',
            imageUri: ''
        }
        if (users.length > 1) {
            chatRoomData.name = 'New group';
            chatRoomData.imageUri = 'https://i.pinimg.com/564x/46/01/f7/4601f773e41c094849e10288a7aec5e8.jpg';
        }
        const newChatRoom = await DataStore.save(new ChatRoom(chatRoomData))

        if (dbUser) {
            await addUserToChatRoom(dbUser, newChatRoom);
        }

        // Connect clicked user with the chat room
        await Promise.all(
            users.map(user => addUserToChatRoom(user, newChatRoom))
        );
        // await DataStore.save(new ChatRoomUser({user, chatRoom: newChatRoom}));
        navigation.navigate('ChatRoom', {id: newChatRoom.id})
    }

    const isUserSelected = (user: User) => {
        return selectedUsers.some((selectedUser) => selectedUser.id === user.id)
    }

    const onUserPress = async (user: User) => {
        if (isNewGroup) {
            if (isUserSelected(user)) {
                setSelectedUsers([...selectedUsers.filter((selectedUser) => selectedUser.id !== user.id)]);
                return;
            }
            setSelectedUsers([...selectedUsers, user])
            return;
        }
        await createChatRoom([user]);
    }

    const saveGroup = async () => {
        await createChatRoom(selectedUsers);
    }

    return (
        <SafeAreaView style={styles.page}>
            <FlatList
                data={users}
                renderItem={({item}) => <UserItem user={item} onPress={() => onUserPress(item)}
                                                  isSelected={isNewGroup ? isUserSelected(item) : undefined}/>}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <NewGroupButton onPress={() => setIsNewGroup(!isNewGroup)}/>
                )}
            />
            {isNewGroup && (
                <Pressable style={styles.button} onPress={saveGroup}>
                    <Text style={styles.buttonText}>Save Group ({selectedUsers.length})</Text>
                </Pressable>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: "white",
        flex: 1,
    },
    button: {
        borderRadius: 10,
        backgroundColor: '#3777f0',
        marginHorizontal: 10,
        padding: 10,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    }
});
