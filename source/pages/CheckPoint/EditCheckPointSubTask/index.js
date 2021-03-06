import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, RefreshControl, Alert, AsyncStorage } from 'react-native';
import { Container, Text, Header, Title, Left, Body, Button, Item, Input, Textarea, Spinner, ListItem, Radio, Right } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Geolocation from 'react-native-geolocation-service';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { apiBikinSubTask, apiBikinTask, apiToken, apiUpdateSubTask } from '../../../API';
import { updateValueTableSubTask } from '../../../SQLITE';


const EditCheckPointSubTask = ({ route }) => {
    const navigation = useNavigation();
    const { id, id_task, sub_task, ket, is_aktif } = route.params;

    const [netInfo, setnetInfo] = useState(false);
    const [subTask, setsubTask] = useState('');
    const [keterangan, setketerangan] = useState('');
    const [isAktif, setisAktif] = useState(-1);
    const [isLoading, setisLoading] = useState(false);
    const [message, setmessage] = useState('');
    const [messagesuccess, setmessagesuccess] = useState('');
    const [errsubTask, seterrsubTask] = useState('');
    const [errKet, seterrKet] = useState('');
    const [errisAktif, seterrisAktif] = useState('');

    const postUpdateCheckpointSubTask = async () => {
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
            "id": id,
            "id_task": id_task,
            "sub_task": subTask,
            "keterangan": keterangan,
            "is_aktif": isAktif
        }
        NetInfo.addEventListener(async (state) => {
        if (state.isConnected) {
            setisLoading(true);
            try {
                const response = await fetch(apiUpdateSubTask(), {
                    method: 'Put',
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
                if (json.errors) {
                    setisLoading(false);
                    setmessage(json.message);
                    seterrsubTask(json.errors.sub_task);
                    seterrKet(json.errors.keterangan);
                    seterrisAktif(json.errors.is_aktif);
                } else {
                    setisLoading(false);
                    setmessagesuccess(json);
                    // navigation.goBack();
                }
            } catch (error) {
                console.log('Error Update Checkpoint : ', error);
                Alert.alert('information', error)
            }
        } else {
            if (!subTask && !keterangan) {
                seterrKet('Keterangan Harus di isi');
                setsubTask('Sub task harus di isi');
                return true;
            }
            updateValueTableSubTask(id_task, subTask, keterangan, isAktif, date, id)
        }
        })
    }
    useEffect(() => {
        setsubTask(sub_task);
        setisAktif(is_aktif);
        setketerangan(ket)
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
                <Body style={{ flexGrow: 1.3 }} >
                    <Title>Edit Detail Task</Title>
                </Body>
                <Right style={{ flex: 0.5 }} >
                    <View style={styles.signal(netInfo)} />
                </Right>
            </Header>
            <View style={{ flex: 1 }} >
                <ScrollView>
                    <View style={{ margin: 8 }} >
                        <Item regular style={{ margin: 8 }} >
                            <Input
                                value={subTask}
                                placeholder='Masukan Nama Task'
                                onChangeText={(value) => setsubTask(value)}
                            />
                        </Item>
                        {
                            errsubTask != '' ?
                                <Text style={{ color: '#c62828', fontSize: 16 }} >{errsubTask}</Text>
                                : <View />
                        }
                        <Item regular style={{ margin: 8 }} >
                            <Textarea
                                value={keterangan}
                                placeholder='Masukan Keterangan'
                                rowSpan={4}
                                onChangeText={(value) => setketerangan(value)}
                            />
                        </Item>
                        {
                            errKet != '' ?
                                <Text style={{ color: '#c62828', fontSize: 16 }} >{errKet}</Text>
                                : <View />
                        }
                        <View style={{ margin: 8 }} >
                            <Text style={{ color: 'black', fontSize: 17 }} >Pilih Status</Text>
                        </View>
                        <ListItem selected={isAktif == 1 ? true : false}
                            onPress={() => setisAktif(1)} >
                            <Left>
                                <Text>Active</Text>
                            </Left>
                            <Right>
                                <Radio
                                    onPress={() => setisAktif(1)}
                                    color={"#5cb85c"}
                                    selectedColor={"#5cb85c"}
                                    selected={isAktif == 1 ? true : false}
                                />
                            </Right>
                        </ListItem>
                        <ListItem selected={isAktif == 0 ? true : false}
                            onPress={() => setisAktif(0)}>
                            <Left>
                                <Text>In Active</Text>
                            </Left>
                            <Right>
                                <Radio
                                    onPress={() => setisAktif(0)}
                                    color={"#c62828"}
                                    selectedColor={"#c62828"}
                                    selected={isAktif == 0 ? true : false}
                                />
                            </Right>
                        </ListItem>
                        {
                            errisAktif != '' ?
                                <Text style={{ color: '#c62828', fontSize: 16 }} >{errisAktif}</Text>
                                : <View />
                        }
                        <View>
                            <Button full style={styles.btnSubmit} onPress={postUpdateCheckpointSubTask} >
                                <Text style={styles.btnFont}>Submit</Text>
                            </Button>
                            <Button full style={styles.btnBatal} onPress={() => navigation.goBack()} >
                                <Text style={styles.btnFont}>Batal</Text>
                            </Button>
                        </View>
                    </View>
                </ScrollView>
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
            {/* LOADING */}
            <Modal isVisible={isLoading} >
                <View style={{ backgroundColor: 'white' }} >
                    <Spinner color='#252A34' />
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
                    <Button full style={styles.btnClose} onPress={() => { setmessagesuccess('') }} >
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

export default EditCheckPointSubTask

const styles = StyleSheet.create({
    signal: (sinyal) => ({
        backgroundColor: sinyal == true ? '#2e7d32' : '#c62828',
        width: 25,
        elevation: 6,
        height: 25,
        borderRadius: 4,
        marginRight: 20
    }),
    btnFont: {
        fontSize: 17,
        fontWeight: '700',
        color: 'white'
    },
    btnClose: {
        backgroundColor: '#252A34',
        borderRadius: 6,
        elevation: 6,
        margin: 8
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

})
