import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    sendMessageArea: {
        padding: 10,
    },
    sendImageContainer: {
        flexDirection: 'row',
        marginVertical: 10,
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 10,
        overflow: 'hidden'
    },
    row: {
        flexDirection: 'row'
    },
    inputContainer: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        borderRadius: 25,
        paddingHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    input: {
        flex: 1,
        paddingHorizontal: 5,
    },
    icon: {
        marginHorizontal: 5,
        color: '#595959',
        fontSize: 24
    },
    buttonContainer: {
        backgroundColor: '#3777f0',
        width: 40,
        height: 40,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10
    },
    iconButton: {
        color: 'white',
    }
});

export default styles;