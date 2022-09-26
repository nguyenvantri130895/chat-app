import {FlatList, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import UserItem from "../components/UserItem";
import {User} from '../src/models'
import {DataStore} from "aws-amplify";

export default function UserScreen() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        (async () => {
            const fetchedUsers = await DataStore.query(User);
            setUsers(fetchedUsers);
        })();
    }, [])

    return (
        <View style={styles.page}>
            <FlatList
                data={users}
                renderItem={({item}) => <UserItem user={item}/>}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: "white",
        flex: 1,
    },
});
