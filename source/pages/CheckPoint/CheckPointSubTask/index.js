import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Container, Text, Header, Title, Left, Body, Button, Right } from 'native-base';
import Modal from 'react-native-modal'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'SatpamDatabase.db' });

const CheckPointSubTask = ({ route }) => {
    const navigation = useNavigation();
    const { id_task, sub_task } = route.params;

    const [isLoading, setisLoading] = useState(false);
    const [listLocal, setlistLocal] = useState([]);
    const [netInfo, setnetInfo] = useState(false);

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

    const onRefresh = React.useCallback(async () => {
        setisLoading(true);
        getDataSubTaskLokal()
        sub_task
    }, [isLoading]);

    useEffect(() => {
        console.log('ID task :',id_task);
        console.log(sub_task);
        NetInfo.addEventListener((state) => {
            setnetInfo(state.isConnected)
        })
        getDataSubTaskLokal()
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
                <Body style={{ flex: 1 }} >
                    <Title>Detail Task</Title>
                </Body>
                <Right style={{ flex: 0.5 }} >
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
                        netInfo == true ?
                            sub_task.length == 0 ?
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                                    <Text style={{ color: '#bdbdbd', fontSize: 17 }} >Data Local Kosong</Text>
                                </View>
                                :
                                sub_task.map((item, index) => {
                                    return <View style={styles.card} key={index} >
                                        <Text style={{ fontSize: 17, fontWeight: '700', color: 'black' }} >{item.sub_task}</Text>
                                        <Text style={{ fontSize: 16, fontWeight: '600', color: 'black' }} >{item.keterangan}</Text>
                                        <View style={styles.divider} />
                                        <View style={{ margin: 8 }} >
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
                                            <Button full style={styles.btnUbah} onPress={() => {
                                                navigation.navigate('EditCheckPointSubTask', {
                                                    id: item.id,
                                                    id_task: id_task,
                                                    sub_task: item.sub_task,
                                                    ket: item.keterangan,
                                                    is_aktif: item.is_aktif
                                                })
                                            }} >
                                                <Text style={styles.btnFont} >Ubah Sub Task</Text>
                                            </Button>
                                        </View>
                                    </View>
                                })
                            :
                            listLocal.length== 0 ?
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                                    <Text style={{ color: '#bdbdbd', fontSize: 17 }} >Data Kosong</Text>
                                </View>
                                :
                                listLocal.map((item, index) => {
                                    return <View style={styles.card} key={index} >
                                        <Text style={{ fontSize: 17, fontWeight: '700', color: 'black' }} >{item.sub_task}</Text>
                                        <Text style={{ fontSize: 16, fontWeight: '600', color: 'black' }} >{item.keterangan}</Text>
                                        <View style={styles.divider} />
                                        <View style={{ margin: 8 }} >
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
                                            <Button full style={styles.btnUbah} onPress={() => {
                                                navigation.navigate('EditCheckPointSubTask', {
                                                    id: item.id,
                                                    id_task: id_task,
                                                    sub_task: item.sub_task,
                                                    ket: item.keterangan,
                                                    is_aktif: item.is_aktif
                                                })
                                            }} >
                                                <Text style={styles.btnFont} >Ubah Detail Task</Text>
                                            </Button>
                                        </View>
                                    </View>
                                })
                    }
                </ScrollView>
                <View style={{ margin: 8 }} >
                    <Button full style={styles.btnTambah} onPress={() => navigation.navigate('AddCheckPointSubTask', {
                        id_task: id_task
                    })} >
                        <Text style={styles.btnFont} >Tambah Detail Task</Text>
                    </Button>
                </View>
            </View>
        </Container>
    )
}

export default CheckPointSubTask

const styles = StyleSheet.create({
    signal: (sinyal) => ({
        backgroundColor: sinyal == true ? '#2e7d32' : '#c62828',
        width: 25,
        elevation: 6,
        height: 25,
        borderRadius: 4,
        marginRight: 20
    }),
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
    isActive: (is_aktif) => ({
        height: 50,
        alignItems: 'center',
        borderRadius: 6,
        elevation: 6,
        margin: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: is_aktif ? '#2e7d32' : '#c62828'
    }),
    btnView: {
        margin: 8,
        backgroundColor: '#00695c',
        borderRadius: 6,
        elevation: 6
    },
    btnClose: {
        margin: 8,
        backgroundColor: '#252A34',
        borderRadius: 6,
        elevation: 6
    },
    btnUbah: {
        margin: 8,
        backgroundColor: '#7D5A5A',
        borderRadius: 6,
        elevation: 6
    },
    btnShowTask: {
        margin: 8,
        backgroundColor: '#A6B1E1',
        borderRadius: 6,
        elevation: 6
    },
    btnFont: {
        fontSize: 17,
        fontWeight: '700',
        color: 'white'
    }
})
