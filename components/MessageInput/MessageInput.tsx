import styles from './styles';
import {Image, Platform, Pressable, TextInput, View} from "react-native";
import React, {useEffect, useState} from 'react';
import {AntDesign, Feather, Ionicons, MaterialCommunityIcons, SimpleLineIcons} from "@expo/vector-icons";
import {Auth, DataStore, Storage} from "aws-amplify";
import {Message, ChatRoom} from '../../src/models'
import EmojiSelector from 'react-native-emoji-selector'
import * as ImagePicker from 'expo-image-picker';
import {v4 as uuidv4} from 'uuid';

const MessageInput = ({chatRoom}) => {
    const [message, setMessage] = useState('');
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        (async () => {
            if (Platform.OS !== "web") {
                const libraryResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();
                const photoResponse = await ImagePicker.requestCameraPermissionsAsync();
                if (libraryResponse.status !== "granted" || photoResponse.status !== "granted") {
                    alert("Sorry, we need camera roll permissions to make this work!");
                }
            }
        })();
    }, [])

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setImage(result.uri);
        }
    };

    const takePhoto = async () => {
        // No permissions request is necessary for launching the image library
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            aspect: [4, 3],
        });

        if (!result.cancelled) {
            setImage(result.uri);
        }
    };

    const progressCallback = (progress) => {
        setProgress(progress.loaded / progress.total);
    }

    const sendImage = async () => {
        if (!image) {
            return null;
        }
        const blob = await getImageBlob();
        const {key} = await Storage.put(`${uuidv4()}.png`, blob, {progressCallback});
        await saveMessage(key);
        resetFields();
    }

    const getImageBlob = async () => {
        if (!image) {
            return null;
        }
        const response = await fetch(image);
        return await response.blob();
    }

    const sendMessage = async () => {
        await saveMessage();
        resetFields();
    }

    const updateLastMessage = async (newMessage: Message) => {
        if (chatRoom) {
            await DataStore.save(ChatRoom.copyOf(chatRoom, updatedLastMessage => {
                updatedLastMessage.lastMessage = newMessage;
            }))
        }
    }
    const onPlusClicked = () => {
        console.warn('On plus clicked')
    }
    const onPress = () => {
        if (image) {
            sendImage();
            return;
        }
        if (message) {
            sendMessage();
            return;
        }
        onPlusClicked();
    }

    const saveMessage = async (imgName?: string) => {
        const user = await Auth.currentAuthenticatedUser();
        const newMessage = await DataStore.save(new Message({
            content: message,
            image: imgName,
            userID: user.attributes.sub,
            chatroomID: chatRoom.id
        }))
        await updateLastMessage(newMessage);
    }

    const resetFields = () => {
        setMessage('');
        setIsEmojiPickerOpen(false);
        setImage(null);
        setProgress(0);
    }

    return (
        <View
            style={[styles.sendMessageArea, {height: isEmojiPickerOpen ? '50%' : 'auto'}]}
        >
            {image && (
                <View style={styles.sendImageContainer}>
                    <Image source={{uri: image}} style={{height: 100, width: 100, borderRadius: 10}}/>
                    <View style={{flex: 1, justifyContent: 'flex-start', alignSelf: 'flex-end'}}>
                        <View style={{
                            height: 5,
                            borderRadius: 5,
                            backgroundColor: '#3777f0',
                            width: `${progress * 100}%`
                        }}/>
                    </View>
                    <Pressable onPress={() => setImage(null)}>
                        <AntDesign name="close" size={24} color="black" style={{margin: 5}}/>
                    </Pressable>
                </View>
            )}
            <View style={styles.row}>
                <View style={styles.inputContainer}>
                    <Pressable onPress={() => setIsEmojiPickerOpen((currentValue) => !currentValue)}>
                        <SimpleLineIcons name={'emotsmile'} style={styles.icon}/>
                    </Pressable>
                    <TextInput style={styles.input} value={message} onChangeText={setMessage}
                               placeholder={'Signal message'}/>
                    <Pressable onPress={pickImage}>
                        <Feather name="image" style={styles.icon}/>
                    </Pressable>
                    <Pressable onPress={takePhoto}>
                        <Feather name="camera" style={styles.icon}/>
                    </Pressable>
                    <MaterialCommunityIcons name="microphone-outline" style={styles.icon}/>
                </View>
                <Pressable onPress={onPress} style={styles.buttonContainer}>
                    {message || image ? <Ionicons name="send" size={18} color="white"/> :
                        <AntDesign name="plus" size={24} color="white"/>}
                </Pressable>
            </View>

            {isEmojiPickerOpen && (
                <EmojiSelector onEmojiSelected={emoji => setMessage(currentMessage => currentMessage + emoji)}
                               columns={12}/>
            )}
        </View>
    )
}

export default MessageInput;