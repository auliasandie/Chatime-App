import React from 'react';
import {StyleSheet} from 'react-native'


const styles = StyleSheet.create ({
    container : {
      flex : 1,
      justifyContent: 'center',
      backgroundColor: 'white',
      alignItems : 'center',
      justifyContent: 'center'
    },
    input: {
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      width: '80%',
      marginBottom: 10,
      borderRadius: 5,
      
    },
    inputMessage: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        width: '85%',
        marginBottom: 10,
        borderRadius: 20,
        
      },
    btnText : {
      color: 'darkblue',
      textAlign : 'center',
      fontSize: 18
    },
    bottomBar : {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        height: 60
    },
    sendButton : {
        alignItems: 'center',
        marginBottom: 10,
        marginLeft: 10, 
        height: 40, 
        width: 40, 
        paddingTop: 10, 
        paddingLeft: 5,
        backgroundColor: 'black',
        borderRadius: 20
    }
  })

  export default styles;