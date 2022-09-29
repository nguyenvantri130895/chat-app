import {Feather} from '@expo/vector-icons';
import * as React from 'react';
import {Image, Pressable, Text, useWindowDimensions, View} from 'react-native';
import {useEffect, useState} from "react";
import {Auth, DataStore} from "aws-amplify";
import {ChatRoomUser, User, ChatRoom} from "../src/models";
import moment from "moment";
import {useNavigation} from "@react-navigation/native";

type ChatRoomHeaderProps = {
    id: string;
}

const ChatRoomHeader = (props: ChatRoomHeaderProps) => {
    const {id} = props;
    const {width} = useWindowDimensions();
    const [user, setUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [chatRoom, setChatRoom] = useState<ChatRoom | undefined>();

    const navigation = useNavigation();

    const fetchUsers = async () => {
        const fetchedUsers = (await DataStore.query(ChatRoomUser))
            .filter(chatRoomUser => chatRoomUser.chatRoom.id === id)
            .map(chatRoomUser => chatRoomUser.user);
        setAllUsers(fetchedUsers);
        const authUser = await Auth.currentAuthenticatedUser();
        setUser(fetchedUsers.find(user => user?.id !== authUser.attributes.sub) || null);
    }

    const fetchChatRoom = async () => {
        await DataStore.query(ChatRoom, id).then(setChatRoom);
    }

    useEffect(() => {
        if (!id) {
            return;
        }
        fetchUsers();
        fetchChatRoom();
    }, []);

    const isGroup = () => {
        return allUsers.length > 2;
    }

    const getUsernames = () => {
        return allUsers.map(user => user.name).join(', ');
    }

    const getLastOnlineText = () => {
        if (!user?.lastOnlineAt) {
            return null;
        }
        // if lastOnlineAt is less than 5 minutes ago, show him as ONLINE
        const lastOnlineDiffMS = moment().diff(moment(user.lastOnlineAt));
        if (lastOnlineDiffMS < 5 * 60 * 1000) {
            return 'Online';
        }
        return `Last seen online ${moment(user.lastOnlineAt).fromNow()}`
    }

    const openInfo = () => {
        navigation.navigate('GroupInfoScreen', {id})
    }

    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: width - 40,
            paddingHorizontal: 16,
            paddingVertical: 10,
            marginLeft: -40,
            alignItems: 'center'
        }}>
            <Image source={{uri: chatRoom?.imageUri || user?.imageUri || ''}}
                   style={{width: 30, height: 30, borderRadius: 30}}/>
            <Pressable onPress={openInfo} style={{flex: 1, marginLeft: 10}}>
                <Text style={{fontWeight: 'bold'}}>{chatRoom?.name || user?.name}</Text>
                <Text numberOfLines={1}>{isGroup() ? getUsernames() : getLastOnlineText()}</Text>
            </Pressable>
            <Feather name="camera" size={24} color={'black'} style={{marginRight: 10}}/>
            <Feather name="edit-2" size={24} color={'black'}/>
        </View>
    )
}

export default ChatRoomHeader;
