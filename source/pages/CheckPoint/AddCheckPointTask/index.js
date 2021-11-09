import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, RefreshControl, Alert, AsyncStorage } from 'react-native';
import { Container, Text, Header, Title, Left, Body, Button, Item, Input, Textarea, Spinner } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { apiBikinTask, apiToken } from '../../../API';
import { insertValueTableTaskForm } from '../../../SQLITE';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'SatpamDatabase.db' });

const AddCheckPointTask = ({ route }) => {
    const navigation = useNavigation();
    const { id_lokasi } = route.params;

    const [netInfo, setnetInfo] = useState(false);
    const [task, settask] = useState('');
    const [listLocal, setlistLocal] = useState([]);
    const [isLoading, setisLoading] = useState(false);
    const [message, setmessage] = useState('');
    const [messagesuccess, setmessagesuccess] = useState('');
    const [errtask, seterrtask] = useState('');

    const getDataTaskLokal = () => {
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM table_task', [], (tx, results) => {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i)
                    temp.push(results.rows.item(i));
                console.log('Dari Lokal', temp);
                temp.map((e) => {
                    const a = {
                        'id_task': e.id_task
                    }
                    setlistLocal(a);
                    console.log(listLocal);
                })
            });
        });
    }

    const postTambahCheckpointTask = async () => {
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
            'id_lokasi': id_lokasi,
            'task': task,
            'user_creator': barcode
        }
        // NetInfo.addEventListener(async (state) => {
        if (netInfo == true) {
            setisLoading(true);
            try {
                const response = await fetch(apiBikinTask(), {
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
                    setisLoading(false);
                    setmessage(json.message);
                    seterrtask(json.errors.task);
                } else {
                    setisLoading(false);
                    setmessagesuccess(json);
                    // navigation.goBack();
                }
            } catch (error) {
                console.log('Error Tambah Checkpoint : ', error);
                Alert.alert('information', error)
            }
        } else {
            if (!task) {
                seterrtask('Task Harus di Isi')
                return true;
            }
            insertValueTableTaskForm(id_lokasi, listLocal.id_task + 1, task, barcode, date, date)
        }
        // })

    }
    useEffect(() => {
        getDataTaskLokal()
        NetInfo.addEventListener((state) => {
            setnetInfo(state.isConnected)
        })
    }, []);
    return (
        <Container>
            <Header androidStatusBarColor='#252A34' style={{ backgroundColor: '#252A34' }} >
                <Left style={{ flexGrow: 1 }} >
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
                <Body style={{ flexGrow: 2.1 }} >
                    <Title>Tambah Task CheckPoint</Title>
                </Body>
            </Header>
            <View style={{ flex: 1 }} >
                <ScrollView>
                    <View style={{ margin: 8 }} >
                        <Item regular style={{ margin: 8 }} >
                            <Input
                                placeholder='Masukan Nama Task'
                                onChangeText={(value) => settask(value)}
                            />
                        </Item>
                        {
                            errtask != '' ?
                                <Text style={{ color: '#c62828', fontSize: 16 }} >{errtask}</Text>
                                : <View />
                        }
                        <View>
                            <Button full style={styles.btnSubmit} onPress={postTambahCheckpointTask} >
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
                    <Button full style={styles.btnClose} onPress={() => { setmessage('') }} >
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

export default AddCheckPointTask

const styles = StyleSheet.create({
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
