import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, TouchableOpacity, AsyncStorage,ScrollView } from 'react-native';
import { Container, Header, Item, Text, Input, Button, Spinner } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiLogin, apiToken } from '../../API'
import DeviceInfo from 'react-native-device-info';

const Login = () => {
    const navigation = useNavigation();

    const [barcode, setbarcode] = useState('');
    const [password, setpassword] = useState('');
    const [showPass, setshowPass] = useState(true);
    const [errBarcode, seterrBarcode] = useState('');
    const [errPassword, seterrPassword] = useState('');
    const [isLoading, setisLoading] = useState('');
    const [message, setmessage] = useState('');

    const postLogin = async () => {
        const device = DeviceInfo.getUniqueId();
        setisLoading(true);
        const data = {
            'barcode': barcode,
            'password': password,
            'device_uuid': device
        }
        try {
            const response = await fetch(apiLogin(), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': apiToken()
                },
                body: JSON.stringify(data)
            });
            const json = await response.json();
            console.log('DATA : ', json);
            if (response.status == 400) {
                setisLoading(false);
                setmessage(json.message);
            } else if (json.status == 500) {
                setmessage(json.message);
                seterrBarcode(json.data);
                setisLoading(false);
            }
            else if (json.data == 'Password salah') {
                setmessage(json.message);
                seterrPassword(json.message);
                setisLoading(false);
            }
            else if (json.message == 'Berhasil login') {
                setisLoading(false);
                AsyncStorage.setItem('barcode', json.data.barcode);
                AsyncStorage.setItem('nama', json.data.nama);
                AsyncStorage.setItem('warna', json.data.line_color);
                AsyncStorage.setItem('role', JSON.stringify(json.data.user_roles));
                AsyncStorage.setItem('gender', json.data.gender);
                navigation.replace('Home');
            } else {
                setmessage(json.message);
                seterrBarcode(json.errors.barcode);
                seterrPassword(json.errors.password);
                setisLoading(false);
            }
        } catch (error) {
            console.log('Error Login : ', error);
            Alert.alert('Information', error)
        }
    }
    useEffect(() => {
        const device = DeviceInfo.getUniqueId();
        console.log(device);
        // const day = new Date().getDate();
        // var days;
        // if (day.toString().length < 2) {
        //     days = `0${day}`
        // } else {
        //     days = day
        // }
        // console.log(days);
    }, []);

    return (
        <Container>
            <ScrollView style={{ margin: 8 }} >
                <Item regular style={{ margin: 8 }} >
                    <MaterialCommunityIcons
                        name='account-box'
                        size={30}
                        color='black'
                        style={{ marginRight: 8, marginLeft: 8 }}
                    />
                    <Input
                        placeholder='Masukan Barcode'
                        keyboardType='numeric'
                        onChangeText={(value) => setbarcode(value)}
                    />
                </Item>
                {
                    errBarcode != '' ?
                        <Text style={styles.errorText} >{errBarcode}</Text>
                        : <View />
                }
                <Item regular style={{ margin: 8 }} >
                    <MaterialIcons
                        name='lock-outline'
                        size={30}
                        color='black'
                        style={{ marginRight: 8, marginLeft: 8 }}
                    />
                    <Input
                        secureTextEntry={showPass}
                        placeholder='Masukan Password'
                        onChangeText={(value) => setpassword(value)}
                    />
                    {
                        showPass == true ?
                            <TouchableOpacity onPress={() => setshowPass(!showPass)} >
                                <MaterialIcons
                                    name='visibility-off'
                                    size={25}
                                    color='black'
                                    style={{ marginRight: 8 }} />
                            </TouchableOpacity>
                            : <TouchableOpacity onPress={() => setshowPass(!showPass)} >
                                <MaterialIcons
                                    name='visibility'
                                    size={25}
                                    color='black'
                                    style={{ marginRight: 8 }} />
                            </TouchableOpacity>
                    }
                </Item>
                {
                    errPassword != '' ?
                        <Text style={styles.errorText} >{errPassword}</Text>
                        : <View />
                }
            <View style={{ margin: 8 }} >
                <Button full style={styles.btnSubmit} onPress={() => postLogin()} >
                    <Text style={styles.btnFont} >Login</Text>
                </Button>
            </View>
            </ScrollView>
            <View style={{ flex: 1, justifyContent: "flex-end", marginBottom: 30, alignItems: 'center' }} >
                <View style={{ flexDirection: 'row', alignItems: "center" }} >
                    <MaterialIcons
                        name='copyright'
                        size={23}
                        color='black'
                        style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 19 }} >Copyright</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', marginTop: 8 }} >IT DEPARTEMENT | PT SIPATEX PUTRI LESTARI</Text>
            </View>
            {/* LOADING */}
            <Modal isVisible={isLoading} >
                <View style={{ backgroundColor: 'white' }} >
                    <Spinner color='#252A34' />
                </View>
            </Modal>
            {/* MESSAGE */}
            <Modal isVisible={message != '' ? true : false} >
                <View style={{ backgroundColor: 'white', alignItems: 'center' }} >
                    <View style={{ margin: 10, alignItems: 'center' }} >
                        <MaterialIcons
                            name='info-outline'
                            color='#252A34'
                            size={60}
                            style={{ margin: 8 }}
                        />
                        <Text style={{ color: "black", fontSize: 17 }} >{message}</Text>
                    </View>
                    <Button full style={styles.btnSubmit} onPress={() => setmessage('')} >
                        <Text style={styles.btnFont} >Tutup</Text>
                    </Button>
                </View>
            </Modal>
        </Container>
    )
}

export default Login

const styles = StyleSheet.create({
    errorText: {
        color: '#c62828',
        fontSize: 16
    },
    btnSubmit: {
        margin: 8,
        backgroundColor: '#252A34',
        borderRadius: 6,
        elevation: 6
    },
    btnFont: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white'
    }
})