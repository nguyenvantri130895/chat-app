import styles from './styles';
import {ActivityIndicator, Text, useWindowDimensions, View} from "react-native";
import React, {useEffect, useState} from 'react';
import {User} from '../../src/models'
import {Auth, DataStore, Storage} from "aws-amplify";
import {S3Image} from 'aws-amplify-react-native'
import AudioPlayer from "../AudioPlayer";

const Message = ({message}) => {
    const {width} = useWindowDimensions();
    const [user, setUser] = useState<User | undefined>();
    const [isMe, setIsMe] = useState<boolean>(false);
    const [soundUri, setSoundUri] = useState<string | null>(null);

    useEffect(() => {
        DataStore.query(User, message.userID).then(setUser)
    }, [])

    useEffect(() => {
        if (message.audio) {
            Storage.get(message.audio).then(setSoundUri)
        }
    }, [message])

    useEffect(() => {
        const checkIfMe = async () => {
            if (!user) {
                return;
            }
            const authUser = await Auth.currentAuthenticatedUser();
            setIsMe(user.id === authUser.attributes.sub);
        }
        checkIfMe();
    }, [user])

    if (!user) {
        return <ActivityIndicator/>
    }

    return (
        <View
            style={[styles.container, isMe ? styles.leftContainer : styles.rightContainer]}>
            {message.image && (
                <View style={{marginBottom: message.content ? 10 : 0}}>
                    <S3Image
                        imgKey={message.image}
                        style={{width: width * 0.6, aspectRatio: 4 / 3}}
                        resizeMode={'contain'}
                    />
                </View>
            )}
            {soundUri && (
                <View style={{width: width * 0.6}}>
                    <AudioPlayer soundUri={soundUri}/>
                </View>
            )}
            {!!message.content && (
                <Text style={[styles.message, {color: isMe ? 'black' : 'white'}]}>{message.content}</Text>
            )}
        </View>
    )
}

export default Message;