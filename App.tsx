import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import  Amplify  from 'aws-amplify';
import awsconfig from './src/aws-exports';
import { withAuthenticator } from 'aws-amplify-react-native';

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

    if (!isLoadingComplete) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <Navigation colorScheme={colorScheme} />
            <StatusBar />
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
