import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        padding: 10,
        margin: 10,
        borderRadius: 5,
        maxWidth: '75%',
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    leftContainer: {
        backgroundColor: 'lightgrey',
        marginLeft: 'auto',
        marginRight: 10
    },
    rightContainer: {
        backgroundColor: '#3777f0',
        marginLeft: 10,
        marginRight: 'auto'
    },
    message: {
      // color: "white"
    }
});

export default styles;