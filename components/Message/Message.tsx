import styles from './styles';
import {ActivityIndicator, Pressable, Text, useWindowDimensions, View} from "react-native";
import React, {useEffect, useState} from 'react';
import {Message as MessageModel, MessageStatus, User} from '../../src/models'
import {Auth, DataStore, Storage} from "aws-amplify";
import {S3Image} from 'aws-amplify-react-native'
import AudioPlayer from "../AudioPlayer";
import {Ionicons} from "@expo/vector-icons";
import {OpType} from "@aws-amplify/datastore";
import MessageReply from "../MessageReply";

interface MessageProps {
    message: MessageModel;
    setAsMessageReply?: () => void;
}

const Message = (props: MessageProps) => {
    const {width} = useWindowDimensions();
    const {setAsMessageReply, message: propMessage} = props;

    const [message, setMessage] = useState<MessageModel>(propMessage);
    const [repliedTo, setRepliedTo] = useState<MessageModel | undefined>();
    const [user, setUser] = useState<User | undefined>();
    const [isMe, setIsMe] = useState<boolean | null>(null);
    const [soundUri, setSoundUri] = useState<string | null>(null);

    useEffect(() => {
        setMessage(propMessage);
    }, [propMessage]);

    useEffect(() => {
        if (message.replyToMessageID) {
            DataStore.query(MessageModel, message.replyToMessageID).then(setRepliedTo);
        }
    }, [message])

    useEffect(() => {
        DataStore.query(User, message.userID).then(setUser);

        const subscription = DataStore.observe(MessageModel, message.id).subscribe(msg => {
            if (msg.model === MessageModel && msg.opType === OpType.UPDATE) {
                setMessage(message => ({...message, ...msg.element}))
            }
        })
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        setAsRead();
    }, [isMe])

    useEffect(() => {
        if (message.audio) {
            Storage.get(message.audio).then(setSoundUri)
        }
    }, [message]);

    useEffect(() => {
        const checkIfMe = async () => {
            if (!user) {
                return;
            }
            const authUser = await Auth.currentAuthenticatedUser();
            setIsMe(user.id === authUser.attributes.sub);
        }
        checkIfMe();
    }, [user]);

    const setAsRead = async () => {
        if (isMe === false && message.status !== MessageStatus.READ) {
            await DataStore.save(MessageModel.copyOf(message, (updated) => {
                updated.status = MessageStatus.READ;
            }))
        }
    }

    if (!user) {
        return <ActivityIndicator/>
    }

    return (
        <Pressable
            onLongPress={setAsMessageReply}
            style={[styles.container, isMe ? styles.leftContainer : styles.rightContainer]}>
            <View style={styles.message}>
                {repliedTo && (<MessageReply message={repliedTo}/>)}
                {message.image && (
                    <View style={{marginBottom: message.content ? 10 : 0}}>
                        <S3Image
                            imgKey={message.image}
                            style={{width: width * 0.5, aspectRatio: 4 / 3}}
                            resizeMode={'contain'}
                        />
                    </View>
                )}
                {soundUri && (
                    <View style={{width: width * 0.5}}>
                        <AudioPlayer soundUri={soundUri}/>
                    </View>
                )}
                {!!message.content && (
                    <Text style={[styles.message, {color: isMe ? 'black' : 'white'}]}>{message.content}</Text>
                )}
            </View>
            {isMe && !!message.status && message.status !== MessageStatus.SENT && (
                <Ionicons name={message.status === MessageStatus.DELIVERED ? 'checkmark' : 'checkmark-done'} size={16}
                          color="gray"
                          style={{marginHorizontal: 5}}/>
            )}
        </Pressable>
    )
}

export default Message;