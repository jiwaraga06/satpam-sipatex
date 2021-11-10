import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, View, TouchableOpacity, StatusBar, AsyncStorage, ScrollView, Alert, AppState } from 'react-native'
import { Container, Header, Left, Body, Title, Text, Button, Spinner } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import Geolocation from 'react-native-geolocation-service';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import BackgroundTimer from 'react-native-background-timer';
import { apiDataCheckPoint, apiLogout, apiPostHistoryLokasiSecurity, apiToken } from '../../API';
import { deleteValueTableHistorySecurity, insertValueTableCheckpoint, insertValueTableHistorySecurity, insertValueTableSubTask, insertValueTableTask } from '../../SQLITE';
import Netinfo, { useNetInfo } from '@react-native-community/netinfo';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'SatpamDatabase.db' });

var sockectVariable = 'https://api2.sipatex.co.id:2053';
const io = require('socket.io-client');

const Home = () => {
    const navigation = useNavigation();
    var intervalPost;

    const appState = useRef(AppState.currentState);
    const [AppStateVisible, setAppStateVisible] = useState(appState.current);

    const [loadingLogout, setloadingLogout] = useState(false);
    const [dataLocal, setdataLocal] = useState([]);
    const [nama, setnama] = useState('');
    const [barcode, setbarcode] = useState('');
    const [gender, setgender] = useState('');
    const [role, setrole] = useState([]);
    const [checkpoint, setcheckpoint] = useState([]);
    const [task, settask] = useState([]);
    const [sub_task, setsub_task] = useState([]);

    const getProfile = async () => {
        const barc = await AsyncStorage.getItem('barcode');
        const name = await AsyncStorage.getItem('nama');
        const warna = await AsyncStorage.getItem('warna');
        const gen = await AsyncStorage.getItem('gender');
        const roles = await AsyncStorage.getItem('role');
        setbarcode(barc);
        setnama(name);
        setgender(gen)
        console.log(roles);
        setrole(JSON.parse(roles));
    }

    const logOut = async () => {
        const barcode = await AsyncStorage.getItem('barcode');
        setloadingLogout(true);
        try {
            const response = await fetch(apiLogout(), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': apiToken()
                },
                body: JSON.stringify({
                    'barcode': barcode
                })
            });
            const json = await response.json();
            if (json.message == 'Logout berhasil') {
                AsyncStorage.removeItem('barcode');
                AsyncStorage.removeItem('nama');
                AsyncStorage.removeItem('warna');
                AsyncStorage.removeItem('gender');
                AsyncStorage.removeItem('role');
                navigation.replace('TabView');
                setloadingLogout(false);
            }
        } catch (error) {
            console.log('Error : ', error);
        }
    }
    const sendEmit = async (latitude, longitude) => {
        const socket = io.connect(sockectVariable);
        const barcode = await AsyncStorage.getItem('barcode');
        const nama = await AsyncStorage.getItem('nama');
        const warna = await AsyncStorage.getItem('warna');
        const gender = await AsyncStorage.getItem('gender');
        const tahun = new Date().getFullYear();
        const bulan = new Date().getMonth() + 1;
        const day = new Date().getDate();
        const waktu = new Date().toLocaleTimeString();
        var days;
        if (day.toString().length <= 2) {
            days = `0${day}`
        } else {
            days = day
        }
        var date = `${tahun}-${bulan}-${days} ${waktu}`;
        insertValueTableHistorySecurity(barcode, nama, latitude, longitude, warna, gender, date);
        socket.emit('test', {
            "barcode": barcode,
            "nama": nama,
            "lat": latitude,
            "lng": longitude,
            "warna": warna,
            "gender": gender,
            'waktu': date
        })
    }

    const postOnline = async () => {
        Netinfo.addEventListener((state) => {
            if (state.isConnected) {
                var temp = [];
                var array = [];
                db.transaction((tx) => {
                    tx.executeSql('SELECT * FROM table_history', [], async (tx, results) => {
                        for (let i = 0; i < results.rows.length; ++i)
                            temp.push(results.rows.item(i));
                        temp.map((e) => {
                            const a = {
                                'barcode': e.barcode,
                                'nama': e.nama,
                                'lat': e.lat,
                                'lng': e.lng,
                                'warna': e.warna,
                                'gender': e.gender,
                                'waktu': e.waktu
                            }
                            array.push(a)
                        })
                        const data = {
                            'data_lokasi': array
                        }
                        try {
                            const response = await fetch(apiPostHistoryLokasiSecurity(), {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'Authorization': apiToken()
                                },
                                body: JSON.stringify(data)
                            });
                            const json = await response.json();
                            if (json == 'Holding') {
                                console.log('post online di holding');
                            } else if (json.errors) {
                                console.log(json.errors);

                            } else if (json) {
                                console.log(json);
                                deleteValueTableHistorySecurity()
                            }
                        } catch (error) {
                            console.log('Error Post Online history : ', error);
                            // Alert.alert('Information Error Post Online', error)

                        }
                    });
                });
            } else {
                console.log('Signal post online offline');
            }
        })

    }

    const backgroundGeolocation = () => {
        BackgroundGeolocation.configure({
            desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
            stationaryRadius: 50,
            distanceFilter: 0,
            notificationTitle: 'Background tracking',
            notificationText: 'enabled',
            debug: false,
            startOnBoot: false,
            stopOnTerminate: true,
            locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
            interval: 10000,
            fastestInterval: 5000,
            activitiesInterval: 10000,
            stopOnStillActivity: false,
        });
        BackgroundGeolocation.start()
        BackgroundGeolocation.on('start', () => {
            console.log('[INFO] BackgroundGeolocation service has been started');
        });
        BackgroundGeolocation.on('location', (position) => {
            // console.log('Position : ',position);
            sendEmit(position.latitude, position.longitude);
        });
        BackgroundGeolocation.on('background', () => {
            console.log('[INFO] App is in background');
            BackgroundTimer.clearInterval(intervalPost);
            intervalPost = BackgroundTimer.setInterval(() => {
                postOnline()
            }, 300000)
        });

        BackgroundGeolocation.on('foreground', () => {
            console.log('[INFO] App is in foreground');
            BackgroundTimer.clearInterval(intervalPost);
            intervalPost = BackgroundTimer.setInterval(() => {
                postOnline()
            }, 300000)
        });
    }

    const getDataLocal = async () => {
        const datalocal = await AsyncStorage.getItem('datalocal');
        var parse = JSON.parse(datalocal);
        var parser = parse.data;
        // AsyncStorage.removeItem('datalocal');
        if (datalocal == null) {
            console.log(dataLocal);
        } else {
            setdataLocal(parser)
            // console.log(dataLocal.length);
        }
    }

    const saveLocal = async () => {
        var array = [];
        // settask([]);
        // setsub_task([]);
        const barcode = await AsyncStorage.getItem('barcode');
        try {
            const response = await fetch(apiDataCheckPoint(barcode), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': apiToken()
                }
            });
            const json = await response.json();
            array.push(json)
            array.map((data, index) => {
                data.map((item, ix) => {
                    // console.log(item);
                    insertValueTableCheckpoint(
                        item.id,
                        item.nama_lokasi,
                        item.lati,
                        item.longi,
                        item.keterangan,
                        item.created_at,
                        item.updated_at,
                        item.user_creator
                    );
                    item.tasks.map((e, i) => {
                        // console.log(e);
                        insertValueTableTask(
                            e.id,
                            e.id_lokasi,
                            e.task,
                            e.user_creator,
                            e.created_at,
                            e.updated_at,
                        )
                        e.sub_task.map((sb, id) => {
                            console.log(sb);
                            insertValueTableSubTask(
                                sb.id,
                                sb.id_task,
                                sb.sub_task,
                                sb.keterangan,
                                sb.is_aktif,
                                sb.created_at,
                                sb.updated_at,
                            )
                        })
                    })
                })
            })
        } catch (error) {
            console.log('Error get api data checkpoint : ', error);
        }
    }

    const backgroundState = (nextAppState) => {
        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            console.log("App has come to the foreground!");
        }

        appState.current = nextAppState;
        setAppStateVisible(appState.current);
        console.log("AppState :", appState.current);
        if (appState.current == 'background') {
            Netinfo.addEventListener((state) => {
                if (state.isConnected) {
                    const socket = io.connect(sockectVariable);
                    socket.on('connect', () => {
                        console.log('socket connect background');
                    })
                    socket.on('task_update', (task_update) => {
                        console.log('Listen Task Update Background', task_update);
                    })
                    socket.on('disconnect', () => {
                        console.log('socket disconnect background');
                    })
                }
            })
        }
    }
    var intervalSaveLokal;

    useEffect(() => {
        const socket = io.connect(sockectVariable);
        socket.on('connect', () => {
            console.log('socket connect');
        })
        socket.on('task_update', (task_update) => {
            console.log('Listen Task Update Foreground', task_update);
            saveLocal()
        })
        socket.on('disconnect', () => {
            console.log('socket disconnect');
        })
        saveLocal()
        getDataLocal();
        intervalPost = BackgroundTimer.setInterval(() => {
            postOnline()
        }, 300000)
        BackgroundGeolocation.stop();
        BackgroundGeolocation.removeAllListeners();
        BackgroundGeolocation.deleteAllLocations();
        setTimeout(() => {
            backgroundGeolocation()
        }, 2000);
        getProfile()
        AppState.addEventListener('change', backgroundState)
        // return () => {
        //     AppState.removeEventListener('change', backgroundState)
        // }
    }, []);

    return (
        <Container>
            <StatusBar backgroundColor='#252A34' barStyle='light-content' />
            <View style={{ flex: 1 }} >
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: "center" }}>
                        <MaterialCommunityIcons
                            name='account-box'
                            size={30}
                            color='white' />
                        <View style={{ margin: 8 }} >
                            <Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }} >Hallo, {nama}</Text>
                            <Text style={{ color: 'white', fontSize: 16 }} >{barcode}</Text>
                        </View>
                    </View>
                    <View style={styles.signal(useNetInfo().isConnected)} />
                </View>
                <ScrollView>
                    <View style={{ margin: 8 }} >
                        <Button onPress={()=> navigation.navigate('LokalSecurity') } >
                            <Text>Ke lokal</Text>
                        </Button>
                        <Text style={styles.font} >Information</Text>
                        {
                            role.length == 0 ?
                                <Spinner color='black' />
                                : role.length > 1 ?
                                    <View>
                                        <View style={styles.viewInfo} >
                                            {
                                                <View>
                                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }} >Data Local Transaksi</Text>
                                                    <Button full style={{ backgroundColor: '#ff9800', borderRadius: 6, height: 33, margin: 8 }}
                                                        onPress={() => {
                                                            navigation.navigate('Datalokal')
                                                        }}>
                                                        <Text>Data lokal</Text>
                                                    </Button>
                                                </View>
                                            }
                                            <MaterialCommunityIcons
                                                name='database'
                                                color='white'
                                                size={50}
                                            />
                                        </View>
                                        <View style={styles.viewCheckpoint} >
                                            {
                                                <View>
                                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }} >Data Local Checkpoint</Text>
                                                    <Button full style={{ backgroundColor: '#1e88e5', borderRadius: 6, height: 33, margin: 8 }}
                                                        onPress={() => {
                                                            navigation.navigate('LocalCheckpoint')
                                                        }}>
                                                        <Text>Lokal Checkpoint</Text>
                                                    </Button>
                                                </View>
                                            }
                                            <MaterialCommunityIcons
                                                name='database'
                                                color='white'
                                                size={50}
                                            />
                                        </View>
                                    </View>
                                    : role[0] == 'admin_scr' ?
                                        <View style={styles.viewCheckpoint} >
                                            {
                                                <View>
                                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }} >Data Local</Text>
                                                    <Button full style={{ backgroundColor: '#1e88e5', borderRadius: 6, height: 33, margin: 8 }}
                                                        onPress={() => {
                                                            navigation.navigate('LocalCheckpoint')
                                                        }}>
                                                        <Text>Lokal Checkpoint</Text>
                                                    </Button>
                                                </View>
                                            }
                                            <MaterialCommunityIcons
                                                name='database'
                                                color='white'
                                                size={50}
                                            />
                                        </View>
                                        :
                                        <View style={styles.viewInfo} >
                                            {
                                                <View>
                                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }} >Data Local</Text>
                                                    <Button full style={{ backgroundColor: '#ff9800', borderRadius: 6, height: 33, margin: 8 }}
                                                        onPress={() => {
                                                            navigation.navigate('Datalokal')
                                                        }}>
                                                        <Text>Data lokal</Text>
                                                    </Button>
                                                </View>
                                            }
                                            <MaterialCommunityIcons
                                                name='database'
                                                color='white'
                                                size={50}
                                            />
                                        </View>
                        }

                    </View>
                    <View style={{ margin: 8 }} >
                        <Text style={styles.font} >Menu</Text>
                    </View>
                    {
                        role.length == 0 ?
                            <Spinner color='black' />
                            : role.length > 1 ?
                                <View>
                                    <View style={{ margin: 8 }} >
                                        <View style={styles.checkPoint} >
                                            <View>
                                                <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }} >Data CheckPoint</Text>
                                                <Button style={{ height: 35, margin: 8, borderRadius: 6, elevation: 6, backgroundColor: 'white' }}
                                                    onPress={() => navigation.navigate('CheckPoint')}>
                                                    <Text style={{ color: '#112D4E' }} >Lihat Data</Text>
                                                </Button>
                                            </View>
                                            <MaterialIcons
                                                name='location-on'
                                                color='white'
                                                size={50}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ margin: 8 }} >
                                        <View style={styles.menuScanQR} >
                                            <View>
                                                <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }} >Scan QR Code</Text>
                                                <Button style={{ height: 35, margin: 8, borderRadius: 6, elevation: 6, backgroundColor: 'white' }}
                                                    onPress={() => navigation.navigate('ScanQR')} >
                                                    <Text style={{ color: '#0277bd' }} >Scan Disini</Text>
                                                </Button>
                                            </View>
                                            <MaterialIcons
                                                name='qr-code-2'
                                                color='white'
                                                size={40}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ margin: 8 }} >
                                        <View style={styles.viewHistory} >
                                            <View>
                                                <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }} >History Transaksi</Text>
                                                <Button style={{ height: 35, margin: 8, borderRadius: 6, elevation: 6, backgroundColor: 'white' }}
                                                    onPress={() => navigation.navigate('HistoryTransaksiAbsen')} >
                                                    <Text style={{ color: '#009688' }} >Lihat Data</Text>
                                                </Button>
                                            </View>
                                            <MaterialIcons
                                                name='history'
                                                color='white'
                                                size={40}
                                            />
                                        </View>
                                    </View>
                                </View>
                                : role[0] == 'admin_scr' ?
                                    <View>
                                        <View style={{ margin: 8 }} >
                                            <View style={styles.checkPoint} >
                                                <View>
                                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }} >Data CheckPoint</Text>
                                                    <Button style={{ height: 35, margin: 8, borderRadius: 6, elevation: 6, backgroundColor: 'white' }}
                                                        onPress={() => navigation.navigate('CheckPoint')}>
                                                        <Text style={{ color: '#112D4E' }} >Lihat Data</Text>
                                                    </Button>
                                                </View>
                                                <MaterialIcons
                                                    name='location-on'
                                                    color='white'
                                                    size={50}
                                                />
                                            </View>
                                        </View>
                                        <View style={{ margin: 8 }} >
                                            <View style={styles.viewHistory} >
                                                <View>
                                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }} >History Transaksi</Text>
                                                    <Button style={{ height: 35, margin: 8, borderRadius: 6, elevation: 6, backgroundColor: 'white' }}
                                                        onPress={() => navigation.navigate('HistoryTransaksiAbsen')} >
                                                        <Text style={{ color: '#009688' }} >Lihat Data</Text>
                                                    </Button>
                                                </View>
                                                <MaterialIcons
                                                    name='history'
                                                    color='white'
                                                    size={40}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                    : <View>
                                        <View style={{ margin: 8 }} >
                                            <View style={styles.menuScanQR} >
                                                <View>
                                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }} >Scan QR Code</Text>
                                                    <Button style={{ height: 35, margin: 8, borderRadius: 6, elevation: 6, backgroundColor: 'white' }}
                                                        onPress={() => navigation.navigate('ScanQR')} >
                                                        <Text style={{ color: '#0277bd' }} >Scan Disini</Text>
                                                    </Button>
                                                </View>
                                                <MaterialIcons
                                                    name='qr-code-2'
                                                    color='white'
                                                    size={40}
                                                />
                                            </View>
                                        </View>
                                        <View style={{ margin: 8 }} >
                                            <View style={styles.viewHistory} >
                                                <View>
                                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }} >History Transaksi</Text>
                                                    <Button style={{ height: 35, margin: 8, borderRadius: 6, elevation: 6, backgroundColor: 'white' }}
                                                        onPress={() => navigation.navigate('HistoryTransaksiAbsen')} >
                                                        <Text style={{ color: '#009688' }} >Lihat Data</Text>
                                                    </Button>
                                                </View>
                                                <MaterialIcons
                                                    name='history'
                                                    color='white'
                                                    size={40}
                                                />
                                            </View>
                                        </View>
                                    </View>
                    }

                    <View style={{ margin: 8 }} >
                        <View style={styles.logout} >
                            <View>
                                <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }} >Keluar Akun</Text>
                                <Button style={{ height: 35, margin: 8, borderRadius: 6, elevation: 6, backgroundColor: 'white' }}
                                    onPress={logOut}  >
                                    <Text style={{ color: '#c62828' }} >Keluar Akun</Text>
                                </Button>
                            </View>
                            <MaterialCommunityIcons
                                name='logout'
                                color='white'
                                size={40}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
            {/* LOADING */}
            <Modal isVisible={loadingLogout} >
                <View style={{ backgroundColor: 'white' }} >
                    <Spinner color='#252A34' />
                </View>
            </Modal>
        </Container>
    )
}

export default Home

const styles = StyleSheet.create({
    signal: (sinyal) => ({
        backgroundColor: sinyal == true ? '#2e7d32' : '#c62828',
        width: 25,
        elevation: 6,
        height: 25,
        borderRadius: 4,
        marginRight: 20
    }),
    header: {
        backgroundColor: "#252A34",
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingLeft: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    font: {
        fontSize: 20,
        color: 'black',
        fontWeight: '700'
    },
    viewInfo: {
        marginTop: 8,
        backgroundColor: '#0d47a1',
        borderRadius: 6,
        elevation: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        height: 120
    },
    viewCheckpoint: {
        marginTop: 8,
        backgroundColor: '#105652',
        borderRadius: 6,
        elevation: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        height: 120
    },
    viewHistory: {
        marginTop: 8,
        backgroundColor: '#009688',
        borderRadius: 6,
        elevation: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        height: 120
    },
    menuScanQR: {
        marginTop: 8,
        backgroundColor: '#0277bd',
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        height: 120
    },
    checkPoint: {
        marginTop: 8,
        backgroundColor: '#112D4E',
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        height: 120
    },
    logout: {
        marginTop: 8,
        backgroundColor: '#c62828',
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        height: 120
    },
})
