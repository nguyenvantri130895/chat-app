import React from "react";
import {Text, Pressable, View} from "react-native";
import {FontAwesome} from "@expo/vector-icons";

type NewGroupButtonProps = {
    onPress: () => void;
}

export default function NewGroupButton(props: NewGroupButtonProps) {
    const {onPress} = props;

    return (
        <Pressable onPress={onPress}>
            <View style={{flexDirection: 'row', padding: 10, alignItems: 'center'}}>
                <FontAwesome name="group" size={24} color="4f4f4f"/>
                <Text style={{marginLeft: 10, fontWeight: 'bold'}}>New Group</Text>
            </View>
        </Pressable>

    );
}