import {Feather} from '@expo/vector-icons';
import * as React from 'react';
import {Image, Text, useWindowDimensions, View} from 'react-native';
import {useEffect, useState} from "react";
import {Auth, DataStore} from "aws-amplify";
import {ChatRoomUser, User} from "../src/models";
import moment from "moment";

const ChatRoomHeader = ({id}) => {
    const {width} = useWindowDimensions();
    const [user, setUser] = useState<User | null>(null); // the display user

    useEffect(() => {
        if (!id) {
            return;
        }
        (async () => {
            const chatRoomUsers = (await DataStore.query(ChatRoomUser))
                .filter(chatRoomUser => chatRoomUser.chatRoom.id === id)
                .map(chatRoomUser => chatRoomUser.user);
            const authUser = await Auth.currentAuthenticatedUser();
            setUser(chatRoomUsers.find(user => user?.id !== authUser.attributes.sub) || null);
        })();
    }, []);

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
            <Image source={{uri: user?.imageUri || ''}}
                   style={{width: 30, height: 30, borderRadius: 30}}/>
            <View style={{flex: 1, marginLeft: 10}}>
                <Text style={{fontWeight: 'bold'}}>{user?.name}</Text>
                <Text>{getLastOnlineText()}</Text>
            </View>
            <Feather name="camera" size={24} color={'black'} style={{marginRight: 10}}/>
            <Feather name="edit-2" size={24} color={'black'}/>
        </View>
    )
}

export default ChatRoomHeader;
