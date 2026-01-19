import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AdminDrawer from './src/navigation/AdminDrawer';

export default function App() {
  return (
    <NavigationContainer>
      <AdminDrawer />
    </NavigationContainer>
  );
}