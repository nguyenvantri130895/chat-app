import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
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
        backgroundColor: 'white'
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
    }
});

export default styles;