/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import {Feather} from '@expo/vector-icons';
import {NavigationContainer, DefaultTheme, DarkTheme, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import * as React from 'react';
import {ColorSchemeName, Image, Pressable, Text, useWindowDimensions, View} from 'react-native';

import NotFoundScreen from '../screens/NotFoundScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import {RootStackParamList} from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import UserScreen from '../screens/UserScreen';
import ChatRoomHeader from './ChatRoomHeader';
import GroupInfoScreen from '../screens/GroupInfoScreen';

export default function Navigation({colorScheme}: { colorScheme: ColorSchemeName }) {
    return (
        <NavigationContainer
            linking={LinkingConfiguration}
            theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootNavigator/>
        </NavigationContainer>
    );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
    // @ts-ignore
    // @ts-ignore
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} options={{headerTitle: HomeHeader}}/>
            <Stack.Screen name="UserScreen" component={UserScreen} options={{title: "Users"}}/>
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen}
                          options={(route) => ({
                              headerTitle: () => <ChatRoomHeader id={route.route.params?.id}/>,
                              headerBackTitleVisible: false,
                          })}/>
            <Stack.Screen name="GroupInfoScreen" component={GroupInfoScreen}/>
            <Stack.Screen name="NotFound" component={NotFoundScreen} options={{title: 'Oops!'}}/>
        </Stack.Navigator>
    );
}

const HomeHeader = () => {
    const {width} = useWindowDimensions();
    const navigation = useNavigation();

    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width,
            paddingHorizontal: 16,
            paddingVertical: 10,
            marginLeft: -16,
            alignItems: 'center'
        }}>
            <Image source={{uri: 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/elon.png'}}
                   style={{width: 30, height: 30, borderRadius: 30}}/>
            <Text style={{flex: 1, textAlign: 'center', marginLeft: 50}}>Home</Text>
            <Feather name="camera" size={24} color={'black'} style={{marginRight: 10}}/>
            <Pressable onPress={() => navigation.navigate('UserScreen')}>
                <Feather name="edit-2" size={24} color={'black'}/>
            </Pressable>
        </View>
    )
}
