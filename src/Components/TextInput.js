import React, {Component} from 'react';
import {
    TextInput,StyleSheet
  } from 'react-native';

export const Textfield=(props)=>{
    return <TextInput
    style={styles.inputField}
    placeholder={props.placeholder}
    returnKeyType='next'
    onChangeText={props.onChange}
    value={props.value}
    keyboardType={props.keyboardType}
    autoCorrect={false} />
}

export const Passwordfield=(props)=>{
    return  <TextInput
    style={styles.inputField}
    placeholder={props.placeholder}
    secureTextEntry
    onChangeText={props.onChange}
    value={props.value}
    ref={(input) => this.passwordInput = input}/>
}


const styles = StyleSheet.create({
    inputField: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        borderRadius: 10,
    },
  })