import React from 'react';
import { View,
  Text,
  Image,
  ToastAndroid,
  PermissionsAndroid,
  Dimensions,
  TouchableOpacity,
  TextInput,
  BackHandler,
  StyleSheet
} from 'react-native';

// import {user} from '../Assets/user.png';
import Icon from 'react-native-vector-icons/Ionicons'

import { Dialog } from 'react-native-simple-dialogs';
import * as firebase from 'firebase';
import AsyncStorage from '@react-native-community/async-storage';
import Geolocation from 'react-native-geolocation-service';
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker from 'react-native-image-picker';
import Geocoder from 'react-native-geocoding';
import {Db, Auth} from './Config';

export default class ProfileScreen extends React.Component {
  constructor(props) {
   super(props)
    this.state = {
      userId: null,
      permissionsGranted: null,
      errorMessage: null,
      loading: false,
      updatesEnabled: false,
      location: [],
      photo: null,
      imageUri: null,
      imgSource: '',
      uploading: false,
      dialogVisible: false,
      city:''
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

    setDialogVisible(visible) {
      this.setState({dialogVisible: visible});
    }

    // {/* BACK HANDLER */}
      UNSAFE_componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
      }

      componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
      }

      handleBackButtonClick() {
        this.props.navigation.goBack(null);
        return true;
      }

    componentDidMount = async () => {
        console.log('ini uid', AsyncStorage.getItem('userid'))
      const userId = await AsyncStorage.getItem('userid');
      const userName = await AsyncStorage.getItem('user.name');
      const userAvatar = await AsyncStorage.getItem('user.photo');
      const userEmail = await AsyncStorage.getItem('user.email');
      this.setState({userId, userName, userAvatar, userEmail});
    

     
 
      firebase.database()
      .ref(`/users/${userId}`)
      .on('value', (snapshot) => {
        let data = snapshot.val();
        let location = Object.values(data);
        this.setState({location});
      });

    //   fetch('https://us1.locationiq.com/v1/reverse.php?key=d17151587b1e23&lat=' + this.state.location[2] + '&lon=' + this.state.location[3] + '&format=json')
    //     .then((response) => response.json()) 
    //     .then((responseJson) => {
    //       this.setState({city: responseJson.address.state_district})
    //   })

    };
  

    requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.CAMERA,
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            ])
            return granted === PermissionsAndroid.RESULTS.GRANTED
        } catch (err) {
            console.log(err);
            return false
        }
    };

    changeImage = async type => {
    const Blob = RNFetchBlob.polyfill.Blob;
    const fs = RNFetchBlob.fs;
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
    window.Blob = Blob;

    const options = {
      title: 'Select Avatar',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      mediaType: 'photo',
    };

    let cameraPermission =
      (await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)) &&
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ) &&
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
    if (!cameraPermission) { console.log('camera');
      cameraPermission = await this.requestCameraPermission();
    } else { console.log('image');
      ImagePicker.showImagePicker(options, response => {
        ToastAndroid.show(
          'Rest asure, your photo is flying to the shiny cloud',
          ToastAndroid.LONG,
        );
        let uploadBob = null;
        const imageRef = firebase
          .storage()
          .ref('avatar/' + this.state.userId)
          .child('photo');
        fs.readFile(response.path, 'base64')
          .then(data => {
            return Blob.build(data, {type: `${response.mime};BASE64`});
          })
          .then(blob => {
            uploadBob = blob;
            return imageRef.put(blob, {contentType: `${response.mime}`});
          })
          .then(() => {
            uploadBob.close();
            return imageRef.getDownloadURL();
          })
          .then(url => {
            ToastAndroid.show(
              'Your cool avatar is being uploaded, its going back to your phone now',
              ToastAndroid.LONG,
            );
            firebase
              .database()
              .ref('users/' + this.state.userId)
              .update({photo: url});
            this.setState({userAvatar: url});
            AsyncStorage.setItem('user.photo', this.state.userAvatar);
          })

          .catch(err => console.log(err));
      })
    }
  }
  handleLogout = async () => {
    await AsyncStorage.getItem('userid')
      .then(async userid => {
        Db.ref('users/' + userid).update({
          status: 'Offline',
        });
        await AsyncStorage.clear();
        Auth.signOut();
        ToastAndroid.show('logout Successful', ToastAndroid.LONG);
        this.props.navigation.navigate('Login');
      })
      .catch(error => this.setState({errorMessage: error.message}));
  };

  render(){
    return (
      <>
        {/* <Dialog
          visible={this.state.dialogVisible}
          title="Insert Your Name"
          onTouchOutside={() => this.setState({dialogVisible: false})} >
          <View>
              <TextInput style={{borderBottomColor: '#694be2', borderBottomWidth: 2, height: 40, width:300, fontSize: 15,color: '#694be2'}}
                autoCapitalize='none'
              >
            </TextInput>
          </View>

          <View style={{marginTop: 20, flexDirection:'row'}} >
            <TouchableOpacity onPress={() => {this.setDialogVisible(!this.state.dialogVisible);}}
              style={{width:50, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#694be2', alignItems:'center', justifyContent:'center'}}>
              <Text style={{fontWeight:'bold'}}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{marginLeft:10,width:50, height: 30, borderRadius: 8, backgroundColor: '#694be2', alignItems:'center', justifyContent:'center'}}>
              <Text style={{fontWeight:'bold', color:'#FFF'}}>Edit</Text>
            </TouchableOpacity>
          </View>
        </Dialog> */}

        <View style={{height:270}}>
          <Image source={{uri: this.state.userAvatar}}
            style={{height: 270,}}
          />
        </View>
        <View style={{flexDirection:'row', justifyContent:'space-between', marginHorizontal:28, marginTop:45}} >
          <View>
            <Text style={{fontSize:16, color:'grey', letterSpacing:2}}>Full Name</Text>
            <Text style={{fontSize:23, fontWeight:'500', letterSpacing:1, color:'#404040'}}>{this.state.userName}</Text>
          </View>
          <View style={{justifyContent:'center', alignItems:'center'}}>
          </View>
        </View>

        <View style={{flexDirection:'row', justifyContent:'space-between', marginHorizontal:28, marginTop:30}} >
          <View>
            <Text style={{fontSize:16, color:'grey', letterSpacing:2}}>Email</Text>
            <Text style={{fontSize:23, fontWeight:'500', letterSpacing:1, color:'#404040'}}>{this.state.userEmail}</Text>
          </View>
          <View style={{justifyContent:'center'}}>
            {/* <Icon name={'ios-mail-unread'} size={18} color={'#404040'}/> */}
          </View>
        </View>

        <View style={{flexDirection:'row', justifyContent:'space-between', marginHorizontal:28, marginTop:30}} >
          {/* <View>
            <Text style={{fontSize:16, color:'grey', letterSpacing:2}}>Location</Text>
            <Text style={{fontSize:23, fontWeight:'500', letterSpacing:1, color:'#404040'}}>{this.state.city}</Text>
          </View> */}
          {/* <View style={{justifyContent:'center'}}>
            <Icon name={'md-locate'} size={18} color={'#404040'}/>
          </View> */}
        </View>
        <TouchableOpacity style={{width: 55, height: 55, borderRadius:100, position: 'absolute', right: "5%", top: "31%"}}
          onPress={this.changeImage}
        >
          <Image source={require('../Assets/addimage.png')}
            style={{borderWidth: 3, borderColor: 'white', width: 55, height: 55, borderRadius:100}}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={this.handleLogout}>
            <Text style={{color:'#FFF', fontWeight:'400'}}> Log Out </Text>
          </TouchableOpacity>
      </>
    );
  }
};

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 150,
    backgroundColor: '#06adbd',
    borderRadius: 4,
    height: 52,
    width:100,
    alignItems: 'center',
    justifyContent:'center'
  }
})


// import React, {Component} from 'react';
// import {SafeAreaView, View, Image, Text, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
// import User from '../../User';
// import ImagePicker from 'react-native-image-picker';
// import styles from '../Style/Style';
// import firebase from 'firebase';
// import {Db} from '../Screen/Config';
// import AsyncStorage from '@react-native-community/async-storage';



// export default class ProfileScreen extends Component{
//     static navigationOptions = {
//         title: 'Profile'
//     }
//     state = {
//         userid: User.id,
//         name: User.name,
//         imageSource : User.image ? {uri: User.image} : require('../Assets/user.png'),
//         upload: false
//     }
//     handleChange = key => val => {
//         this.setState({[key]:val})
//     }
//     async onLogout() {
//         await AsyncStorage.removeItem('userid').then(() => {
//         //   this.showToast('You are logged out');
//           this.props.navigation.navigate('Login');
//         });
//     }
//     changeName = async () => {
//         if(this.state.name.length <3 ){
//             Alert.alert('Error','Please enter valid name')
//         }else if(User.name !== this.state.name){
//             User.name = this.state.name;
//             this.updateUser();   
//             // Alert.alert('Success', 'Name changed successful.')
//         }

//     } 
//     changeImage = () => {
//         const options = {
//             quality: 0.7, allowsEditing: true, mediaType: 'photo', noData: true,
//             storageOptions:{
//                 skipBackup: true, waitUntilSaved: true, path: 'images', cameraRoll: true
//             }
//         }
//         ImagePicker.showImagePicker(options, response => {
//             if(response.error){
//                 console.log(error)
//             } else if(!response.didCancel){
//                 this.setState({
//                     upload: true,
//                     imageSource: { uri: response.uri }
//                 }, this.uploadFile)
//             }
//         })

//     }
//     updateUser = async () => {
//         // console.log('ini image', image)
//         Db.ref('users').child(User.phone).set(User);
//         Alert.alert('Success', 'Successful Saved.')
//     }
//     updateUserImage = (imageUrl) => {
//         User.image = imageUrl;
//         this.updateUser();
//         this.setState({ upload:false, imageSource: {uri: imageUrl}})

//     }

//     uploadFile = async () => {
//         const file = await this.uriToBlob(this.state.imageSource.uri);
//         firebase.storage().ref(`profile_pictures/${User.phone}.png`)
//         .put(file)
//         .then(snapshot => snapshot.ref.getDownloadURL())
//         // console.log('download'.getDownloadURL)
//         .then(url => this.updateUserImage(url))
//         .catch(error => {
//             this.setState({
//                 upload: false,
//                 imageSource: require('../Assets/user.png')
//             });
//             Alert.alert('Error', 'Error on upload image')
//         })
//     }
//     uriToBlob = (uri) => {
//         return new Promise((resolve, reject) => {
//             const xhr = new XMLHttpRequest();
//             xhr.onload = function(){
//                 resolve(xhr.response);
//                 // console.log('ini resolve', resolve)
//             };
//             xhr.onerror = function(){
//                 reject (new Error('Error on upload image'));
//             };
//             xhr.responseType = 'blob';
//             xhr.open('GET', uri, true);
//             // console.log('ini xhr', xhr.open)
//             xhr.send(null);
//         });
//     }
//     render(){
//         return(
//             <SafeAreaView style={styles.container}>
//                 <TouchableOpacity onPress={this.changeImage}>
//                     {
//                         this.state.upload ? <ActivityIndicator size="large"/> : <Image style={{borderRadius: 100, width:100, height: 100, marginBottom: 10, resizeMode: 'cover'}} source={this.state.imageSource}/>
                        
//                     }
//                 </TouchableOpacity>
//                 <Text style={{fontSize:20}}>
//                     {User.name}
//                 </Text>
//                 <TextInput
//                     style={styles.input}
//                     value={this.state.name}
//                     onChangeText={this.handleChange('name')}
//                 />
//                 <TouchableOpacity onPress={this.changeName}>
//                     <Text style={styles.btnText}>Change Name</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => this.onLogout()}>
//                     <Text style={styles.btnText}>Log Out</Text>
//                 </TouchableOpacity>
//             </SafeAreaView>
//         )
//     }
// }