import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View, PermissionsAndroid, AsyncStorage } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Container, Text, Tab, Tabs, TabHeading } from 'native-base';
import { Login, ChangePassword } from '..';
import { createTableHistorySecurity } from '../../SQLITE';

const TabView = () => {
    const navigation = useNavigation();
    const requestLocationPermission = async () => {
        try {
            // const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    'title': 'Satpam Sipatex',
                    'message': 'Satpam Sipatex access to your location ',
                    'buttonPositive': 'OK'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                // console.log("You can use the location")
                requestBGLocationPermission()
                // alert("You can use the location");
            } else {
                console.log("location permission denied")
                // alert("Location permission denied");
            }

        } catch (err) {
            console.warn(err)
        }
    }
    const requestBGLocationPermission = async () => {
        try {
            // const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                {
                    'title': 'Satpam Sipatex',
                    'message': 'Satpam Sipatex access to your location ',
                    'buttonPositive': 'OK'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the location")
                // alert("You can use the location");
            } else {
                console.log("location permission denied")
                // alert("Location permission denied");
            }
        } catch (err) {
            console.warn(err)
        }
    }

    useEffect(() => {
        requestLocationPermission()
    }, []);

    return (
        <Container style={{ backgroundColor: '#252A34' }} >
            <StatusBar backgroundColor='#252A34' />
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }} >
                <MaterialCommunityIcons
                    name='security'
                    size={60}
                    color='white' />
                <Text style={{ color: 'white', fontSize: 25, marginTop: 10, marginBottom: 8, fontWeight: '700' }} >Security</Text>
            </View>
            <View style={{ flex: 1, margin: 8 }} >
                <Tabs tabBarBackgroundColor='#252A34' >
                    <Tab heading="Login"
                        activeTabStyle={{ backgroundColor: '#252A34' }}
                        tabStyle={{ backgroundColor: '#222831' }}
                        textStyle={{ color: 'white' }} >
                        <Login />
                    </Tab>
                    <Tab heading="Change Password"
                        activeTabStyle={{ backgroundColor: '#252A34' }}
                        tabStyle={{ backgroundColor: '#222831' }}
                        textStyle={{ color: 'white' }} >
                        <ChangePassword />
                    </Tab>
                </Tabs>
            </View>
        </Container>
    )
}

export default TabView

const styles = StyleSheet.create({})
