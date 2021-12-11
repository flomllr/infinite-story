import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

export const AvoidKeyboard = (props: KeyboardAvoidingView['props']) => (
  <KeyboardAvoidingView
    {...props}
    behavior={Platform.OS === 'ios' ? 'padding' : null}
  >
    {props.children}
  </KeyboardAvoidingView>
);
