import React from 'react';
import { View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  AsyncStorage,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import {Db, Auth} from './Config';
import Icon from 'react-native-vector-icons/Ionicons'

export default class HomeScreen extends React.Component {

  state = {
    userList: [],
    refreshing: false,
    uid: '',
  };

  componentDidMount = async () => {
    const uid = await AsyncStorage.getItem('userid');
    
    this.setState({uid: uid, refreshing: true});

    await Db.ref('/users')
      .on('child_added', data => {
      let person = data.val();
      if (person.id != uid) {
        this.setState(prevData => {
          return {userList: [...prevData.userList, person]};
        });
        this.setState({refreshing: false});
      }
    });
  };


  renderItem = ({item}) => {
    return (
      <View style={{marginHorizontal:20}}>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('Chat',{item})}>
          <View style={styles.row}>
            <Image source={{uri: item.photo}} style={styles.pic} />
            <View>
              <View style={styles.nameContainer}>
                <Text
                  style={styles.nameTxt}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {item.name}
                </Text>
                {item.status == 'Online' ? (
                  <View style={{flexDirection:'row', paddingTop:10}}>
                    <Text style={styles.on}>{item.status}</Text>
                    {/* <Icon name={'md-mail'} size={15} color={'#694be2'}/> */}
                  </View>
                ) : (
                  <View style={{flexDirection:'row', paddingTop:10}}>
                    <Text style={styles.off}>{item.status}</Text>
                    {/* <Icon name={'md-mail'} size={15} color={'#694be2'}/> */}
                  </View>
                )}
              </View>
              <View style={styles.msgContainer}>
                <Text style={styles.status}>{item.email}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  render(){
    return (
      <>
      <SafeAreaView>
        {this.state.refreshing === true ? (
          <ActivityIndicator
            size="large"
            color="#05A0E4"
            style={{marginTop: 150}}
          />
        ) : (
          <FlatList
            data={this.state.userList}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </SafeAreaView>
      </>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DCDCDC',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    padding: 10,
    paddingTop: 15
  },
  pic: {
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 280,
  },
  nameTxt: {
    marginLeft: 15,
    fontWeight: '600',
    color: '#222',
    fontSize: 18,
    width: 170,
  },
  status: {
    fontWeight: '200',
    color: '#ccc',
    fontSize: 13,
  },
  on:{
    fontWeight: '200',
    color: 'green',
    fontSize: 13,
    paddingRight: 10
  },
  off:{
    fontWeight: '200',
    color: '#C0392B',
    fontSize: 13,
    paddingRight: 10
  },
  msgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  email: {
    fontWeight: '400',
    color: '#008B8B',
    fontSize: 12,
    marginLeft: 15,
  },
});// import React, {Component} from 'react';
// import {SafeAreaView, View, Image, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions} from 'react-native';
// import User from '../../User';
// import styles from '../Style/Style';
// import {Db, Auth} from './Config';
// import firebase from 'firebase';

// // import image from '../Assets/user.png'
// // import { TouchableOpacity } from 'react-native-gesture-handler';

// export default class HomeScreen extends Component{
//     state = {
//         users: [],
//         dbRef: Db.ref('users'),
        
//     }

//     componentDidMount = async () => {
//             this.state.dbRef.on('child_added', (val) => {
//             let person = val.val();
//             person.phone = val.key;
//             if(person.id === User.id) {
//                 User.name = person.name
//                 User.image = person.image ? person.image : null
//             } else {  
//             this.setState((prevState) => {
//                 return{
//                     users: [...prevState.users, person]
//                 }
//             })
//          }
//         })
//     }

//     componentWillUnmount(){
//         this.state.dbRef.off()
//     }

   
//     renderRow = ({item}) => {
//         return(
//             <TouchableOpacity 
//             onPress={() => this.props.navigation.navigate('Chat', item)}
//             style={{flexDirection:'row', alignItems: 'center', padding:10, borderBottomColor: '#ccc', borderBottomWidth:1}}>
//                 <Image source={item.image ?  {uri:item.image} : require('../Assets/user.png')}
//                 style={{width: 32, height: 32, resizeMode: 'cover', borderRadius: 32, marginRight: 5}}/>
//                 <Text style={{fontSize:20}}>{item.name}</Text>
//             </TouchableOpacity>
//         )
//     }
//     render(){
//         const { height } = Dimensions.get('window');
//         return( 
//             <SafeAreaView>
//                 <FlatList
//                 style={{height}}
//                 data={this.state.users}
//                 renderItem={this.renderRow}
//                 keyExtractor={(item) => item.phone}
//                 // ListHeaderComponent={() => <Text style={{fontSize: 30, marginVertical: 10, fontWeight: 'bold'}}>Chats</Text>}
//                 />
//             </SafeAreaView>
//         )
//     }
// }
// import React, {Component} from 'react';
// import {SafeAreaView, View, Image, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions} from 'react-native';
// import User from '../../User';
// import styles from '../Style/Style';
// import {Db} from './Config';
// import firebase from 'firebase';

// // import image from '../Assets/user.png'
// // import { TouchableOpacity } from 'react-native-gesture-handler';

// export default class HomeScreen extends Component{
//     state = {
//         users: [],
//         dbRef: Db.ref('users'),
//     }

//     componentDidMount(){  
//         this.state.dbRef.on('child_added', (val) => {
//             let person = val.val();
//             person.phone = val.key;
//             if(person.id === User.id) {
//                 User.name = person.name
//                 User.image = person.image ? person.image : null
//             } else {  
//             this.setState((prevState) => {
//                 return{
//                     users: [...prevState.users, person]
//                 }
//             })
//          }
//         })
//     }

//     componentWillUnmount(){
//         this.state.dbRef.off()
//     }

   
//     renderRow = ({item}) => {
//         return(
//             <TouchableOpacity 
//             onPress={() => this.props.navigation.navigate('Chat', item)}
//             style={{flexDirection:'row', alignItems: 'center', padding:10, borderBottomColor: '#ccc', borderBottomWidth:1}}>
//                 <Image source={item.image ?  {uri:item.image} : require('../Assets/user.png')}
//                 style={{width: 32, height: 32, resizeMode: 'cover', borderRadius: 32, marginRight: 5}}/>
//                 <Text style={{fontSize:20}}>{item.name}</Text>
//             </TouchableOpacity>
//         )
//     }
//     render(){
//         const { height } = Dimensions.get('window');
//         return( 
//             <SafeAreaView>
//                 <FlatList
//                 style={{height}}
//                 data={this.state.users}
//                 renderItem={this.renderRow}
//                 keyExtractor={(item) => item.phone}
//                 // ListHeaderComponent={() => <Text style={{fontSize: 30, marginVertical: 10, fontWeight: 'bold'}}>Chats</Text>}
//                 />
//             </SafeAreaView>
//         )
//     }
// }
