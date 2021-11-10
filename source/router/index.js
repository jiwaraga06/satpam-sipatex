import React from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    Login,
    ChangePassword,
    Home,
    LokalSecurity,
    AbsenSatpam,
    TabView,
    SplashScreen,
    LocalCheckpoint,
    Datalokal,
    HistoryTransaksiAbsen,
    DatalokalTask,
    TestLocal,
    ScanQR,
    CheckPoint,
    CheckPointTask,
    CheckPointSubTask,
    AddCheckPoint,
    EditCheckPoint,
    AddCheckPointTask,
    EditCheckPointTask,
    AddCheckPointSubTask,
    EditCheckPointSubTask
} from '../pages'

const Stack = createNativeStackNavigator();
const Router = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName='SplashScreen' >
                <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ headerShown: false }} />
                <Stack.Screen name="ScanQR" component={ScanQR} options={{ headerShown: false }} />
                <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
                <Stack.Screen name="TabView" component={TabView} options={{ headerShown: false }} />
                <Stack.Screen name="AbsenSatpam" component={AbsenSatpam} options={{ headerShown: false }} />
                <Stack.Screen name="LocalCheckpoint" component={LocalCheckpoint} options={{ headerShown: false }} />
                <Stack.Screen name="CheckPoint" component={CheckPoint} options={{ headerShown: false }} />
                <Stack.Screen name="AddCheckPoint" component={AddCheckPoint} options={{ headerShown: false }} />
                <Stack.Screen name="EditCheckPoint" component={EditCheckPoint} options={{ headerShown: false }} />
                <Stack.Screen name="CheckPointTask" component={CheckPointTask} options={{ headerShown: false }} />
                <Stack.Screen name="CheckPointSubTask" component={CheckPointSubTask} options={{ headerShown: false }} />
                <Stack.Screen name="AddCheckPointTask" component={AddCheckPointTask} options={{ headerShown: false }} />
                <Stack.Screen name="EditCheckPointTask" component={EditCheckPointTask} options={{ headerShown: false }} />
                <Stack.Screen name="AddCheckPointSubTask" component={AddCheckPointSubTask} options={{ headerShown: false }} />
                <Stack.Screen name="EditCheckPointSubTask" component={EditCheckPointSubTask} options={{ headerShown: false }} />
                <Stack.Screen name="TestLocal" component={TestLocal} options={{ headerShown: false }} />
                <Stack.Screen name="Datalokal" component={Datalokal} options={{ headerShown: false }} />
                <Stack.Screen name="DatalokalTask" component={DatalokalTask} options={{ headerShown: false }} />
                <Stack.Screen name="HistoryTransaksiAbsen" component={HistoryTransaksiAbsen} options={{ headerShown: false }} />
                <Stack.Screen name="LokalSecurity" component={LokalSecurity} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Router

const styles = StyleSheet.create({})
