import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AdminDrawer from './src/navigation/AdminDrawer';
import Login from './src/Login';
import { isAuthed } from './src/auth';

export default function App() {
  const [authed, setAuthed] = useState(isAuthed());

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AdminDrawer />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
