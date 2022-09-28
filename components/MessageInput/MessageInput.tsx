import styles from './styles';
import {Image, Platform, Pressable, Text, TextInput, View} from "react-native";
import React, {useEffect, useState} from 'react';
import {AntDesign, Feather, Ionicons, MaterialCommunityIcons, SimpleLineIcons} from "@expo/vector-icons";
import {Auth, DataStore, Storage} from "aws-amplify";
import {ChatRoom, Message as MessageModel, Message, MessageStatus} from '../../src/models'
import EmojiSelector from 'react-native-emoji-selector'
import * as ImagePicker from 'expo-image-picker';
import {v4 as uuidv4} from 'uuid';
import {Audio, AVPlaybackStatus} from 'expo-av';
import MessageComponent from '../Message'

interface MessageInputProps {
    chatRoom: ChatRoom;
    messageReplyTo: MessageModel | null;
    removeMessageReplyTo: () => void;
}

const MessageInput = (props: MessageInputProps) => {
    const {chatRoom, messageReplyTo, removeMessageReplyTo} = props;
    const [message, setMessage] = useState('');
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [soundUri, setSoundUri] = useState<string | null>(null);
    const [pause, setPause] = useState(true);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);

    useEffect(() => {
        (async () => {
            if (Platform.OS !== "web") {
                const libraryResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();
                const photoResponse = await ImagePicker.requestCameraPermissionsAsync();
                await Audio.requestPermissionsAsync();
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

    const progressCallback = (progress: ProgressEvent) => {
        setProgress(progress.loaded / progress.total);
    }

    const sendImage = async () => {
        if (!image) {
            return;
        }
        const blob = await getBlob(image);
        const {key} = await Storage.put(`${uuidv4()}.png`, blob, {progressCallback});
        await saveMessage(key);
        resetFields();
    }

    const getBlob = async (uri: string) => {
        const response = await fetch(uri);
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
        if (soundUri) {
            sendAudio();
            return;
        }
        if (message) {
            sendMessage();
            return;
        }
        onPlusClicked();
    }

    const saveMessage = async (imgName?: string, audioName?: string) => {
        const user = await Auth.currentAuthenticatedUser();
        const newMessage = await DataStore.save(new Message({
            content: message,
            image: imgName,
            audio: audioName,
            userID: user.attributes.sub,
            chatroomID: chatRoom.id,
            status: MessageStatus.SENT,
            replyToMessageID: messageReplyTo?.id
        }))
        await updateLastMessage(newMessage);
    }

    const resetFields = () => {
        setMessage('');
        setIsEmojiPickerOpen(false);
        setImage(null);
        setProgress(0);
        setSoundUri(null);
        setSound(null);
        removeMessageReplyTo();
    }

    // Audio
    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
            return;
        }
        setAudioProgress(status.positionMillis / (status.durationMillis || 1));
        setPause(!status.isPlaying);
        setAudioDuration(status.positionMillis || 0);
    }

    const startRecording = async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording..');
            const {recording} = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    const stopRecording = async () => {
        console.log('Stopping recording..');
        if (!recording) {
            return;
        }
        setRecording(null);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setSoundUri(uri);
        console.log('Recording stopped and stored at', uri);

        if (!uri) {
            return;
        }
        const {sound} = await Audio.Sound.createAsync({uri}, {}, onPlaybackStatusUpdate);
        setSound(sound);
    }

    const playPauseSound = async () => {
        if (!sound) {
            return;
        }
        if (pause) {
            setPause(false);
            await sound.playAsync();
            return;
        }
        setPause(true);
        await sound.pauseAsync();
    }

    const getDuration = () => {
        const minutes = Math.floor(audioDuration / (60 * 1000));
        const second = Math.floor(audioDuration % (60 * 1000) / 1000);
        return `${minutes}:${second < 10 ? '0' : ''}${second}`;
    }

    const sendAudio = async () => {
        if (!soundUri) {
            return;
        }
        let uriParts;
        let extension;
        if (Platform.OS === 'web') {
            extension = 'mp3';
        } else {
            uriParts = soundUri.split('.');
            extension = uriParts[uriParts.length - 1];
        }
        const blob = await getBlob(soundUri);
        const {key} = await Storage.put(`${uuidv4()}.${extension}`, blob, {progressCallback});
        await saveMessage(undefined, key);
        resetFields();
    }

    return (
        <View
            style={[styles.sendMessageArea, {height: isEmojiPickerOpen ? '50%' : 'auto'}]}
        >
            {messageReplyTo && (
                <View style={{backgroundColor: '#f2f2f2', padding: 5, flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                        <Text>Reply to:</Text>
                        <MessageComponent message={messageReplyTo}/>
                    </View>
                    <Pressable onPress={() => removeMessageReplyTo()}>
                        <AntDesign name="close" size={24} color="black" style={{margin: 5}}/>
                    </Pressable>
                </View>

            )}
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

            {sound && (
                <View style={styles.sendAudioContainer}>
                    <Pressable onPress={playPauseSound}>
                        <Feather name={pause ? 'play' : 'pause'} size={24} color="gray"/>
                    </Pressable>
                    <View style={styles.audioProgressBG}>
                        <View style={[styles.audioProgressFG, {left: `${audioProgress * 100}%`}]}></View>
                    </View>
                    <Text style={styles.audioDuration}>{getDuration()}</Text>
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
                    <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
                        <MaterialCommunityIcons name={recording ? "microphone" : "microphone-outline"}
                                                style={styles.icon} color={recording ? "red" : "#595959"}/>
                    </Pressable>
                </View>
                <Pressable onPress={onPress} style={styles.buttonContainer}>
                    {message || image || soundUri ? <Ionicons name="send" size={18} color="white"/> :
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