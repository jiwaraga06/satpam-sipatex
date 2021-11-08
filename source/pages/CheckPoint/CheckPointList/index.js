import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, RefreshControl, Alert, AsyncStorage } from 'react-native';
import { Container, Text, Header, Title, Left, Body, Button, Spinner, Right } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import { openDatabase } from 'react-native-sqlite-storage';
import { apiDataCheckPoint, apiToken } from '../../../API';

var db = openDatabase({ name: 'SatpamDatabase.db' });
const initialState = {
    latitude: null,
    longitude: null,
    latitudeDelta: 0.0016435753784938,
    longitudeDelta: 0.0013622269034385681,
}

const CheckPoint = () => {
    const navigation = useNavigation();

    const [currentPosition, setcurrentPosition] = useState(initialState);
    const [isLoading, setisLoading] = useState(false);
    const [netInfo, setnetInfo] = useState(false);
    const [list, setlist] = useState([]);
    const [listLocal, setlistLocal] = useState([]);
    const [viewMap, setviewMap] = useState(false);
    const [response, setresponse] = useState(0);
    const [message, setmessage] = useState('');

    const getDataCheckpoint = async () => {
        const barcode = await AsyncStorage.getItem('barcode');
        setisLoading(true)
        try {
            const response = await fetch(apiDataCheckPoint(barcode), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': apiToken()
                }
            });
            const json = await response.json()
            console.log('Result : ', json);
            if (json.errors) {
                setisLoading(false)
                setmessage(json.errors.user_creator);
            } else {
                setisLoading(false)
                setlist(json)
            }
        } catch (error) {
            console.log('Error : ', error);
        }
    }

    const getDataCheckpointLokal = () => {
        setisLoading(true)
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM table_checkpoint', [], (tx, results) => {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i)
                    temp.push(results.rows.item(i));
                console.log(temp);
                setisLoading(false)
                setlistLocal(temp)
            });
        });

    }

    const getLokasi = () => {
        Geolocation.watchPosition((position) => {
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
            accuracy: 1,
            interval: 10000,
            fastestInterval: 10000
        })
    }

    const onRefresh = React.useCallback(async () => {
        setisLoading(true);
        NetInfo.addEventListener((state) => {
            setnetInfo(state.isConnected)
            if (state.isConnected) {
                getDataCheckpoint()
            } else {
                getDataCheckpointLokal()
            }
        })
    }, [isLoading]);

    useEffect(() => {
        NetInfo.addEventListener((state) => {
            setnetInfo(state.isConnected)
            if (state.isConnected) {
                getDataCheckpoint()
            } else {
                getDataCheckpointLokal()
            }
        })
        // getDataCheckpointLokal()
        getLokasi()
    }, [NetInfo]);
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
                <Body style={{ flex: 1.1 }} >
                    <Title>Data CheckPoint</Title>
                </Body>
                <Right style={{ flex: 0.8 }} >
                    <View style={styles.signal(netInfo)} />
                </Right>
            </Header>
            <View style={{ flex: 1 }} >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
                    }>
                    {
                        isLoading == true ?
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                                <Text style={{ color: '#bdbdbd', fontSize: 17 }} >Loading</Text>
                            </View>
                            : netInfo == true ?
                                list.length == 0 ?
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                                        <Text style={{ color: '#bdbdbd', fontSize: 17 }} >Data Kosong</Text>
                                    </View>
                                    : viewMap == true ?
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
                                                        initialRegion={currentPosition}>
                                                        {
                                                            list.map((item, index) => {
                                                                return <Marker
                                                                    pinColor='#2196f3'
                                                                    key={index}
                                                                    coordinate={{
                                                                        latitude: item.lati,
                                                                        longitude: item.longi,
                                                                    }}
                                                                    title={item.nama_lokasi}
                                                                    description={item.keterangan}>
                                                                    <Callout
                                                                        onPress={() => {
                                                                            Alert.alert(
                                                                                "Checkpoint",
                                                                                `${item.nama_lokasi}`,
                                                                                [
                                                                                    {
                                                                                        text: "Tutup",
                                                                                        style: "cancel"
                                                                                    },
                                                                                    {
                                                                                        text: "Ubah",
                                                                                        onPress: () => navigation.navigate('EditCheckPoint', {
                                                                                            id: item.id,
                                                                                            lati: item.lati,
                                                                                            longi: item.longi,
                                                                                            namaLokasi: item.nama_lokasi,
                                                                                            ket: item.keterangan
                                                                                        }),
                                                                                    },
                                                                                    {
                                                                                        text: "Lihat Task",
                                                                                        onPress: () => navigation.navigate('CheckPointTask', {
                                                                                            task: item.tasks,
                                                                                            id_lokasi: item.id
                                                                                        })
                                                                                    }
                                                                                ])
                                                                        }}
                                                                    >
                                                                        <View style={{ margin: 8 }} >
                                                                            <Text style={{ fontSize: 17 }} >{item.nama_lokasi}</Text>
                                                                            <Text style={{ fontSize: 15 }} >{item.keterangan}</Text>
                                                                        </View>
                                                                    </Callout>
                                                                </Marker>
                                                            })
                                                        }
                                                    </MapView>
                                            }
                                        </View>
                                        : list.map((item, index) => {
                                            return <View style={styles.card} key={index} >
                                                <Text style={{ fontSize: 17, fontWeight: '600', color: 'black' }} >User Creator : {item.user_creator}</Text>
                                                <Text style={{ fontSize: 16, fontWeight: '700', color: 'black' }} >Lokasi : {item.nama_lokasi}</Text>
                                                <View style={styles.divider} />
                                                <View style={{ margin: 8 }} >
                                                    <Button full style={styles.btnUbah} onPress={() => {
                                                        navigation.navigate('EditCheckPoint', {
                                                            id: item.id,
                                                            lati: item.lati,
                                                            longi: item.longi,
                                                            namaLokasi: item.nama_lokasi,
                                                            ket: item.keterangan
                                                        })
                                                    }} >
                                                        <Text style={styles.btnFont} >Ubah Checkpoint</Text>
                                                    </Button>
                                                    <Button full style={styles.btnShowTask} onPress={() => {
                                                        navigation.navigate('CheckPointTask', {
                                                            task: item.tasks,
                                                            id_lokasi: item.id
                                                        })
                                                    }} >
                                                        <Text style={styles.btnFont} >Lihat Task</Text>
                                                    </Button>
                                                </View>
                                            </View>
                                        })
                                : listLocal.length == 0 ?
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                                        <Text style={{ color: '#bdbdbd', fontSize: 17 }} >Data Kosong</Text>
                                    </View>
                                    : viewMap == true ?
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
                                                        initialRegion={currentPosition}>
                                                        {
                                                            listLocal.map((item, index) => {
                                                                return <Marker
                                                                    pinColor='#2196f3'
                                                                    key={index}
                                                                    coordinate={{
                                                                        latitude: item.lati,
                                                                        longitude: item.longi,
                                                                    }}
                                                                    title={item.nama_lokasi}
                                                                    description={item.keterangan}>
                                                                    <Callout
                                                                        onPress={() => {
                                                                            Alert.alert(
                                                                                "Checkpoint",
                                                                                `${item.nama_lokasi}`,
                                                                                [
                                                                                    {
                                                                                        text: "Tutup",
                                                                                        style: "cancel"
                                                                                    },
                                                                                    {
                                                                                        text: "Ubah",
                                                                                        onPress: () => navigation.navigate('EditCheckPoint', {
                                                                                            id: item.id,
                                                                                            lati: item.lati,
                                                                                            longi: item.longi,
                                                                                            namaLokasi: item.nama_lokasi,
                                                                                            ket: item.keterangan
                                                                                        }),
                                                                                    },
                                                                                    {
                                                                                        text: "Lihat Task",
                                                                                        onPress: () => navigation.navigate('CheckPointTask', {
                                                                                            task: item.tasks,
                                                                                            id_lokasi: item.id_checkpoint
                                                                                        })
                                                                                    }
                                                                                ])
                                                                        }}
                                                                    >
                                                                        <View style={{ margin: 8 }} >
                                                                            <Text style={{ fontSize: 17 }} >{item.nama_lokasi}</Text>
                                                                            <Text style={{ fontSize: 15 }} >{item.keterangan}</Text>
                                                                        </View>
                                                                    </Callout>
                                                                </Marker>
                                                            })
                                                        }
                                                    </MapView>
                                            }
                                        </View>
                                        : listLocal.map((item, index) => {
                                            return <View style={styles.card} key={index} >
                                                <Text style={{ fontSize: 17, fontWeight: '600', color: 'black' }} >User Creator : {item.user_creator}</Text>
                                                <Text style={{ fontSize: 16, fontWeight: '700', color: 'black' }} >Lokasi : {item.nama_lokasi}</Text>
                                                <View style={styles.divider} />
                                                <View style={{ margin: 8 }} >
                                                    {/* <Text>id lok {item.id_checkpoint}</Text> */}
                                                    <Button full style={styles.btnUbah} onPress={() => {
                                                        navigation.navigate('EditCheckPoint', {
                                                            id: item.id,
                                                            lati: item.lati,
                                                            longi: item.longi,
                                                            namaLokasi: item.nama_lokasi,
                                                            ket: item.keterangan
                                                        })
                                                    }} >
                                                        <Text style={styles.btnFont} >Ubah Checkpoint</Text>
                                                    </Button>
                                                    <Button full style={styles.btnShowTask} onPress={() => {
                                                        navigation.navigate('CheckPointTask', {
                                                            task: item.tasks,
                                                            id_lokasi: item.id_checkpoint
                                                        })
                                                    }} >
                                                        <Text style={styles.btnFont} >Lihat Task</Text>
                                                    </Button>
                                                </View>
                                            </View>
                                        })
                    }
                </ScrollView>
                <View style={{ margin: 8 }} >
                    <Button full style={styles.btnView(netInfo == false ? listLocal.length : list.length)}
                        onPress={() => setviewMap(!viewMap)}>
                        {
                            viewMap == true ?
                                <Text style={styles.btnFont} >Tampilan Data</Text>
                                : <Text style={styles.btnFont} >Tampilan Peta</Text>
                        }
                    </Button>
                    <Button full style={styles.btnTambah} onPress={() => {
                        if(netInfo == false) {
                            listLocal.map((item, index) => {
                                navigation.navigate('AddCheckPoint', {
                                    id_checkpoint: item.id_checkpoint
                                })
                                console.log(item.id_checkpoint);
                            })
                        } else {
                            navigation.navigate('AddCheckPoint', {
                                id_checkpoint: 'dari online'
                            })
                        }
                    }} >
                        <Text style={styles.btnFont} >Tambah Checkpoint</Text>
                    </Button>
                </View>
            </View>
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
        </Container>
    )
}

export default CheckPoint

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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    divider: {
        height: 3,
        marginTop: 8,
        marginBottom: 8,
        backgroundColor: '#bdbdbd'
    },
    card: {
        backgroundColor: 'white',
        elevation: 8,
        borderRadius: 6,
        margin: 8,
        padding: 8,
    },
    btnTambah: {
        margin: 8,
        backgroundColor: '#252A34',
        borderRadius: 6,
        elevation: 6
    },
    btnView: (list) => ({
        margin: 8,
        backgroundColor: list == 0 ? '#bdbdbd' : '#00695c',
        borderRadius: 6,
        elevation: 6
    }),
    btnClose: {
        margin: 8,
        backgroundColor: '#252A34',
        borderRadius: 6,
        elevation: 6
    },
    btnUbah: {
        margin: 8,
        backgroundColor: '#3F72AF',
        borderRadius: 6,
        elevation: 6
    },
    btnShowTask: {
        margin: 8,
        backgroundColor: '#3f51b5',
        borderRadius: 6,
        elevation: 6
    },
    btnFont: {
        fontSize: 17,
        fontWeight: '700',
        color: 'white'
    }
})
