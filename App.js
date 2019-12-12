import React from 'react';
import {Image} from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import LoginScreen from './src/Screen/LoginScreen';
import HomeScreen from './src/Screen/HomeScreen';
import ChatScreen from './src/Screen/ChatScreen';
import ProfileScreen from './src/Screen/ProfileScreen';
import RegisterScreen from './src/Screen/RegisterScreen';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import MapScreen from './src/Screen/MapScreen';
import Icon from 'native-base';

// const AppStack = createStackNavigator({ Home: HomeScreen });
// const AuthStack = createStackNavigator({ Login: LoginScreen });

const UserNavigator = createStackNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: () => ({
      header: null,
    }),
  },
  Register: {
    screen: RegisterScreen,
    navigationOptions: () => ({
      header: null,
    }),
  },
});

const AppNavigator = createStackNavigator(

  {
    Home: {
      screen: HomeScreen,
      navigationOptions: ({
        title: 'Chats',
        backgroundColor: '#06adbd',
        headerTitleStyle: {
          color: 'black', 
          textAlign: 'center',
          flex:1 
        }

      }),
    },
    Chat: {
      screen: ChatScreen,
      navigationOptions : ({
        header: null
      })
  },
  Profile: {
    screen: ProfileScreen,
  
  }

});

AppNavigator.navigationOptions = ({navigation}) => {
  let tabBarVisible = navigation.state.index === 0;

  return {
    tabBarVisible
  };
}

const TabNavigator = createBottomTabNavigator({
  Chats: AppNavigator,
  Maps: MapScreen,
  Profile: ProfileScreen,
 

},{
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused, horizontal, tintColor }) => {
      const { routeName } = navigation.state;
      let imageName = require('./src/Assets/chat.png');
       if (routeName === 'Profile') {
        imageName = require('./src/Assets/user.png');
      }
        if (routeName === 'Maps') {
          imageName = require('./src/Assets/placeholder.png');
        }
      

      // You can return any component that you like here!
      return <Image source={imageName} style={{width:25, resizeMode: 'contain', tintColor}} />;
    },
  }),
  tabBarOptions: {
    activeTintColor: '#06adbd',
    inactiveTintColor: 'gray',
  },
})

const switchScreen = createSwitchNavigator({
  AuthScreen: UserNavigator,
  App: TabNavigator,

  
});
const AppContainer = createAppContainer(switchScreen);
export default AppContainer;
