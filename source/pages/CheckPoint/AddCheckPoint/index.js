import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, RefreshControl, Alert, AsyncStorage } from 'react-native';
import { Container, Text, Header, Title, Left, Body, Button, Item, Input, Textarea, Spinner, Right } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { apiSimpanCheckPoint, apiToken } from '../../../API';
import { insertValueTableCheckpointForm } from '../../../SQLITE';

const initialState = {
    latitude: null,
    longitude: null,
    latitudeDelta: 0.0016435753784938,
    longitudeDelta: 0.0013622269034385681,

}

// const AddCheckPoint = () => {
const AddCheckPoint = ({ route }) => {
    const navigation = useNavigation();
    const { id_checkpoint } = route.params;

    const [currentPosition, setcurrentPosition] = useState(initialState);
    const [nama_lokasi, setnama_lokasi] = useState('');
    const [keterangan, setketerangan] = useState('');
    const [netInfo, setnetInfo] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [message, setmessage] = useState('');
    const [messagesuccess, setmessagesuccess] = useState('');
    const [errNamaLok, seterrNamaLok] = useState('');
    const [errKet, seterrKet] = useState('');

    const getLokasi = () => {
        Geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setcurrentPosition({
                ...currentPosition,
                latitude,
                longitude
            })
        }, error => {
            console.log('Error : ', error);
        }, {
            enableHighAccuracy: true,
            distanceFilter: 0,
            useSignificantChanges: true,
            maximumAge: 0
        })
    }

    const postTambahCheckpoint = async () => {
        const barcode = await AsyncStorage.getItem('barcode');
        const tahun = new Date().getFullYear();
        const bulan = new Date().getMonth() + 1;
        const day = new Date().getDate();
        var days;
        if (day.toString().length <= 2) {
            days = `0${day}`
        } else {
            days = day
        }
        var date = `${tahun}-${bulan}-${days}`;
        const data = {
            'nama_lokasi': nama_lokasi,
            'lati': currentPosition.latitude,
            'longi': currentPosition.longitude,
            'keterangan': keterangan,
            'user_creator': barcode
        }
        NetInfo.addEventListener(async (state) => {
            if (state.isConnected) {
                setisLoading(true);
                try {
                    const response = await fetch(apiSimpanCheckPoint(), {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': apiToken()
                        },
                        body: JSON.stringify(data)
                    });
                    const json = await response.json();
                    console.log(json);
                    if (response.status == 500) {
                        setisLoading(false);
                        Alert.alert('information', response.body);
                    }
                    if (json.errors == null) {
                        setisLoading(false);
                        setmessage(json);
                        seterrKet(json.errors.keterangan);
                        seterrNamaLok(json.errors.nama_lokasi);
                    } else if (json.errors != null) {
                        setisLoading(false);
                        setmessagesuccess(json);
                        //  navigation.goBack();
                    }
                } catch (error) {
                    console.log('Error Tambah Checkpoint : ', error);
                    //Alert.alert('information', error)
                }
            } else {
                if (!nama_lokasi && !keterangan) {
                    seterrNamaLok('Nama Lokasi Tidak Boleh Kosong')
                    seterrKet('Keterangan Tidak Boleh Kosong')
                    return true;
                }
                insertValueTableCheckpointForm(id_checkpoint, nama_lokasi, currentPosition.latitude, currentPosition.longitude, keterangan, date, date, barcode);
            }
        })

    }
    useEffect(() => {
        getLokasi()
        console.log(id_checkpoint);
        NetInfo.addEventListener((state) => {
            setnetInfo(state.isConnected)
        })
    }, []);
    return (
        <Container>
            <Header androidStatusBarColor='#252A34' style={{ backgroundColor: '#252A34' }} >
                <Left style={{ flex: 1 }} >
                    <TouchableOpacity onPress={() => navigation.goBack()} >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                            <MaterialIcons
                                name='chevron-left'
                                size={30}
                                color='white'
                            />
                            <Text style={{ color: 'white', fontSize: 16 }} >Kembali</Text>
                        </View>
                    </TouchableOpacity>
                </Left>
                <Body style={{ flex: 2 }} >
                    <Title>Tambah CheckPoint</Title>
                </Body>
                <Right style={{ flex: 0.1 }} >
                    <View style={styles.signal(netInfo)} />
                </Right>
            </Header>
            <View style={{ flex: 1 }} >
                {/* <View style={{ justifyContent: 'center', alignItems: 'center' }} >
                    <Text>Tester</Text>
                </View> */}
                <ScrollView>
                    <View style={styles.container}>
                        {
                            currentPosition.latitude == null ?
                                <Spinner color='#252A34' />
                                :
                                <MapView
                                    provider={PROVIDER_GOOGLE}
                                    style={styles.map}
                                    showsUserLocation={true}
                                    zoomEnabled={true}
                                    mapType='hybrid'
                                    zoomControlEnabled={true}
                                    initialRegion={currentPosition}
                                >
                                </MapView>
                        }
                    </View>
                    <View style={{ margin: 8 }} >
                        <Item regular style={{ margin: 8 }} >
                            <Input
                                placeholder='Masukan Nama Lokasi'
                                onChangeText={(value) => setnama_lokasi(value)}
                            />
                        </Item>
                        {
                            errNamaLok != '' ?
                                <Text style={{ color: '#c62828', fontSize: 16 }} >{errNamaLok}</Text>
                                : <View />
                        }
                        <Item regular style={{ margin: 8 }} >
                            <Textarea
                                placeholder="Masukan Keterangan"
                                onChangeText={(value) => setketerangan(value)}
                                rowSpan={4}
                            />
                        </Item>
                        {
                            errKet != '' ?
                                <Text style={{ color: '#c62828', fontSize: 16 }} >{errKet}</Text>
                                : <View />
                        }
                        <View>
                            <Button full style={styles.btnSubmit} onPress={postTambahCheckpoint} >
                                <Text style={styles.btnFont}>Submit</Text>
                            </Button>
                            <Button full style={styles.btnBatal} onPress={() => navigation.goBack()} >
                                <Text style={styles.btnFont}>Batal</Text>
                            </Button>
                        </View>
                    </View>
                </ScrollView>
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
                            size={50}
                            style={{ margin: 8 }}
                        />
                        <Text style={{ color: "black", fontSize: 17 }} >{message}</Text>
                    </View>
                    <Button full style={styles.btnClose} onPress={() => setmessage('')} >
                        <Text style={styles.btnFont} >Tutup</Text>
                    </Button>
                </View>
            </Modal>
            {/* MESSAGE */}
            <Modal isVisible={messagesuccess != '' ? true : false} >
                <View style={{ backgroundColor: 'white', alignItems: 'center' }} >
                    <View style={{ margin: 10, alignItems: 'center' }} >
                        <MaterialIcons
                            name='info-outline'
                            color='#252A34'
                            size={50}
                            style={{ margin: 8 }}
                        />
                        <Text style={{ color: "black", fontSize: 17 }} >{messagesuccess}</Text>
                    </View>
                    <Button full style={styles.btnClose} onPress={() => { setmessagesuccess(''); navigation.goBack() }} >
                        <Text style={styles.btnFont} >Tutup</Text>
                    </Button>
                </View>
            </Modal>
        </Container>
    )
}

export default AddCheckPoint

const styles = StyleSheet.create({
    signal: (sinyal) => ({
        backgroundColor: sinyal == true ? '#2e7d32' : '#c62828',
        width: 25,
        elevation: 6,
        height: 25,
        borderRadius: 4,
        marginRight: 20
    }),
    container: {
        ...StyleSheet.flatten,
        height: 500,
        justifyContent: 'center',
        alignItems: 'center'
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    btnFont: {
        fontSize: 17,
        fontWeight: '700',
        color: 'white'
    },
    btnSubmit: {
        borderRadius: 6,
        elevation: 8,
        backgroundColor: '#2e7d32',
        margin: 8
    },
    btnBatal: {
        borderRadius: 6,
        elevation: 8,
        backgroundColor: '#c62828',
        margin: 8
    },
    btnClose: {
        backgroundColor: '#252A34',
        borderRadius: 6,
        elevation: 6,
        margin: 8
    },
})
