import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Alert } from 'react-native';
import { Container, Button, Text, Spinner } from 'native-base';
import { openDatabase } from 'react-native-sqlite-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import NetInfo from '@react-native-community/netinfo';
import { apiSimpanCheckPoint, apiToken } from '../../../API';
import { deleteValueTableCheckpoint } from '../../../SQLITE';
var db = openDatabase({ name: 'SatpamDatabase.db' });

const TabCheckpoint = () => {

    const [isLoading, setisLoading] = useState(false);
    const [loadingUpload, setloadingUpload] = useState(false);
    const [listLocal, setlistLocal] = useState([]);
    const [message, setmessage] = useState('');
    const [messagesuccess, setmessagesuccess] = useState('');
    const [netInfo, setnetInfo] = useState(false);

    const getLokalCheckpoint = () => {
        setisLoading(true)
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM table_checkpoint where isOffline=1', [], (tx, results) => {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i)
                    temp.push(results.rows.item(i));
                console.log(temp);
                setisLoading(false)
                setlistLocal(temp)
            });
        });
    }

    const onRefresh = React.useCallback(async () => {
        setisLoading(true);
        getLokalCheckpoint()
        
    }, [isLoading]);

    const postTambahCheckpoint = async (nama_lokasi, latitude, longitude, keterangan, barcode, id) => {
        const data = {
            'nama_lokasi': nama_lokasi,
            'lati': latitude,
            'longi': longitude,
            'keterangan': keterangan,
            'user_creator': barcode
        }
        setloadingUpload(true);
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
            if (json.errors) {
                setloadingUpload(false);
                setmessage(json.message);
            } else {
                setloadingUpload(false);
                setmessagesuccess(json);
                deleteValueTableCheckpoint(id)
                // navigation.goBack();
            }
        } catch (error) {
            setloadingUpload(false);
            console.log('Error Tambah Checkpoint : ', error);
            Alert.alert('information', error)
        }

    }

    useEffect(() => {
        getLokalCheckpoint()
        NetInfo.addEventListener((state) => {
            setnetInfo(state.isConnected)
        })
    }, []);

    return (
        <View style={{ flex: 1 }} >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
                }>
                {
                    listLocal.length == 0 ?
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                            <Text style={{ fontSize: 17 }} >Data Kosong</Text>
                        </View>
                        :
                        listLocal.map((item, index) => {
                            return <View key={index}>
                                <View style={styles.card} >
                                    <Text style={{ fontSize: 17, color: 'black' }} >User Creator</Text>
                                    <Text style={{ fontSize: 15, color: 'black', fontWeight: '700', marginTop: 4 }} >{item.user_creator}</Text>
                                    <View style={styles.divider} />
                                    <Text style={{ fontSize: 17, color: 'black' }} >Nama Lokasi</Text>
                                    <Text style={{ fontSize: 15, color: 'black', fontWeight: '700', marginTop: 4 }} >{item.nama_lokasi}</Text>
                                    <Text style={{ fontSize: 17, color: 'black', marginTop: 6 }} >Keterangan</Text>
                                    <Text style={{ fontSize: 15, color: 'black', fontWeight: '700', marginTop: 4 }} >{item.keterangan}</Text>
                                    <View style={{ margin: 8 }} >
                                        <Button full style={styles.btnUpload} onPress={() => {
                                            postTambahCheckpoint(item.nama_lokasi, item.lati, item.longi, item.keterangan, item.user_creator, item.id)
                                            // postTambahCheckpoint(item.id)
                                        }} >
                                            <Text style={styles.btnFont} >Upload ke Server</Text>
                                        </Button>
                                    </View>
                                </View>
                            </View>
                        })
                }
            </ScrollView>
            {/* LOADING */}
            <Modal isVisible={loadingUpload} >
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
                    <Button full style={styles.btnClose} onPress={() => {
                        setmessagesuccess('')
                        getLokalCheckpoint()
                    }} >
                        <Text style={styles.btnFont} >Tutup</Text>
                    </Button>
                </View>
            </Modal>
        </View>
    )
}

export default TabCheckpoint

const styles = StyleSheet.create({
    divider: {
        height: 3,
        backgroundColor: '#eeeeee',
        margin: 8
    },
    card: {
        margin: 8,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 6,
        elevation: 6
    },
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
    btnUpload: {
        backgroundColor: '#2196f3',
        borderRadius: 6,
    }
})
