import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, View, TouchableOpacity, StatusBar, AsyncStorage, ScrollView, Alert, AppState, FlatList } from 'react-native'
import { Container, Header, Left, Body, Title, Text, Button, Spinner } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import Geolocation from 'react-native-geolocation-service';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import BackgroundTimer from 'react-native-background-timer';
import { apiCheckPoint, apiLogout, apiPostHistoryLokasiSecurity, apiRadius, apiToken } from '../../API';
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
                BackgroundGeolocation.stop();
                BackgroundGeolocation.removeAllListeners();
                BackgroundGeolocation.deleteAllLocations();
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
        const waktu = new Date().toLocaleTimeString();
        const day = new Date().getDate();
        var days;
        if (day.toString().length < 2) {
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
            notificationTitle: 'Security',
            notificationText: 'Security Tracking Location',
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
            const response = await fetch(apiCheckPoint(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': apiToken()
                }
            });
            const json = await response.json();
            console.log('Json save local',json);
            array.push(json)
           if(array.length != 0){
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
                            // console.log(sb);
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
           }
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
                        saveLocal()
                    })
                    socket.on('disconnect', () => {
                        console.log('socket disconnect background');
                    })
                }
            })
        }
    }

    useEffect(() => {
        getDataLocal();
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
        Netinfo.addEventListener((state) => {
            if (state.isConnected) {
                saveLocal()
            } 
        })
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
                        {/* <Button onPress={()=> navigation.navigate('LokalSecurity') } >
                            <Text>Ke lokal</Text>
                        </Button> */}
                        <Text style={styles.font} >Menu Offline</Text>
                        <View style={{ height: 5, backgroundColor: '#F0F0F0', borderRadius: 8, marginBottom: 8 }} />
                        {
                            role.length == 0 ?
                                <Spinner color='black' />
                                : role.length > 1 ?
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                        <TouchableOpacity onPress={() => { navigation.navigate('Datalokal') }}>
                                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                                <View style={styles.viewInfo} >
                                                    <MaterialCommunityIcons
                                                        name='database'
                                                        color='white'
                                                        size={50}
                                                    />
                                                </View>
                                                <Text style={styles.fontMenu} >Absen lokal</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { navigation.navigate('LocalCheckpoint') }} >
                                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                                <View style={styles.viewCheckpoint} >
                                                    <MaterialCommunityIcons
                                                        name='database'
                                                        color='white'
                                                        size={50}
                                                    />
                                                </View>
                                                <Text> Checkpoint</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    : role[0] == 'admin_scr' ?
                                        <TouchableOpacity onPress={() => { navigation.navigate('LocalCheckpoint') }} >
                                            <View style={styles.viewCheckpoint} >
                                                <MaterialCommunityIcons
                                                    name='database'
                                                    color='white'
                                                    size={50} />
                                            </View>
                                            <Text>Checkpoint</Text>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity onPress={() => { navigation.navigate('Datalokal') }}>
                                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                                <View style={styles.viewInfo} >
                                                    <MaterialCommunityIcons
                                                        name='database'
                                                        color='white'
                                                        size={50}
                                                    />
                                                </View>
                                                <Text style={styles.fontMenu} >Menu lokal</Text>
                                            </View>
                                        </TouchableOpacity>
                        }

                    </View>
                    <View style={{ margin: 8 }} >
                        <Text style={styles.font} >Menu</Text>
                        <View style={{ height: 5, backgroundColor: '#F0F0F0', borderRadius: 8, marginBottom: 8 }} />
                    </View>
                    {
                        role.length == 0 ?
                            <Spinner color='black' />
                            : role.length > 1 ?
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }} >
                                    <TouchableOpacity onPress={() => navigation.navigate('CheckPoint')}>
                                        <View style={{ flexDirection: "column", alignItems: "center" }}>
                                            <View style={styles.checkPoint} >
                                                <MaterialIcons
                                                    name='location-on'
                                                    color='white'
                                                    size={50}
                                                />
                                            </View>
                                            <Text stFyle={styles.fontMenu}>CheckPoint</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate('ScanQR')}>
                                        <View style={{ flexDirection: "column", alignItems: "center" }}>
                                            <View style={styles.menuScanQR} >
                                                <MaterialIcons
                                                    name='qr-code-2'
                                                    color='white'
                                                    size={50}
                                                />
                                            </View>
                                            <Text stFyle={styles.fontMenu}>Scan QR</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate('HistoryTransaksiAbsen')}>
                                        <View style={{ flexDirection: 'column', alignItems: 'center' }} >
                                            <View style={styles.viewHistory} >
                                                <MaterialIcons
                                                    name='history'
                                                    color='white'
                                                    size={50}
                                                />
                                            </View>
                                            <Text style={styles.fontMenu} >History</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                : role[0] == 'admin_scr' ?
                                    <View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }} >
                                            <TouchableOpacity onPress={() => navigation.navigate('CheckPoint')}>
                                                <View style={{ flexDirection: "column", alignItems: "center" }}>
                                                    <View style={styles.checkPoint} >
                                                        <MaterialIcons
                                                            name='location-on'
                                                            color='white'
                                                            size={50}
                                                        />
                                                    </View>
                                                    <Text stFyle={styles.fontMenu}>CheckPoint</Text>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => navigation.navigate('HistoryTransaksiAbsen')}>
                                                <View style={{ flexDirection: 'column', alignItems: 'center' }} >
                                                    <View style={styles.viewHistory} >
                                                        <MaterialIcons
                                                            name='history'
                                                            color='white'
                                                            size={50}
                                                        />
                                                    </View>
                                                    <Text style={styles.fontMenu} >History</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    : <View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }} >
                                            <TouchableOpacity onPress={() => navigation.navigate('ScanQR')}>
                                                <View style={{ flexDirection: "column", alignItems: "center" }}>
                                                    <View style={styles.menuScanQR} >
                                                        <MaterialIcons
                                                            name='qr-code-2'
                                                            color='white'
                                                            size={50}
                                                        />
                                                    </View>
                                                    <Text stFyle={styles.fontMenu}>Scan QR</Text>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => navigation.navigate('HistoryTransaksiAbsen')}>
                                                <View style={{ flexDirection: 'column', alignItems: 'center' }} >
                                                    <View style={styles.viewHistory} >
                                                        <MaterialIcons
                                                            name='history'
                                                            color='white'
                                                            size={50}
                                                        />
                                                    </View>
                                                    <Text style={styles.fontMenu} >History</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                    }


                </ScrollView>
            </View>
            <TouchableOpacity onPress={logOut} >
                <View style={styles.logout} >
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }} >Keluar Akun</Text>
                </View>
            </TouchableOpacity>
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
    fontMenu: {
        fontSize: 18,
        color: 'black',
    },
    font: {
        fontSize: 20,
        color: 'black',
        fontWeight: '700'
    },
    viewInfo: {
        width: 80,
        height: 80,
        margin: 8,
        padding: 8,
        backgroundColor: '#0d47a1',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    viewCheckpoint: {
        width: 80,
        height: 80,
        margin: 8,
        padding: 8,
        backgroundColor: '#105652',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    viewHistory: {
        width: 80,
        height: 80,
        margin: 8,
        padding: 8,
        backgroundColor: '#009688',
        borderRadius: 12,
        alignItems: 'center',
    },
    menuScanQR: {
        width: 80,
        height: 80,
        margin: 8,
        padding: 8,
        backgroundColor: '#0277bd',
        borderRadius: 12,
        alignItems: 'center',
    },
    checkPoint: {
        width: 80,
        height: 80,
        margin: 8,
        padding: 8,
        backgroundColor: '#112D4E',
        borderRadius: 12,
        alignItems: 'center',
    },
    logout: {
        margin: 8,
        backgroundColor: '#c62828',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: 45
    },
})
