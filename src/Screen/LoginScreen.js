import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  Alert,
  TextInput,
  ToastAndroid,
  Platform,
  Button,
  View,
  ImageView,
  TouchableOpacity,
  PermissionsAndroid,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import User from '../../User';
import {Db, Auth} from './Config';
import firebase from 'firebase';
import Geolocation from 'react-native-geolocation-service';
import {logoBg} from '../Assets/logoBg.png';

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      email: '',
      password: '',
      errorMessage: null,
    };
  }

  //GET LOCATION
  componentDidMount = async () => {
    this._isMounted = true;
    await this.getLocation();
  };

  componentWillUnmount() {
    this._isMounted = false;
    Geolocation.clearWatch();
    Geolocation.stopObserving();
  }

  inputHandler = (name, value) => {
    this.setState(() => ({[name]: value}));
  };

  //GET LOCATION PERMISSIONS

  hasLocationPermission = async () => {
    if (
      Platform.OS === 'ios' ||
      (Platform.OS === 'android' && Platform.Version < 23)
    ) {
      return true;
    }
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (hasPermission) {
      return true;
    }
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }
    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show('Location Permission Rejected', ToastAndroid.LONG);
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show('Location Permission Revoked', ToastAndroid.LONG);
    }
    return false;
  };

  // SET LOCATION //
  getLocation = async () => {
    const hasLocationPermission = await this.hasLocationPermission();

    if (!hasLocationPermission) {
      return;
    }

    this.setState({loading: true}, () => {
      Geolocation.getCurrentPosition(
        position => {
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            loading: false,
          });
        },
        error => {
          this.setState({errorMessage: error});
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 8000,
          distanceFilter: 50,
          forceRequestLocation: true,
        },
      );
    });
  };

  handleChange = key => val => {
    this.setState({[key]: val});
  };
  handleLogin = async () => {
    const {email, password} = this.state;
    if (email.length < 6) {
      ToastAndroid.show(
        'Please input a valid email address',
        ToastAndroid.LONG,
      );
    } else if (password.length < 6) {
      ToastAndroid.show(
        'Password must be at least 6 characters',
        ToastAndroid.LONG,
      );
    } else {
      Db.ref('users/')
        .orderByChild('/email')
        .equalTo(email)
        .once('value', result => {
          let data = result.val();
          if (data !== null) {
            let user = Object.values(data);

            AsyncStorage.setItem('user.email', user[0].email);
            AsyncStorage.setItem('user.name', user[0].name);
            AsyncStorage.setItem('user.photo', user[0].photo);
          }
        });

      Auth.signInWithEmailAndPassword(email, password)
        .then(async response => {
          Db.ref('/users/' + response.user.uid).update({
            status: 'Online',
            latitude: this.state.latitude || null,
            longitude: this.state.longitude || null,
          });

          ToastAndroid.show('Login success', ToastAndroid.LONG);
          await AsyncStorage.setItem('userid', response.user.uid);
          await AsyncStorage.setItem('user', JSON.stringify(response.user));

          console.log('latitude', response);
          this.props.navigation.navigate('App');
        })
        .catch(error => {
          console.warn(error);
          this.setState({
            errorMessage: error.message,
            email: '',
            password: '',
          });
          ToastAndroid.show(this.state.errorMessage, ToastAndroid.LONG);
        });
    }
  };
  render() {
    return (
      <>
        <View style={{backgroundColor: '#06ADBD', flex: 1}}>
          <ImageBackground
            source={require('../Assets/logochat.png')}
            style={{
              width: 200,
              height: 200,
              marginLeft: 110,
              alignItems: 'center',
              justifyContent: 'center',
            }}></ImageBackground>
          {/* <Text style={styles.welcome}>CHATIME</Text> */}
          <Text
            style={{
              marginBottom: 40,
              fontSize: 20,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              marginTop: 30,
            }}>
            Welcome to Chatime, Good People!
          </Text>
          <Text
            style={{
              marginBottom: 40,
              fontSize: 20,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
            }}>
            SIGN IN
          </Text>
          <View style={styles.form}>
            <View>
              <Text style={styles.inputTitle}> Email Address </Text>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                onChangeText={this.handleChange('email')}></TextInput>
            </View>
            <View style={{marginTop: 22}}>
              <Text style={styles.inputTitle}> Password </Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                onChangeText={this.handleChange('password')}
                value={this.state.password}></TextInput>
            </View>
          </View>
          {/*READY BUTTON SUBMIT*/}
          <View style={styles.errorMessage}></View>
          <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
            <Text style={{color: '#FFF', fontWeight: '400', fontSize: 18}}>
              {' '}
              Sign in{' '}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Register')}
            style={{alignSelf: 'center', marginTop: 22}}>
            <Text style={{color: '#414959', fontSize: 13}}>
              New to Chatime? Feel Free to Sign up{' '}
              <Text style={{color: 'white', fontWeight: '500'}}>
                Register Now
              </Text>
            </Text>
          </TouchableOpacity>
          {/* </ImageBackground> */}
        </View>
      </>
    );
  }
}
const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    color: 'white',
    marginTop: 10,
    marginBottom: 120,
  },
  errorMessage: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  error: {
    color: '#E9446A',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  form: {
    marginHorizontal: 50,
  },
  inputTitle: {
    color: 'white',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  input: {
    borderBottomColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 40,
    width: 300,
    fontSize: 15,
    color: 'white',
  },
  button: {
    marginHorizontal: 50,
    backgroundColor: '#F5BCD6',
    borderRadius: 4,
    height: 52,
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
