import React from "react";
import {Text, Image, View, Pressable} from "react-native";
import styles from "./styles";
import {User} from "../../src/models";
import {Feather} from "@expo/vector-icons";

type UserItemProps = {
    user: User;
    onPress?: () => void;
    isSelected?: boolean;
    isAdmin?: boolean;
    onLongPress?: () => void;
}

export default function UserItem(props: UserItemProps) {
    const {user, onPress, isSelected, isAdmin = false, onLongPress} = props;

    return (
        <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.container}>
            <Image
                source={{uri: user?.imageUri || ''}}
                style={styles.image}
            />

            <View style={styles.rightContainer}>
                <Text style={styles.name}>{user.name}</Text>
                {isAdmin && <Text>Admin</Text>}
            </View>
            {isSelected !== undefined && (
                <Feather name={isSelected ? 'check-circle' : 'circle'} size={20} color="#4f4f4f"/>
            )}
        </Pressable>

    );
}