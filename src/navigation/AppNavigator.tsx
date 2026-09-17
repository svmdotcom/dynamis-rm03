import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import {
  SplashScreen,
  HomeScreen,
  SearchScreen,
  ResultScreen,
  PrepareScreen,
  SymptomSearchScreen,
  FavoritesScreen,
  ManualScreen,
  CopyModeScreen,
  DepotModeScreen,
  SettingsScreen,
} from '../screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ gestureEnabled: false, animation: 'none' }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Prepare" component={PrepareScreen} />
        <Stack.Screen name="SymptomSearch" component={SymptomSearchScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="Manual" component={ManualScreen} />
        <Stack.Screen name="CopyMode" component={CopyModeScreen} />
        <Stack.Screen name="DepotMode" component={DepotModeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}