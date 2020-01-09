import React, {Component} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ImageBackground,
} from 'react-native';
import {Image} from 'react-native';
import * as firebase from 'firebase';

export default class SplashScreen extends Component {
  componentDidMount() {
    setTimeout(() => {
      firebase.auth().onAuthStateChanged(user => {
        this.props.navigation.navigate(user ? 'App' : 'AuthScreen');
      });
    }, 2500);
  }

  render() {
    // console.log(AsyncStorage.getItem('jwt'))

    return (
      <View style={{backgroundColor: '#06ADBD', flex: 1}}>
        <ImageBackground
          source={require('../Assets/logochat.png')}
          style={{
            width: 350,
            height: 350,
            marginLeft: 45,
            marginTop: 180,
            alignItems: 'center',
            justifyContent: 'center',
          }}></ImageBackground>

        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }
}
