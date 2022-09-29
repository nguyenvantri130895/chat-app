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
            admin: dbUser,
            name: '',
            imageUri: ''
        }
        if (users.length > 1) {
            chatRoomData.name = 'New Group';
            chatRoomData.imageUri = 'data:image/png;base64,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';
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
