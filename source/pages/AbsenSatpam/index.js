import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, RefreshControl, AsyncStorage, Image } from 'react-native';
import { Container, Text, Header, Title, Left, Body, Right, Button, ListItem, CheckBox, Item, Textarea, Spinner } from 'native-base';
import ImgToBase64 from 'react-native-image-base64';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import NetInfo from '@react-native-community/netinfo';
import Geolocation from 'react-native-geolocation-service';
import ImagePicker from 'react-native-image-crop-picker';
import Modal from 'react-native-modal'
import { useNavigation } from '@react-navigation/native';
import { apiTransaksiAbsen, apiToken } from '../../API';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'SatpamDatabase.db' });

const AbsenSatpam = ({ route }) => {
    const navigation = useNavigation();
    const { sub_task, id_lokasi, id_task } = route.params;

    const [isLoading, setisLoading] = useState(false);
    const [netInfo, setnetInfo] = useState(false);
    const [listLocal, setlistLocal] = useState([]);
    const [dataLok, setdataLok] = useState([]);
    const [number, setnumber] = useState(-1);
    const [task, settask] = useState([]);
    const [note, setnote] = useState('');
    const [gambar, setgambar] = useState('');
    const [photo, setphoto] = useState('')
    const [check, setcheck] = useState(false);
    const [message, setmessage] = useState('');
    const [messageSuccess, setmessageSuccess] = useState('');

    const openKamera = () => {
        ImagePicker.openCamera({
            width: 300,
            height: 400,
            cropping: true,
        }).then(image => {
            setgambar(image.path)
            console.log(image);
            ImgToBase64.getBase64String(image.path)
                .then(base64String => setphoto(`data:image/png;base64,${base64String}`))
                .catch(err => console.log('Error Base 64 : ', err));
        });
    }
    const getDataSubTaskLokal = () => {
        setisLoading(true)
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM table_sub_task WHERE id_task=?', [id_task], (tx, results) => {
                var temp = [];
                // console.log('ress ',results.rowsAffected);
                for (let i = 0; i < results.rows.length; ++i)
                    temp.push(results.rows.item(i));
                console.log('Dari Lokal', temp);
                setisLoading(false)
                setlistLocal(temp)
            });
        });
    }


    const add = () => {
        NetInfo.addEventListener((state) => {
            if (state.isConnected) {
                // for (let index = 0; index < sub_task.length; index++) {
                //     const data = {
                //         "sub_task_id": index + 1,
                //         "photo": "",
                //         "checklist": "",
                //         "note": "-"
                //     }
                //     settask((rev) => [...rev, data])

                // }
            } else {
                for (let index = 0; index < listLocal.length; index++) {
                    const data = {
                        "sub_task_id": index + 1,
                        "photo": "",
                        "checklist": "",
                        "note": "-"
                    }
                    settask((rev) => [...rev, data])

                }

            }
        })
    }


    var parse;
    const getDataLocal = async () => {
        const datalocal = await AsyncStorage.getItem('datalocal');
        parse = JSON.parse(datalocal);
        var parser = parse;
        console.log('Parser: ',parser);
        // AsyncStorage.removeItem('datalocal');
        if (datalocal == null) {
            // console.log(parser);
        } else {
            // console.log(parser);
            parser.map((e) => {
                // console.log('E: ',e);
                const isi = {
                    'barcode':e.barcode,
                    'id_lokasi':e.id_lokasi,
                    'id_sync':e.id_sync,
                    'lati':e.lati,
                    'longi':e.longi,
                    'tgl_absen':e.tgl_absen,
                    'tasks':e.tasks
                }
                setdataLok((rev) => [...rev,isi])
            })
        }
    }

    const postTransaksi = async () => {
        // setisLoading(true)
        const tahun = new Date().getFullYear();
        const bulan = new Date().getMonth() + 1;
        const day = new Date().getDate();
        const waktu = new Date().toLocaleTimeString();
        const barcode = await AsyncStorage.getItem('barcode');
        var days;
        if (day.toString().length <= 2) {
            days = `0${day}`
        } else {
            days = day
        }
        setisLoading(true);
        Geolocation.getCurrentPosition(async (position) => {
            NetInfo.addEventListener(async (state) => {
                if(state.isConnected){
                const data = {
                    "data": [{
                        "tgl_absen": `${tahun}-${bulan}-${days} ${waktu}`,
                        "barcode": barcode,
                        "id_lokasi": id_lokasi,
                        "lati": position.coords.latitude,
                        "longi": position.coords.longitude,
                        "id_sync": null,
                        'tasks': task
                    }]
                }
                try {
                    const response = await fetch(apiTransaksiAbsen(), {
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
                    if (json.errors) {
                        setmessage(json.message);
                        setisLoading(false)
                    } else {
                        setmessageSuccess(json.message);
                        setisLoading(false)

                    }
                } catch (error) {
                    console.log('Error : ', error);
                }
                } else {         
                const data =
                {
                    "tgl_absen": `${tahun}-${bulan}-${days} ${waktu}`,
                    "barcode": barcode,
                    "id_lokasi": id_lokasi,
                    "lati": position.coords.latitude,
                    "longi": position.coords.longitude,
                    "id_sync": null,
                    'tasks': task
                }
                // dataLok.push(data)
                setdataLok((rev) => [...rev,data])
                console.log(dataLok);
                AsyncStorage.setItem('datalocal', JSON.stringify(dataLok))
                    .then((res) => {
                        console.log('Res', res);
                        setisLoading(false)
                        setmessageSuccess('Berhasil Simpan Data Lokal')
                    })
                    .catch((err) => console.log(err))
                }
            })

            /////
        }, error => {
            console.log('Error Get Lokasi: ', error);
        }, {
            accuracy: 1,
            enableHighAccuracy: true,
            distanceFilter: 1,
        })

    }

    useEffect(() => {
        // console.log(sub_task);
        NetInfo.addEventListener((state) => {
            setnetInfo(state.isConnected)
        })
        getDataSubTaskLokal()
        add()
        getDataLocal()
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
                <Body style={{ flex: 1.2 }} >
                    <Title>Task</Title>
                </Body>
                <Right style={{ flex: 1 }} >
                    <View style={styles.signal(netInfo)} />
                </Right>
            </Header>
            <View style={{ flex: 1 }} >
                <ScrollView>
                    {
                        netInfo == false ?
                            // <View />
                            sub_task == null ?
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                                    <Text style={{ color: '#bdbdbd', fontSize: 17 }} >Data Kosong</Text>
                                </View>
                                :
                                sub_task.map((item, index) => {
                                    return <View key={index} style={styles.card} >
                                        <View style={{ margin: 8 }} >
                                            <Text style={{ fontSize: 17, fontWeight: '700' }} >{item.sub_task}</Text>
                                        </View>
                                        <View style={styles.isActive(item.is_aktif)} >
                                            {
                                                item.is_aktif == 1 ?
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                                                        <FontAwesome
                                                            name='check-circle'
                                                            size={30}
                                                            color='white'
                                                            style={{ marginRight: 8 }} />
                                                        <Text style={{ fontSize: 17, fontWeight: '700', color: 'white' }} >Active</Text>
                                                    </View>
                                                    : <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                                                        <FontAwesome
                                                            name='close'
                                                            size={30}
                                                            color='white'
                                                            style={{ marginRight: 8 }} />
                                                        <Text style={{ fontSize: 17, fontWeight: '700', color: 'white' }} >In Active</Text>
                                                    </View>
                                            }
                                        </View>
                                        <View style={{ margin: 8 }} >
                                            <Button full style={styles.btnIsi} onPress={() => { setnumber(index); }} >
                                                <Text style={styles.btnFont} >Isi Task</Text>
                                            </Button>
                                        </View>
                                    </View>
                                })
                            : listLocal.map((item, index) => {
                                return <View key={index} style={styles.card} >
                                    <View style={{ margin: 8 }} >
                                        <Text style={{ fontSize: 17, fontWeight: '700' }} >{item.sub_task}</Text>
                                    </View>
                                    <View style={styles.isActive(item.is_aktif)} >
                                        {
                                            item.is_aktif == 1 ?
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                                                    <FontAwesome
                                                        name='check-circle'
                                                        size={30}
                                                        color='white'
                                                        style={{ marginRight: 8 }} />
                                                    <Text style={{ fontSize: 17, fontWeight: '700', color: 'white' }} >Active</Text>
                                                </View>
                                                : <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                                                    <FontAwesome
                                                        name='close'
                                                        size={30}
                                                        color='white'
                                                        style={{ marginRight: 8 }} />
                                                    <Text style={{ fontSize: 17, fontWeight: '700', color: 'white' }} >In Active</Text>
                                                </View>
                                        }
                                    </View>
                                    <View style={{ margin: 8 }} >
                                        <Button full style={styles.btnIsi} onPress={() => { setnumber(index); }} >
                                            <Text style={styles.btnFont} >Isi Task</Text>
                                        </Button>
                                    </View>
                                </View>
                            })
                    }
                </ScrollView>
                <View style={{ margin: 8 }} >
                    <Button full style={styles.btnSubmit} onPress={() => {
                        // console.log(task);
                        postTransaksi()
                    }} >
                        <Text style={styles.btnFont} >Submit</Text>
                    </Button>
                </View>
            </View>
            <Modal isVisible={number != -1 ? true : false} >
                <View style={{ flex: 1, backgroundColor: 'white' }} >
                    <ScrollView>
                        <View style={{ alignItems: 'center' }} >
                            <TouchableOpacity onPress={openKamera} >
                                <View style={styles.img} >
                                    {
                                        gambar == '' ?
                                            <Entypo
                                                name='images'
                                                color='black'
                                                size={40}
                                            />
                                            : <Image
                                                source={{ uri: gambar }}
                                                style={{ width: 280, height: 380, resizeMode: 'stretch', borderRadius: 2 }}
                                            />
                                    }
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ margin: 8 }} >
                            <Item regular>
                                <Textarea
                                    rowSpan={4}
                                    placeholder='Masukan Catatan'
                                    onChangeText={(value) => setnote(value)}
                                />
                            </Item>
                            <ListItem onPress={() => setcheck(!check)} >
                                <CheckBox
                                    checked={check}
                                    activeOpacity={20}
                                    style={{ width: 25, height: 25 }}
                                    onPress={() => setcheck(!check)} />
                                <Body>
                                    <Text>Check disini</Text>
                                </Body>
                            </ListItem>
                        </View>
                        <View style={{ margin: 8 }} >
                            <Button full style={styles.btnSubmit} onPress={() => {
                                setnumber(-1)
                                setgambar('');
                                setnote('')
                                settask(false);
                                let temp_state = [...task];
                                let temp_element = { ...temp_state[number] };
                                temp_element.photo = photo;
                                temp_element.note = note;
                                temp_element.checklist = check;
                                temp_state[number] = temp_element;
                                settask(temp_state);
                            }} >
                                <Text style={styles.btnFont} >Submit</Text>
                            </Button>
                            <Button full style={styles.btnBatal} onPress={() => {
                                setnumber(-1)
                                setgambar('');
                                setnote('')
                                settask(false);
                            }} >
                                <Text style={styles.btnFont} >Batal</Text>
                            </Button>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
            {/* LOADING */}
            <Modal isVisible={isLoading} >
                <View style={{ backgroundColor: 'white' }} >
                    <Spinner color='#252A34' />
                </View>
            </Modal>
            {/* MESSAGE */}
            <Modal isVisible={messageSuccess != '' ? true : false} >
                <View style={{ backgroundColor: 'white', alignItems: 'center' }} >
                    <View style={{ margin: 10, alignItems: 'center' }} >
                        <FontAwesome
                            name='check-circle'
                            color='#2e7d32'
                            size={50}
                            style={{ margin: 8 }}
                        />
                        <Text style={{ color: "black", fontSize: 17 }} >{messageSuccess}</Text>
                    </View>
                    <Button full style={styles.btnClose} onPress={() => {
                        setmessageSuccess('');
                        navigation.goBack()
                    }} >
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

export default AbsenSatpam

const styles = StyleSheet.create({
    signal: (sinyal) => ({
        backgroundColor: sinyal == true ? '#2e7d32' : '#c62828',
        width: 25,
        elevation: 6,
        height: 25,
        borderRadius: 4,
        marginRight: 20
    }),
    card: {
        margin: 8,
        padding: 8,
        borderRadius: 6,
        backgroundColor: 'white',
        elevation: 8,
    },
    isActive: (is_aktif) => ({
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        elevation: 6,
        margin: 8,
        backgroundColor: is_aktif ? '#2e7d32' : '#c62828'
    }),
    btnSubmit: {
        backgroundColor: '#2e7d32',
        borderRadius: 6,
        elevation: 6,
        margin: 8
    },
    btnClose: {
        backgroundColor: '#252A34',
        borderRadius: 6,
        elevation: 6,
        margin: 8
    },
    btnBatal: {
        backgroundColor: '#c62828',
        borderRadius: 6,
        elevation: 6,
        margin: 8
    },
    btnIsi: {
        backgroundColor: '#2196f3',
        borderRadius: 6,
        elevation: 6,
        margin: 8
    },
    btnFont: {
        fontSize: 17,
        color: 'white',
        fontWeight: '700'
    },
    img: {
        borderRadius: 6,
        borderColor: '#bdbdbd',
        borderWidth: 3,
        width: 300,
        height: 400,
        margin: 8,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
