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
    sendAudioContainer: {
        flexDirection: 'row',
        marginVertical: 10,
        padding: 10,
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 10,
    },
    audioProgressBG: {
        flex: 1,
        height: 3,
        backgroundColor: 'lightgray',
        borderRadius: 5,
        marginLeft: 10
    },
    audioProgressFG: {
        width: 10,
        height: 10,
        borderRadius: 10,
        backgroundColor: "#3777f0",
        position: 'absolute',
        top: -3
    },
    audioDuration: {
      marginLeft: 20
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