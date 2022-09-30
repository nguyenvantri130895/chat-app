import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import Amplify, {Auth, DataStore, Hub} from 'aws-amplify';
import awsconfig from './src/aws-exports';
import {withAuthenticator} from 'aws-amplify-react-native';
import {useEffect, useState} from "react";
import {Message, MessageStatus, User} from "./src/models";
import {OpType} from "@aws-amplify/datastore";
import {ActionSheetProvider} from "@expo/react-native-action-sheet";

// Disable analytics
Amplify.configure({
    ...awsconfig,
    Analytics: {
        disabled: true
    }
});

const ONE_MINUTE = 60 * 1000;

function App() {
    const isLoadingComplete = useCachedResources();
    const colorScheme = useColorScheme();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUser();
        // Create listener
        const listener = Hub.listen('datastore', async hubData => {
            const {event, data} = hubData.payload;
            if (event === 'networkStatus') {
                console.log(`User has a network connection: ${data.active}`)
            }
            if (event === 'outboxMutationProcessed'
                && data.model === Message
                && !([MessageStatus.DELIVERED, MessageStatus.READ].includes(data.element.status))) {
                // set the message status to delivered
                await DataStore.save(Message.copyOf(data.element, (updated) => {
                    updated.status = MessageStatus.DELIVERED;
                }))
            }
        })

        // Remove listener
        return () => listener();
    }, [])

    useEffect(() => {
        if (!user) {
            return;
        }
        const subscription = DataStore.observe(User, user.id).subscribe(curUser => {
            if (curUser.model === User && curUser.opType === OpType.UPDATE) {
                setUser(curUser.element);
            }
        })

        return () => subscription.unsubscribe();
    }, [user?.id]);

    useEffect(() => {
        const interval = setInterval(async () => {
            await updateLastOnline();
        }, ONE_MINUTE);
        return () => clearInterval(interval);
    }, [user]);

    const fetchUser = async () => {
        const userData = await Auth.currentAuthenticatedUser();
        const currentUser = await DataStore.query(User, userData.attributes.sub);
        if (currentUser) {
            setUser(currentUser);
        }
    }

    const updateLastOnline = async () => {
        if (!user) {
            return;
        }
        await DataStore.save(User.copyOf(user, (updated) => {
            updated.lastOnlineAt = +new Date();
        }))
    }

    if (!isLoadingComplete) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <ActionSheetProvider>
                <Navigation colorScheme={colorScheme}/>
            </ActionSheetProvider>
            <StatusBar/>
        </SafeAreaProvider>
    );
}

export default withAuthenticator(App, {
    usernameAttributes: 'email',
    signUpConfig: {
        hiddenDefaults: ['phone_number'],
        signUpFields: [
            {
                label: 'Email',
                key: 'email',
                required: true,
                displayOrder: 1
            },
            {
                label: 'Password',
                key: 'password',
                required: true,
                displayOrder: 2,
                type: 'password'
            },
            {
                label: 'Name',
                key: 'name',
                required: true,
                displayOrder: 3
            }
        ]
    }
});
