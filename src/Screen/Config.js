import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyDSoJKk53DRW-VcqA0DBtrnV5oHtCD_TMw",
    authDomain: "realtime-chat-eb5dd.firebaseapp.com",
    databaseURL: "https://realtime-chat-eb5dd.firebaseio.com",
    projectId: "realtime-chat-eb5dd",
    storageBucket: "realtime-chat-eb5dd.appspot.com",
    messagingSenderId: "474278294594",
    appId: "1:474278294594:web:d8afd99b20ca75df4ea9db",
    measurementId: "G-YLEWT4PPHH"
  };

  // Initialize Firebase
  let app = null;
  if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
  }
//   firebase.analytics();

export const Db = firebase.database();
export const Auth = firebase.auth();



