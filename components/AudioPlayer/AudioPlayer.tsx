import styles from './styles';
import {Pressable, View, Text} from "react-native";
import React, {useEffect, useState} from 'react';
import {Feather} from "@expo/vector-icons";
import {Audio, AVPlaybackStatus} from 'expo-av';

const AudioPlayer = ({soundUri}) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [pause, setPause] = useState(true);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);

    useEffect(() => {
        loadSound();
        () => {
            if (sound) {
                sound.unloadAsync();
            }
        }
    }, [soundUri])

    const loadSound = async () => {
        if (!soundUri) {
            return;
        }
        const {sound} = await Audio.Sound.createAsync({uri: soundUri}, {}, onPlaybackStatusUpdate);
        setSound(sound);
    }

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
            return;
        }
        setAudioProgress(status.positionMillis / (status.durationMillis || 1));
        setPause(!status.isPlaying);
        setAudioDuration(status.positionMillis || 0);
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

    return (
        <View style={styles.sendAudioContainer}>
            <Pressable onPress={playPauseSound}>
                <Feather name={pause ? 'play' : 'pause'} size={24} color="gray"/>
            </Pressable>
            <View style={styles.audioProgressBG}>
                <View style={[styles.audioProgressFG, {left: `${audioProgress * 100}%`}]}></View>
            </View>
            <Text style={styles.audioDuration}>{getDuration()}</Text>
        </View>
    )
}

export default AudioPlayer;