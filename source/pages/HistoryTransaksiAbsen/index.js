import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Dimensions, Alert, AsyncStorage, Image } from 'react-native';
import { Container, Header, Text, Right, Left, Body, Title, Button, Spinner } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import NetInfo, { addEventListener } from '@react-native-community/netinfo';
import { Table, Row, Rows } from 'react-native-table-component';
import Modal from 'react-native-modal'
import DatePicker from 'react-native-datepicker';
import { useNavigation } from '@react-navigation/native';
import { apiHistoryTransaksiAbsen, apiToken } from '../../API';


const HistoryTransaksiAbsen = () => {
    const navigation = useNavigation();

    const [netInfo, setnetInfo] = useState(false);
    const [showOption, setshowOption] = useState(true);
    const [isLoading, setisLoading] = useState(false);
    const [List, setList] = useState([]);
    const [task, settask] = useState([]);
    const [number, setnumber] = useState(false);
    const [photo, setphoto] = useState(false);
    const [img, setimg] = useState("");
    const [tglAwal, settglAwal] = useState('');
    const [tglAkhir, settglAkhir] = useState('');

    const getData = async () => {
        setisLoading(true);
        const barcode = await AsyncStorage.getItem('barcode');
        try {
            const response = await fetch(apiHistoryTransaksiAbsen(barcode, tglAwal, tglAkhir), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': apiToken()
                }
            });
            const json = await response.json();
            console.log('Data: ', json);
            if (json.errors) {
                setisLoading(false);
                Alert.alert('Information', 'Tanggal Awal dan Akhir Harus di Isi')
            } else {
                setisLoading(false);
                setList(json)
            }

        } catch (error) {
            setisLoading(false);
            console.log('Error : ', error);
            Alert.alert('Information', error)
        }
    }

    useEffect(() => {
        console.log(tglAwal);
        NetInfo.addEventListener((state) => {
            setnetInfo(state.isConnected)
        })
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
                <Body style={{ flex: 1.4 }} >
                    <Title>History Transaksi</Title>
                </Body>
                <Right style={{ flex: 0.5 }} >
                    <View style={styles.signal(netInfo)} />
                </Right>
            </Header>
            <View style={{ flex: 1 }} >
                {
                    showOption == true ?
                        <View style={{ flexDirection: 'column', backgroundColor: '#252A34' }} >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <View style={{ margin: 8 }} >
                                    <Text style={{ marginBottom: 8, color: 'white' }} >Pilih Tanggal Awal</Text>
                                    <DatePicker
                                        style={{}}
                                        date={tglAwal}
                                        onDateChange={(value) => settglAwal(value)}
                                        mode="date"
                                        placeholder="Pilih Tanggal Awal"
                                        format="YYYY-MM-DD"
                                        minDate="2016-05-01"
                                        maxDate={new Date()}
                                        showIcon={false}
                                        androidMode='calendar'
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            placeholderText: {
                                                color: 'white'
                                            },
                                            dateText: {
                                                color: 'white'
                                            },
                                            dateIcon: {
                                                position: 'absolute',
                                                left: 0,
                                                top: 4,
                                                marginLeft: 0
                                            },
                                            dateInput: {
                                                borderRadius: 6,
                                                borderWidth: 1.5,
                                            }
                                        }}
                                    />
                                </View>
                                <View style={{ margin: 8 }} >
                                    <Text style={{ marginBottom: 8, color: 'white' }} >Pilih Tanggal Akhir</Text>
                                    <DatePicker
                                        style={{}}
                                        date={tglAkhir}
                                        onDateChange={(value) => settglAkhir(value)}
                                        mode="date"
                                        placeholder="Pilih Tanggal Akhir"
                                        format="YYYY-MM-DD"
                                        minDate="2000-01-01"
                                        maxDate={new Date()}
                                        showIcon={false}
                                        androidMode='calendar'
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            placeholderText: {
                                                color: 'white'
                                            },
                                            dateText: {
                                                color: 'white'
                                            },
                                            dateIcon: {
                                                position: 'absolute',
                                                left: 0,
                                                top: 4,
                                                marginLeft: 0
                                            },
                                            dateInput: {
                                                borderRadius: 6,
                                                borderWidth: 1.5,
                                            }
                                        }}
                                    />
                                </View>

                            </View>
                            <View style={{ margin: 8 }} >
                                <Button full style={styles.btnCari} onPress={getData} >
                                    <Text style={styles.btnFont} >Lihat Data</Text>
                                </Button>
                            </View>
                            <TouchableOpacity onPress={() => setshowOption(!showOption)} >
                                <View style={{ margin: 6, alignItems: 'center' }} >
                                    <MaterialCommunityIcons
                                        name='chevron-up'
                                        color='white'
                                        size={40} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        :
                        <TouchableOpacity onPress={() => setshowOption(!showOption)} >
                            <View style={{ alignItems: 'center', backgroundColor: '#252A34' }} >
                                <MaterialCommunityIcons
                                    name='chevron-down'
                                    color='white'
                                    size={40} />
                            </View>
                        </TouchableOpacity>
                }
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}>
                    {
                        isLoading == true ?
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                                <Spinner color='#393E46' />
                            </View>
                            : List.length == 0 ?
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                                    <Text style={{ fontSize: 17, color: 'black' }} >Data Kosong</Text>
                                </View>
                                : List.map((item, index) => {
                                    return <View key={index} style={styles.card} >
                                        <View style={{ flexDirection: 'column' }} >
                                            <View style={{ flexDirection: 'row', marginTop: 4 }} >
                                                <View style={{ flex: 2 }} >
                                                    <Text style={{ fontSize: 17 }} >Barcode</Text>
                                                </View>
                                                <View style={{ flex: 0.2 }} >
                                                    <Text style={{ fontSize: 17 }} >:</Text>
                                                </View>
                                                <View style={{ flex: 3 }} >
                                                    <Text style={{ fontSize: 17 }} >{item.barcode}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 4 }} >
                                                <View style={{ flex: 2 }} >
                                                    <Text style={{ fontSize: 17 }} >Nama</Text>
                                                </View>
                                                <View style={{ flex: 0.2 }} >
                                                    <Text style={{ fontSize: 17 }} >:</Text>
                                                </View>
                                                <View style={{ flex: 3 }} >
                                                    <Text style={{ fontSize: 17 }} >{item.nama}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 4 }} >
                                                <View style={{ flex: 2 }} >
                                                    <Text style={{ fontSize: 17 }} >Lokasi</Text>
                                                </View>
                                                <View style={{ flex: 0.2 }} >
                                                    <Text style={{ fontSize: 17 }} >:</Text>
                                                </View>
                                                <View style={{ flex: 3 }} >
                                                    <Text style={{ fontSize: 17 }} >{item.nama_lokasi}</Text>
                                                </View>
                                            </View>

                                        </View>
                                        <View style={{ margin: 8 }} >
                                            <Button full style={styles.btnLihatTask} onPress={() => {
                                                console.log(item.task);
                                                settask(item.task);
                                                setnumber(true)
                                            }} >
                                                <Text style={styles.btnFont} >Lihat Task</Text>
                                            </Button>
                                        </View>
                                    </View>
                                })
                    }
                </ScrollView>
            </View>
            <Modal isVisible={number} >
                <View style={{ flex: 1, backgroundColor: 'white', borderRadius:12 }} >
                    <ScrollView>
                        {
                            task.map((item, index) => {
                                return <View key={index} style={{ margin: 8 }} >

                                    {/* Tabel Detail */}
                                    <View style={{ flexDirection: 'column' }} >
                                        {/* Task */}
                                        <View style={{ flexDirection: 'row', marginTop: 4 }} >
                                            <View style={{ flex: 2 }} >
                                                <Text style={{ fontSize: 17, fontWeight: 'bold' }} >Task</Text>
                                            </View>
                                            <View style={{ flex: 0.2 }} >
                                                <Text style={{ fontSize: 17 }} >:</Text>
                                            </View>
                                            <View style={{ flex: 3 }} >
                                                <Text style={{ fontSize: 17 }} >{item.nama_task}</Text>
                                            </View>
                                        </View>
                                        {/* Detail Task */}
                                        <View style={{ flexDirection: 'row', marginTop: 4 }} >
                                            <View style={{ flex: 2 }} >
                                                <Text style={{ fontSize: 17, fontWeight: 'bold' }} >Detail Task</Text>
                                            </View>
                                            <View style={{ flex: 0.2 }} >
                                                <Text style={{ fontSize: 17 }} >:</Text>
                                            </View>
                                            <View style={{ flex: 3 }} >
                                                <Text style={{ fontSize: 17 }} >{item.nama_sub_task}</Text>
                                            </View>
                                        </View>
                                        {/* Catatan */}
                                        <View style={{ flexDirection: 'row', marginTop: 4 }} >
                                            <View style={{ flex: 2 }} >
                                                <Text style={{ fontSize: 17, fontWeight: 'bold' }} >Catatan</Text>
                                            </View>
                                            <View style={{ flex: 0.2 }} >
                                                <Text style={{ fontSize: 17 }} >:</Text>
                                            </View>
                                            <View style={{ flex: 3 }} >
                                                <Text style={{ fontSize: 17 }} >{item.note}</Text>
                                            </View>
                                        </View>
                                        {/* Checklist */}
                                        <View style={{ flexDirection: 'row', marginTop: 4 }} >
                                            <View style={{ flex: 2 }} >
                                                <Text style={{ fontSize: 17, fontWeight: 'bold' }} >Checklist</Text>
                                            </View>
                                            <View style={{ flex: 0.2 }} >
                                                <Text style={{ fontSize: 17 }} >:</Text>
                                            </View>
                                            <View style={{ flex: 3 }} >
                                                <View>
                                                    <FontAwesome
                                                        name='check-square-o'
                                                        color='black'
                                                        size={25}
                                                        style={{ marginLeft: 8 }} />
                                                </View>
                                            </View>
                                        </View>
                                        {/* Photo */}
                                        <View style={{ flexDirection: 'row', marginTop: 4 }} >
                                            <View style={{ flex: 2, marginTop: 6 }} >
                                                <Text style={{ fontSize: 17, fontWeight: 'bold' }} >Photo</Text>
                                            </View>
                                            <View style={{ flex: 0.2, marginTop: 6 }} >
                                                <Text style={{ fontSize: 17 }} >:</Text>
                                            </View>
                                            <View style={{ flex: 3, }} >
                                                <TouchableOpacity onPress={() => {
                                                    setimg(item.photo);
                                                    setphoto(true);
                                                }} >
                                                    <View style={{ margin: 8, padding: 8, backgroundColor: '#444F5A', borderRadius: 12 }} >
                                                        <Text style={{ fontSize: 17, color: 'white' }} >Lihat Poto</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.divider} />
                                </View>
                            })
                        }
                    </ScrollView>
                    <View style={{ margin: 8 }} >
                        <Button full style={styles.btnTutup} onPress={() => {
                            setnumber(false)
                            settask([]);
                        }}>
                            <Text style={styles.btnFont} >Tutup</Text>
                        </Button>
                    </View>
                </View>
            </Modal>
            {/* // */}
            <Modal isVisible={photo} >
                <View style={{ flex: 0.5, backgroundColor: 'white', borderRadius: 12 }} >
                    <View style={{ flex: 1, justifyContent: 'center',alignItems: 'center' }} >
                        {
                            img == 'null' ?
                                <View style={styles.imgNull} >
                                    <MaterialIcons
                                        name='image-not-supported'
                                        color='#bdbdbd'
                                        size={120}
                                    />
                                </View>
                                :
                                <Image
                                    source={{ uri: img }}
                                    style={{ width: 300, height: 300, resizeMode: 'stretch', borderRadius: 8, transform: [{ rotate: '90deg' }] }}
                                />
                        }
                    </View>
                    <TouchableOpacity onPress={() => { setphoto(false); setimg("") }}>
                        <View style={{ backgroundColor: "#444F5A", margin: 8, padding: 8, borderRadius: 10, alignItems: "center", height: 45 }} >
                            <Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }} >Tutup</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Modal>
        </Container>
    )
}

export default HistoryTransaksiAbsen

const styles = StyleSheet.create({
    divider: {
        height: 3,
        backgroundColor: '#bdbdbd',
        margin: 8
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 6,
        elevation: 6,
        margin: 8,
        padding: 8
    },
    imgNull: {
        marginTop: 20,
        height: 250,
        width: 300,
        borderRadius: 4,
        borderColor: '#bdbdbd',
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    signal: (sinyal) => ({
        backgroundColor: sinyal == true ? '#2e7d32' : '#c62828',
        width: 25,
        elevation: 6,
        height: 25,
        borderRadius: 4,
        marginRight: 20
    }),
    btnLihatTask: {
        backgroundColor: '#393E46',
        borderRadius: 6,
        elevation: 6
    },
    btnTutup: {
        backgroundColor: '#2e7d32',
        borderRadius: 6,
        elevation: 6
    },
    btnCari: {
        backgroundColor: '#1e88e5',
        borderRadius: 6,
        elevation: 6
    },
    btnFont: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white'
    }
})
