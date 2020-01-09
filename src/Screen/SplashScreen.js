import React, {Component} from 'react';
import {ActivityIndicator, StyleSheet, Text, View, ImageBackground} from 'react-native';
import {Image} from 'react-native';
import * as firebase from 'firebase';

export default class SplashScreen extends Component {
  componentDidMount() {
    setTimeout(() => {
        firebase.auth().onAuthStateChanged(user => {
          this.props.navigation.navigate(user ? "App" : "AuthScreen")
        });
      }, 2500)
    }
  

  render() {
    // console.log(AsyncStorage.getItem('jwt'))
    
    return (
        <View style={{backgroundColor: '#06ADBD', flex: 1}}>
        <ImageBackground source={require('../Assets/logochat.png')} style={{width:350, height:350, marginLeft: 45, marginTop: 180, alignItems: 'center', justifyContent:'center'}}></ImageBackground>
        {/* <View
          style={{
            height: 200,
            alignContent: 'center',
            justifyContent: 'center',
            top: 150,
          }}> */}
         
            <ActivityIndicator size="large" color="white" />
         
         
        </View>
    //   </View>
    );
  }
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   horizontal: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     padding: 10,
//   },
//   imageair: {
//     alignContent: 'center',
//     height: 90,
//     width: 90,
//     left: 160,
//     backgroundColor:'transparent',
//     top:40,

//     borderRadius: 15,
//   },
//   airkab:{
//     color: '#FF5A5F', fontSize: 30, textAlign: 'center'
//   }
// });