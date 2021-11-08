import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Container, Text, Header, Title, Left, Body, Button, Right } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'SatpamDatabase.db' });

const CheckPointTask = ({ route }) => {
    const navigation = useNavigation();
    const { id_lokasi, task } = route.params;

    const [isLoading, setisLoading] = useState(false);
    const [listLocal, setlistLocal] = useState([]);
    const [netInfo, setnetInfo] = useState(false);

    const getDataTaskLokal = () => {
        setisLoading(true)
        db.transaction((tx) => {
            // tx.executeSql('SELECT * FROM table_task', [], (tx, results) => {
            tx.executeSql('SELECT * FROM table_task WHERE id_lokasi=?', [id_lokasi], (tx, results) => {
                var temp = [];
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
        getDataTaskLokal()
        task
    }, [isLoading]);

    useEffect(() => {
        console.log('id lok', id_lokasi);
        console.log('Online', task);
        NetInfo.addEventListener((state) => {
            setnetInfo(state.isConnected)
        })
        getDataTaskLokal()
    }, [NetInfo]);
    return (
        <Container>
            <Header androidStatusBarColor='#252A34' style={{ backgroundColor: '#252A34' }} >
                <Left style={{ Flex: 1 }} >
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
                <Body style={{ flex: 0.7 }} >
                    <Title>Task CheckPoint</Title>
                </Body>
                <Right style={{ flex: 0.1 }} >
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
                            task == null ?
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                                    <Text style={{ color: '#bdbdbd', fontSize: 17 }} >Data Kosong</Text>
                                </View>
                                :
                                task.map((item, index) => {
                                    return <View style={styles.card} key={index} >
                                        <Text style={{ fontSize: 17, fontWeight: '600', color: 'black' }} >User Creator : {item.user_creator}</Text>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: 'black' }} >Task : {item.task}</Text>
                                        <View style={styles.divider} />
                                        <View style={{ margin: 8 }} >
                                            <Button full style={styles.btnUbah} onPress={() => {
                                                navigation.navigate('EditCheckPointTask', {
                                                    id: item.id,
                                                    id_lokasi: id_lokasi,
                                                    valueTask: item.task
                                                })
                                            }} >
                                                <Text style={styles.btnFont} >Ubah Task</Text>
                                            </Button>
                                            <Button full style={styles.btnShowTask} onPress={() => {
                                                navigation.navigate('CheckPointSubTask', {
                                                    sub_task: item.sub_task,
                                                    id_task: item.id
                                                })
                                            }} >
                                                <Text style={styles.btnFont} >Lihat Sub Task</Text>
                                            </Button>
                                        </View>
                                    </View>
                                })
                            : listLocal.length == 0 ?
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                                    <Text style={{ color: '#bdbdbd', fontSize: 17 }} >Data Local Kosong</Text>
                                </View>
                                :
                                listLocal.map((item, index) => {
                                    return <View style={styles.card} key={index} >
                                        <Text style={{ fontSize: 17, fontWeight: '600', color: 'black' }} >User Creator : {item.user_creator}</Text>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: 'black' }} >Task : {item.task}</Text>
                                        <View style={styles.divider} />
                                        {/* <Text>id task {item.id_lokasi}</Text> */}
                                        <View style={{ margin: 8 }} >
                                            <Button full style={styles.btnUbah} onPress={() => {
                                                navigation.navigate('EditCheckPointTask', {
                                                    id: item.id,
                                                    id_lokasi: id_lokasi,
                                                    valueTask: item.task
                                                })
                                            }} >
                                                <Text style={styles.btnFont} >Ubah Task</Text>
                                            </Button>
                                            <Button full style={styles.btnShowTask} onPress={() => {
                                                navigation.navigate('CheckPointSubTask', {
                                                    sub_task: item.sub_task,
                                                    id_task: item.id_task
                                                })
                                            }} >
                                                <Text style={styles.btnFont} >Lihat Sub Task</Text>
                                            </Button>
                                        </View>
                                    </View>
                                })
                    }
                </ScrollView>
                <View style={{ margin: 8 }} >
                    <Button full style={styles.btnTambah} onPress={() => navigation.navigate('AddCheckPointTask', {
                        id_lokasi: id_lokasi
                    })} >
                        <Text style={styles.btnFont} >Tambah Task Checkpoint</Text>
                    </Button>
                </View>
            </View>
        </Container>
    )
}

export default CheckPointTask

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
        backgroundColor: '#3F72AF',
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
