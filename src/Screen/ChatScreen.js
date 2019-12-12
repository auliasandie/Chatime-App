import React, {Component, Fragment} from 'react';
import {AsyncStorage} from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  TouchableHighlight,
} from 'react-native';

import firebase from 'firebase';
import {Db} from './Config';

import {GiftedChat, Bubble, Composer, Send} from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/Ionicons';

export default class ChatScreen extends Component {

  state = {
    message: '',
    messageList: [],
    person: this.props.navigation.getParam('item'),
    status:''
  };


  onSend = async () => {
    if (this.state.message.length > 0) {
      let msgId = Db
        .ref('messages')
        .child(this.state.userId)
        .child(this.state.person.id)
        .push().key;
      let updates = {};
      let message = {
        _id: msgId,
        text: this.state.message,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        user: {
          _id: this.state.userId,
          name: this.state.userName,
          avatar: this.state.userAvatar,
        },
      };
      updates[
        'messages/' +
          this.state.userId +
          '/' +
          this.state.person.id +
          '/' +
          msgId
      ] = message;
      updates[
        'messages/' +
          this.state.person.id +
          '/' +
          this.state.userId +
          '/' +
          msgId
      ] = message;
      Db
        .ref()
        .update(updates);
      this.setState({message: ''});
    }
  };

  componentDidMount = async () => {
    const userId = await AsyncStorage.getItem('userid');
    const userName = await AsyncStorage.getItem('user.name');
    const userAvatar = await AsyncStorage.getItem('user.photo');
    this.setState({userId, userName, userAvatar});
    console.log(this.state.person.photo);
    Db
      .ref('messages')
      .child(this.state.userId)
      .child(this.state.person.id)
      .on('child_added', val => {
        this.setState(previousState => ({
          messageList: GiftedChat.append(previousState.messageList, val.val()),
        }));
      });
  };

  renderBubble(props) {
   return (
     <Bubble
       {...props}
       wrapperStyle={{
         right: {
           backgroundColor: '#06adbd',
           borderTopLeftRadius:7,
           borderTopRightRadius:7,
           borderBottomRightRadius:7,
           borderBottomLeftRadius:0,
         },
         left: {
           borderTopLeftRadius:7,
           borderTopRightRadius:7,
           borderBottomRightRadius:7,
           borderBottomLeftRadius:0,
         },
       }}
     />
   );
 }

  renderSend(props) {
    return (
      <Send {...props}>
        <View
          style={{
            width: 54,
            height: 44,
            borderTopLeftRadius:25,
            borderBottomLeftRadius:25,
            marginBottom:0,
            marginHorizontal: 5,
            backgroundColor:'#FFF',
            justifyContent:'center',
            alignItems:'center'
          }}>
          <Image source={require('../Assets/paper-plane.png')} style={{width:25, height:25}}/>
        </View>
      </Send>
    );
  }

  render() {
    return (
      <Fragment>
        <View style={styles.header}>
          <>
            <View style={styles.img}>
              <Image source={{uri: this.state.person.photo}} style={styles.photo} />
            </View>
            <View style={{marginLeft: 5}}>
              <Text style={styles.heading}>{this.state.person.name}</Text>
              {this.state.person.status == 'Online' ? (
                <View style={{flexDirection:'row', alignItems:'center'}}>
                  {/* <Icon name={'ios-disc'} size={10} color={'green'}/> */}
                  <Image source={require('../Assets/online.png')}/>
                  <Text style={styles.off}>{this.state.person.status}</Text>
                </View>
              ) : (
                <View style={{flexDirection:'row',  alignItems:'center'}}>
                  {/* <Icon name={'ios-disc'} size={10} color={'#C0392B'}/> */}
                  <Image source={require('../Assets/offline.png')}/>
                  <Text style={styles.off}>{this.state.person.status}</Text>
                </View>
              )}
            </View>
          </>
        </View>

        <GiftedChat
          renderBubble={this.renderBubble}
          renderSend={this.renderSend}
          text={this.state.message}
          onInputTextChanged={val => {
            this.setState({message: val});
          }}
          messages={this.state.messageList}
          onSend={() => this.onSend()}
          user={{
            _id: this.state.userId,
          }}
        />
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  photo: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
  },
  img: {
    backgroundColor: 'silver',
    width: 41,
    height: 41,
    borderRadius: 50,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heading: {
    color: 'white',
    fontSize: 21,
    fontWeight: '700',
    width: 'auto',
  },
  header: {
    backgroundColor: '#06adbd',
    height: 70,
    width: '100%',
    paddingHorizontal: 12,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  off:{
    fontWeight: '200',
    color: 'whitesmoke',
    fontSize: 13,
    paddingLeft: 5
  },
});
// import React, {Component} from 'react';
// import {
//   KeyboardAvoidingView,
//   View,
//   Text,
//   TextInput,
//   Platform,
//   Keyboard,
//   Dimensions,
//   Animated,
//   TouchableOpacity,
//   FlatList,
//   Image
// } from 'react-native';
// import styles from '../Style/Style';
// import User from '../../User';
// import {Db} from './Config';
// import firebase from 'firebase';

// const isAndroid = Platform.OS === 'android';

// export default class ChatScreen extends Component {
//   static navigationOptions = ({navigation}) => {
//     return {
//       title: navigation.getParam('name', null),
//     };
//   };
//   constructor(props) {
//     super(props);
//     this.state = {
//       person: {
//         name: props.navigation.getParam('name'),
//         phone: props.navigation.getParam('phone'),
//       },
//       textMessage: '',
//       messageList: [],
//       dbRef: Db.ref('messages'),
//     };
//     this.keyboardHeight = new Animated.Value(0);
//     this.bottomPadding = new Animated.Value(60);
//   }
//   componentDidMount() {
//     this.keyboardShowListener = Keyboard.addListener(isAndroid ? 'keyboardDidShow' : 'keyboardDidShow',
//       (e) => this.keyboardEvent(e, true)); 
//     this.keyboardHideListener = Keyboard.addListener(isAndroid ? 'keyboardDidHide' : 'keyboardDidHide',
//       (e) => this.keyboardEvent(e, false));
    
  //   this.state.dbRef
  //     .child(User.phone)
  //     .child(this.state.person.phone)
  //     .on('child_added', (value) => {
  //       this.setState((prevState) => {
  //         return {
  //           messageList: [...prevState.messageList, value.val()],
  //         };
  //       });
  //     });
  // }
//   componentWillUnmount() {
//     this.state.dbRef.off();
//     this.keyboardShowListener.remove();
//     this.keyboardHideListener.remove();
//   }
//   keyboardEvent = (event, isShow) => {
//     let heightAndroid = isAndroid ? 60 : 80;
//     let bottomAndroid = isAndroid ? 120 : 140;
//     Animated.parallel([
//       Animated.timing(this.keyboardHeight, {
//         duration: event.duration,
//         toValue: isShow ? heightAndroid :0,
//       }),
//       Animated.timing(this.bottomPadding, {
//         duration: event.duration,
//         toValue: isShow ? bottomAndroid : 60,
//       }),
//     ]).start();
//   }
//   handleChange = key => val => {
//     this.setState({[key]: val});
//   };

//   convertTime = time => {
//     let d = new Date(time);
//     let c = new Date();
//     let result = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':';
//     result += (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
//     if (c.getDay() !== d.getDay()) {
//       result = d.getDay() + '' + d.getMonth() + '' + result;
//     }
//     return result;
//   }

//   sendMessage = async () => {
//     if (this.state.textMessage.length > 0) {
//       let msgId = this.state.dbRef
//         .child(User.phone)
//         .child(this.state.person.phone)
//         .push().key;
//       let updates = {};
//       let message = {
//         message: this.state.textMessage,
//         time: firebase.database.ServerValue.TIMESTAMP,
//         from: User.phone,
//       };
//       updates[
//         User.phone + '/' + this.state.person.phone + '/' + msgId
//       ] = message;
//       updates[
//         this.state.person.phone + '/' + User.phone + '/' + msgId
//       ] = message;
//       this.state.dbRef.update(updates);
//       this.setState({textMessage: ''});
//     }
//   };
//   renderRow = ({item}) => {
//     return (
//       <View
//         style={{
//           flexDirection: 'row',
//           maxWidth: '60%',
//           alignSelf: item.from === User.phone ? 'flex-end' : 'flex-start',
//           backgroundColor: item.from === User.phone ? '#00897b' : '#7cb342',
//           borderRadius: 5,
//           marginBottom: 10,
//         }}>
//         <Text style={{color: '#fff', padding: 7, fontSize: 16}}>
//           {item.message}
//         </Text>
//         <Text style={{color: '#eee', padding: 3, fontSize: 12}}>
//           {this.convertTime(item.time)}
//         </Text>
//       </View>
//     );
//   };
//   render() {
//     let {height} = Dimensions.get('window');
//     return (
//       <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
//         <Animated.View
//           style={[styles.bottomBar, {bottom: this.keyboardHeight}]}>
//           <TextInput
//             style={styles.inputMessage}
//             value={this.state.textMessage}
//             placeholder="Type Message..."
//             onChangeText={this.handleChange('textMessage')}
//           />
//           <TouchableOpacity
//             onPress={this.sendMessage}
//             style={styles.sendButton}>
//             {/* <Text style={styles.btnText}>Send</Text> */}
//             <Image source={require('../../src/Assets/sender.png')} style={{tintColor: 'white', resizeMode: 'contain', height: 20}}/>
//           </TouchableOpacity>
//         </Animated.View>
//         <FlatList
//           ref={ref=> this.flatList = ref}
//           onContentSizeChange={() => this.flatList.scrollToEnd({animated: true})} 
//           onLayout={() => this.flatList.scrollToEnd({animated: true})}
//           style={{ paddingTop: 5, paddingHorizontal: 5, height }}
//           data={this.state.messageList}
//           renderItem={this.renderRow}
//           keyExtractor={(item, index) => index.toString()}
//           ListFooterComponent={<Animated.View style={{height: this.bottomPadding}}/>}
//         />
//       </KeyboardAvoidingView>
//     );
//   }
// }
