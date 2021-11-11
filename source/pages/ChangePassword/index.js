import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Container, Header, Item, Text, Input, Button, Spinner } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiChangePassword, apiToken } from '../../API'
import DeviceInfo from 'react-native-device-info';

const ChangePassword = () => {
    const navigation = useNavigation();

    const [barcode, setbarcode] = useState('');
    const [password, setpassword] = useState('');
    const [newPassword, setnewPassword] = useState('');
    const [showPass, setshowPass] = useState(true);
    const [showPassNew, setshowPassNew] = useState(true);
    const [errBarcode, seterrBarcode] = useState('');
    const [errPassword, seterrPassword] = useState('');
    const [errPasswordNew, seterrPasswordNew] = useState('');
    const [isLoading, setisLoading] = useState('');
    const [message, setmessage] = useState('');
    const [messageSuccess, setmessageSuccess] = useState('');

    const postChangePassword = async () => {
        const device = DeviceInfo.getUniqueId();
        setisLoading(true);
        const data = {
            'barcode': barcode,
            'password': password,
            'device_uuid': device
        }
        try {
            const response = await fetch(apiChangePassword(), {
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
            if (json.errors) {
                setmessage(json.message);
                seterrBarcode(json.errors.barcode);
                seterrPassword(json.errors.password);
                seterrPasswordNew(json.errors.new_password);
                setisLoading(false);
            } else {
                setisLoading(false);
                setmessageSuccess(json.message);
            }
        } catch (error) {
            console.log('Error Login : ', error);
            Alert.alert('Information', error)
        }
    }
    useEffect(() => {
    }, []);

    return (
        <Container>
            <View style={{ margin: 8 }} >
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
                        secureTextEntry={true}
                        placeholder='Masukan Password Lama'
                        onChangeText={(value) => setpassword(value)}
                    />
                    {
                        showPass == true ?
                            <TouchableOpacity onPress={() => setshowPass(false)} >
                                <MaterialIcons
                                    name='visibility-off'
                                    size={25}
                                    color='black'
                                    style={{ marginRight: 8 }} />
                            </TouchableOpacity>
                            : <TouchableOpacity onPress={() => setshowPass(true)} >
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
                <Item regular style={{ margin: 8 }} >
                    <MaterialIcons
                        name='lock-outline'
                        size={30}
                        color='black'
                        style={{ marginRight: 8, marginLeft: 8 }}
                    />
                    <Input
                        secureTextEntry={showPassNew}
                        placeholder='Masukan Password Baru'
                        onChangeText={(value) => setnewPassword(value)}
                    />
                    {
                        showPassNew == true ?
                            <TouchableOpacity onPress={() => setshowPassNew(!showPassNew)} >
                                <MaterialIcons
                                    name='visibility-off'
                                    size={25}
                                    color='black'
                                    style={{ marginRight: 8 }} />
                            </TouchableOpacity>
                            : <TouchableOpacity onPress={() => setshowPassNew(!showPassNew)} >
                                <MaterialIcons
                                    name='visibility'
                                    size={25}
                                    color='black'
                                    style={{ marginRight: 8 }} />
                            </TouchableOpacity>
                    }
                </Item>
                {
                    errPasswordNew != '' ?
                        <Text style={styles.errorText} >{errPasswordNew}</Text>
                        : <View />
                }
            </View>
            <View style={{ margin: 8 }} >
                <Button full style={styles.btnSubmit} onPress={() => postChangePassword()} >
                    <Text style={styles.btnFont} >Change Password</Text>
                </Button>
            </View>
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
            {/* MESSAGE  SUCCESS*/}
            <Modal isVisible={messageSuccess != '' ? true : false} >
                <View style={{ backgroundColor: 'white', alignItems: 'center' }} >
                    <View style={{ margin: 10, alignItems: 'center' }} >
                        <MaterialIcons
                            name='info-outline'
                            color='#252A34'
                            size={60}
                            style={{ margin: 8 }}
                        />
                        <Text style={{ color: "black", fontSize: 17 }} >{messageSuccess}</Text>
                        <Text style={{ color: "black", fontSize: 16 }} >Silahkan Login</Text>
                    </View>
                    <Button full style={styles.btnSubmit} onPress={() => setmessageSuccess('')} >
                        <Text style={styles.btnFont} >Tutup</Text>
                    </Button>
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

export default ChangePassword

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
