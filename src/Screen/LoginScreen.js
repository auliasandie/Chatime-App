import React, {Component} from 'react';
import {StyleSheet, Text, Alert, TextInput, ToastAndroid, Platform, Button, View, ImageView, TouchableOpacity, PermissionsAndroid, ImageBackground} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import User from '../../User';
import {Db, Auth} from './Config';
import firebase from 'firebase';
import Geolocation from 'react-native-geolocation-service';
import {logoBg} from '../Assets/logoBg.png'

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
      ToastAndroid.show(
        'Location Permission Denied By User.',
        ToastAndroid.LONG,
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'Location Permission Revoked By User.',
        ToastAndroid.LONG,
      );
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

          console.log('latitude',response);
          this.props.navigation.navigate('App')
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
        {/* <ImageBackground source={require('../Assets/logoBg.png')} style={width:20, height:20, alignItems: 'center', justifyContent:'center'></ImageBackground> */}
        <Text style={styles.welcome}>CHATIME</Text>
        <Text style={{marginBottom:40, fontSize:20, fontWeight:'bold', color:"#06adbd", textAlign:'center'}}>Feel free to join CHATIME!</Text>
        <Text style={{marginBottom:40, fontSize:20, fontWeight:'bold', color:"#06adbd", textAlign:'center'}}>SIGN IN</Text>
          <View style={styles.form}>
            <View>
              <Text style={styles.inputTitle}> Email Address </Text>
              <TextInput
                style={styles.input}
                autoCapitalize='none'
                onChangeText={this.handleChange('email')}
              >
              </TextInput>
            </View>
            <View style={{marginTop: 22}}>
              <Text style={styles.inputTitle}> Password </Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                autoCapitalize='none'
                onChangeText={this.handleChange('password')}
                value={this.state.password}
              >
              </TextInput>
            </View>
          </View>
      {/*READY BUTTON SUBMIT*/}
          <View style={styles.errorMessage}>
          </View>
          <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
            <Text style={{color:'#FFF', fontWeight:'400'}}> Sign in </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("Register")}
            style={{alignSelf: 'center', marginTop:22}}
          >
            <Text style={{color: '#414959', fontSize: 13}}>
              New to Chatime? Feel Free to Sign up <Text style={{color: '#06adbd', fontWeight: '500'}}>Register Now</Text>
            </Text>
          </TouchableOpacity>
          {/* </ImageBackground> */}
        
      </>
    );
  }
};
const styles = StyleSheet.create({
  backgroundContainer:{
    flex: 1,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome:{
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    color:'white',
    marginTop:10,
    marginBottom: 120
  },
  errorMessage:{
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30
  },
  error: {
    color: '#E9446A',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center'
  },
  form: {
    marginHorizontal: 30,
  },
  inputTitle: {
    color: '#06adbd',
    fontSize: 10,
    textTransform: 'uppercase'
  },
  input: {
    borderBottomColor: '#06adbd',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 40,
    width:300,
    fontSize: 15,
    color: '#06adbd'
  },
  button: {
    marginHorizontal: 50,
    backgroundColor: '#06adbd',
    borderRadius: 4,
    height: 52,
    width:300,
    alignItems: 'center',
    justifyContent:'center'
  }
})

    

// const styles = StyleSheet.create ({
//   container : {
//     flex : 1,
//     justifyContent: 'center',
//     backgroundColor: 'white',
//     alignItems : 'center',
//     justifyContent: 'center'
//   },
//   input: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     width: '95%',
//     marginBottom: 10,
//     borderRadius: 5,
    
//   },
//   btnText : {
//     color: 'darkblue',
//     textAlign : 'center',
//     fontSize: 18
//   }
// })// import React, {Component} from 'react';
// import {StyleSheet, Text, Alert, TextInput, Button, View, ImageView, TouchableOpacity, PermissionsAndroid} from 'react-native';
// import AsyncStorage from '@react-native-community/async-storage';
// import User from '../../User';
// import {Db} from './Config';
// import firebase from 'firebase';
// import geolocation from 'react-native-geolocation-service';

// export default class LoginScreen extends Component {
//   state = {
//     phone: '',
//     name: '',
//     // image: User.image ? {uri: User.image} : require('../Assets/user.png'),
//   }
//   handleChange = key => val => {
//     this.setState({[key]: val})
//   }
// // export default class LoginScreen extends Component {
// //   constructor(){
// //     super()
    
// //     this.state = {
// //       phone : '',
// //       name : '',  
// //   }
// //   }
//   // getUserToken = async ()=>{
//   //   try {
//   //     const token = await AsyncStorage.getItem('userPhone')
//   //     // this.setState({phone : token.})
//   //     console.log('initoken',token)
//   //   } catch (error) {
//   //     console.log(error)
//   //   }
//   // }
//   // componentDidMount(){
//   //   this.getUserToken()
//   // }
//   // handleChange = key => val => {
//   // this.setState ({ [key] : val})
//   // }
//   submitForm = async () => {
//     if(this.state.phone.length < 10){
//       alert('Error', 'Wrong Phone Number')
//     } else if(this.state.name.length < 3) {
//       alert('Error', 'Wrong Name')
//     } else {
//     // alert(this.state.phone + '\n' + this.state.name)
//     try {
//       await AsyncStorage.setItem('userPhone',this.state.phone);
//       User.phone = this.state.phone;
//       Db.ref('users/' + User.phone).set({name: this.state.name, phone: this.state.phone})
//       // Db.ref('users/' + User.phone).set({image: this.state.image})
//       console.log('isi', this.state)
//         alert('success')
//         this.props.navigation.navigate('App')
//     } catch (error) {
//       console.log(error)
//     }
    
//     }
//   }
   
  
//   render() {
//     return (
//       <View style={styles.container}>
//         <TextInput
//         placeholder="Phone Number"
//         keyboardType="number-pad"
//         style={styles.input}
//         value={this.state.phone}
//         onChangeText={this.handleChange('phone')}
//         />
//         <TextInput
//         placeholder="Name"
//         style={styles.input}
//         value={this.state.name}
//         onChangeText={this.handleChange('name')}
//         />
//         {/* <Button onPress={this.submitForm} style={{backgroundColor:'#3F3D56',justifyContent:'center',marginTop:20,
//       alignItems:'center'}}>
//         <Text style={{fontWeight:'bold', color: '#fff'}}>Sign in</Text>
//       </Button>
//       <View style={{alignItems:'center'}}>  
//       <TouchableOpacity onPress={()=>props.navigation.navigate('Register')}>
//         <Text style={{fontSize:15,marginTop:30, color: '#4D535F'}}>
//           Don't have any account?<Text style={{fontWeight:'bold',color:'#57BFE6'}}> Register</Text>
//         </Text>
//       </TouchableOpacity>
//       </View> */}
//         <TouchableOpacity onPress={this.submitForm}>
//           <Text style={styles.btnText}>Enter</Text>
//         </TouchableOpacity>
//       </View>
//     )
//     }
// }

    

// const styles = StyleSheet.create ({
//   container : {
//     flex : 1,
//     justifyContent: 'center',
//     backgroundColor: 'white',
//     alignItems : 'center',
//     justifyContent: 'center'
//   },
//   input: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     width: '95%',
//     marginBottom: 10,
//     borderRadius: 5,
    
//   },
//   btnText : {
//     color: 'darkblue',
//     textAlign : 'center',
//     fontSize: 18
//   }
// })





// // // /**
// // //  * Sample React Native App
// // //  * https://github.com/facebook/react-native
// // //  *
// // //  * @format
// // //  * @flow
// // //  */

// // // import React from 'react';
// // // import {
// // //   SafeAreaView,
// // //   StyleSheet,
// // //   ScrollView,
// // //   View,
// // //   Text,
// // //   StatusBar,
// // // } from 'react-native';

// // // import {
// // //   Header,
// // //   LearnMoreLinks,
// // //   Colors,
// // //   DebugInstructions,
// // //   ReloadInstructions,
// // // } from 'react-native/Libraries/NewAppScreen';

// // // const App: () => React$Node = () => {
// // //   return (
// // //     <>
// // //       <StatusBar barStyle="dark-content" />
// // //       <SafeAreaView>
// // //         <ScrollView
// // //           contentInsetAdjustmentBehavior="automatic"
// // //           style={styles.scrollView}>
// // //           <Header />
// // //           {global.HermesInternal == null ? null : (
// // //             <View style={styles.engine}>
// // //               <Text style={styles.footer}>Engine: Hermes</Text>
// // //             </View>
// // //           )}
// // //           <View style={styles.body}>
// // //             <View style={styles.sectionContainer}>
// // //               <Text style={styles.sectionTitle}>Step One</Text>
// // //               <Text style={styles.sectionDescription}>
// // //                 Edit <Text style={styles.highlight}>App.js</Text> to change this
// // //                 screen and then come back to see your edits.
// // //               </Text>
// // //             </View>
// // //             <View style={styles.sectionContainer}>
// // //               <Text style={styles.sectionTitle}>See Your Changes</Text>
// // //               <Text style={styles.sectionDescription}>
// // //                 <ReloadInstructions />
// // //               </Text>
// // //             </View>
// // //             <View style={styles.sectionContainer}>
// // //               <Text style={styles.sectionTitle}>Debug</Text>
// // //               <Text style={styles.sectionDescription}>
// // //                 <DebugInstructions />
// // //               </Text>
// // //             </View>
// // //             <View style={styles.sectionContainer}>
// // //               <Text style={styles.sectionTitle}>Learn More</Text>
// // //               <Text style={styles.sectionDescription}>
// // //                 Read the docs to discover what to do next:
// // //               </Text>
// // //             </View>
// // //             <LearnMoreLinks />
// // //           </View>
// // //         </ScrollView>
// // //       </SafeAreaView>
// // //     </>
// // //   );
// // // };

// // // const styles = StyleSheet.create({
// // //   scrollView: {
// // //     backgroundColor: Colors.lighter,
// // //   },
// // //   engine: {
// // //     position: 'absolute',
// // //     right: 0,
// // //   },
// // //   body: {
// // //     backgroundColor: Colors.white,
// // //   },
// // //   sectionContainer: {
// // //     marginTop: 32,
// // //     paddingHorizontal: 24,
// // //   },
// // //   sectionTitle: {
// // //     fontSize: 24,
// // //     fontWeight: '600',
// // //     color: Colors.black,
// // //   },
// // //   sectionDescription: {
// // //     marginTop: 8,
// // //     fontSize: 18,
// // //     fontWeight: '400',
// // //     color: Colors.dark,
// // //   },
// // //   highlight: {
// // //     fontWeight: '700',
// // //   },
// // //   footer: {
// // //     color: Colors.dark,
// // //     fontSize: 12,
// // //     fontWeight: '600',
// // //     padding: 4,
// // //     paddingRight: 12,
// // //     textAlign: 'right',
// // //   },
// // // });

// // // export default App;

// // import React from 'react';
// // import {View, Text, StyleSheet, TextInput, TouchableOpacity} from 'react-native'
// // import * as firebase from 'firebase';
// // import {Db} from '../Screen/Config';
// // // import styles from '../Style/Style';

// // export  default class LoginScreen extends React.Component {
// //   state = {
// //     email: '',
// //     password: '',
// //     errorMessage: null
// //   };

// //   handleLogin = () => {
// //     const {password, email} = this.state
// //     firebase
// //     .auth().signInWithEmailAndPassword(email, password)
// //     .catch(error => this.setState({errorMessage: error.message})) 
// //   } 
// //   render(){
// //     return(
// //       <View style={styles.container}>
// //         <Text style={styles.greeting}>{`Hello again.\nWelcome back.`} </Text>
// //         <View style={styles.errorMessage}>
// //           {this.state.errorMessage && <Text style={styles.error} > {this.state.errorMessage}</Text>}
// //         </View>
        
        
// //         <View style={styles.form}>
// //           <View>
// //             <Text style={styles.inputTitle}>Email Address</Text>
// //             <TextInput style={styles.input} autoCapitalize='none' onChangeText={email => this.setState({email})}
// //             value={this.state.password} value={this.state.email}></TextInput>
// //         </View>
// //         {/* <View style={{marginTop: 32}}>
// //           <Text style={styles.inputTitle}>Phone</Text>
// //           <TextInput style={styles.input} keyboardType= 'number-pad' autoCapitalize="none"></TextInput>
// //         </View> */}
        

// //         <View style={{marginTop: 32}}>
// //           <Text style={styles.inputTitle}>Password</Text>
// //           <TextInput style={styles.input} secureTextEntry autoCapitalize='none' onChangeText={password => this.setState({password})}
// //             value={this.state.password}>
// //           </TextInput>
// //         </View>
// //         </View>
// //         <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
// //           <Text style={{color: '#FFF', fontWeight: "500" }}>Sign in</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity onPress={() => this.props.navigation.navigate("Register")} style={{alignSelf: "center", marginTop: 32}}>
// //           <Text style={{ color: "#414959", fontSize: 13}}>
// //             New to ChatApp? <Text style={{fontWeight: "500", color: "#E9446A"}}>Sign Up</Text>
// //           </Text>

// //         </TouchableOpacity>
// //       </View>
// //     )
// //   }
// // }

// // const styles = StyleSheet.create({
// //   container : {
// //     flex :1
// //   },
// //   greeting : {
// //     marginTop: 32,
// //     fontSize : 18,
// //     fontWeight: "400",
// //     textAlign: 'center'
// //   },
// //   errorMessage : {
// //     height: 32,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginHorizontal: 30
// //   },
// //   error : {
// //     color: "#E9446A",
// //     fontSize: 13,
// //     fontWeight: "600",
// //     textAlign: 'center'
// //   },
// //   form : {
// //     marginBottom: 48,
// //     marginHorizontal: 30
// //   },
// //   inputTitle : {
// //     color: "#8A8F9E",
// //     fontSize: 10,
// //     textTransform: 'uppercase'
// //   },
// //   input: {
// //     borderBottomColor: '#8A8F9E',
// //     borderBottomWidth: StyleSheet.hairlineWidth,
// //     height: 40,
// //     fontSize: 15,
// //     color: "#161F3D"
// //   },
// //   button: {
// //     marginHorizontal: 30,
// //     backgroundColor: "#E9446A",
// //     borderRadius: 4,
// //     height: 52,
// //     alignItems: 'center',
// //     justifyContent: 'center'
// //   }
// // })
