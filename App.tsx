import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import Amplify, {DataStore, Hub} from 'aws-amplify';
import awsconfig from './src/aws-exports';
import {withAuthenticator} from 'aws-amplify-react-native';
import {useEffect} from "react";
import {Message, MessageStatus} from "./src/models";

// Disable analytics
Amplify.configure({
    ...awsconfig,
    Analytics: {
        disabled: true
    }
});

function App() {
    const isLoadingComplete = useCachedResources();
    const colorScheme = useColorScheme();

    useEffect(() => {
        // Create listener
        const listener = Hub.listen('datastore', async hubData => {
            const {event, data} = hubData.payload;
            if (event === 'networkStatus') {
                console.log(`User has a network connection: ${data.active}`)
            }
            if (event === 'outboxMutationProcessed'
                && data.model === Message
                && !([MessageStatus.DELIVERED, MessageStatus.READ].includes(data.element.status))) {
                if (data.model === Message) {
                    // set the message status to delivered
                    await DataStore.save(Message.copyOf(data.element, (updated) => {
                        updated.status = MessageStatus.DELIVERED;
                    }))
                }
            }
        })

        // Remove listener
        return () => listener();
    })

    if (!isLoadingComplete) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <Navigation colorScheme={colorScheme}/>
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
