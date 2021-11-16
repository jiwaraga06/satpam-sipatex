'use strict';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, AsyncStorage, Alert } from 'react-native';
import { Container, Text, Header, Title, Left, Right, Body, Button, Spinner } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import base64 from 'react-native-base64';
import Geolocation from 'react-native-geolocation-service';
import { getPreciseDistance, getDistance } from 'geolib'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import NetInfo from '@react-native-community/netinfo'
import Modal from 'react-native-modal'
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { apiRadius, apiTaskSubTaskByLokasi, apiToken } from '../../API';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'SatpamDatabase.db' });

const ScanQR = () => {
  const navigation = useNavigation();
  // MTstNy4wNDc0OTc7MTA3Ljc0NTkzMw=='
  const [netInfo, setnetInfo] = useState(false);
  const [list, setlist] = useState([]);
  const [listLocal, setlistLocal] = useState([]);
  const [nama, setnama] = useState('');
  const [barcode, setbarcode] = useState('');
  const [message, setmessage] = useState('');
  const [validasiRadius, setvalidasiRadius] = useState(0);
  const [scan, setscan] = useState(false);
  const [submit, setsubmit] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [latitudeQR, setlatitudeQR] = useState(0);
  const [longitudeQR, setlongitudeQR] = useState(0);
  const [latitude, setlatitude] = useState(0);
  const [longitude, setlongitude] = useState(0);
  const [idLokasi, setidLokasi] = useState(0);
  const [date, setdate] = useState('');
  const [data, setdata] = useState(false);

  const getNama = async () => {
    const name = await AsyncStorage.getItem('nama');
    const bar = await AsyncStorage.getItem('barcode');
    const tahun = new Date().getFullYear();
    const bulan = new Date().getMonth();
    const day = new Date().getDate();
    const waktu = new Date().toLocaleTimeString();
    setdate(`${tahun}-${bulan}-${day} ${waktu}`);
    setnama(name);
    setbarcode(bar)
  }


  const onSuccess = (e) => {
    setscan(false)
    console.log('Data : ', e.data);
    var a = base64.decode(e.data);
    console.log(a);
    getNama()
    setidLokasi(a.split(';')[0])
    setlatitudeQR(a.split(';')[1])
    setlongitudeQR(a.split(';')[2])
    // setencodeQR(base64.decode(e.data));
    // console.log(encodeQR);
  };

  const getLokasi = () => {
    Geolocation.getCurrentPosition((position) => {
      // console.log(position);
      setlatitude(position.coords.latitude);
      setlongitude(position.coords.longitude);
    }, error => {
      console.log('Error Get Lokasi: ', error);
    }, {
      accuracy: 1,
      enableHighAccuracy: true,
      distanceFilter: 1,
      maximumAge: 0
    })
  }

  const onSubmit = () => {
    setisLoading(true);
    // var distance = getDistance(
    //   { latitude: latitudeQR, longitude: longitudeQR },
    //   { latitude: latitude, longitude: longitude },
    // );
    // console.log('Jarak : ', distance);
    setsubmit(true);
    getRadius();
    // if (distance <= 2) {
    //   setTimeout(() => {
    //     setsubmit(true);
    //     setisLoading(false);
    //     getData(idLokasi)
    //   }, 1500);
    // } else {
    //   setTimeout(() => {
    //     setdata(true);
    //     setisLoading(false);
    //   }, 1500);
    // }
  }

  const getRadius = async () => {
    const radius = await AsyncStorage.getItem('radius');
    const parRadius = JSON.parse(radius);
    var distance = getDistance(
      { latitude: latitudeQR, longitude: longitudeQR },
      { latitude: latitude, longitude: longitude },
    );
    console.log('Distance: ', distance);
    if (distance <= parRadius) {
      setTimeout(() => {
        setisLoading(false);
        getData(idLokasi);
      }, 1500);
    } else {
      setTimeout(() => {
        setsubmit(false);
        setdata(true);
        setisLoading(false);
      }, 1500);
    }
  }

  const getData = async (id_lokasi) => {
    setisLoading(true);
    // NetInfo.addEventListener(async (state) => {
    if (netInfo == true) {
      try {
        const response = await fetch(apiTaskSubTaskByLokasi(id_lokasi), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': apiToken()
          }
        });
        const json = await response.json();
        console.log(json);
        if (json.errors == null) {
          setlist(json)
          setisLoading(false);
        } else if (json.errors) {
          // setmessage(json.errors.id_lokasi)
          setisLoading(false);
          Alert.alert('Information', `${json.errors.id_lokasi}`)
        }
      } catch (error) {
        console.log('Error : ', error);
      }
    } else {
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
    // })

  }

  useEffect(() => {
    const getDis = async () => {
      const radius = await AsyncStorage.getItem('radius');
      const parRadius = JSON.parse(radius)
      setvalidasiRadius(parRadius);
    }
    getDis()
    getLokasi();
    // getRadius();
    // getData();
    getNama()
    setscan(true);
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
        <Body style={{ flex: 0.9 }} >
          <Title>Scan Qr</Title>
        </Body>
        <Right style={{ flex: 0.5 }} >
          <View style={styles.signal(netInfo)} />
        </Right>
      </Header>
      <View style={{ flex: 1, backgroundColor: '#eeeeee' }} >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}>
          {
            scan == true ?
              <QRCodeScanner
                onRead={onSuccess}
                // flashMode={RNCamera.Constants.FlashMode.torch}
                topContent={
                  <Text style={styles.centerText}>Seret Kamera ke arah QR Code</Text>
                }
              />
              : submit == true ?
                <View />
                : <View style={{ flex: 1, justifyContent: 'center' }} >
                  <View style={{ backgroundColor: 'white' }} >
                    <View style={{ height: 100, justifyContent: 'center', alignItems: 'center' }} >
                      <Text style={{ fontSize: 20, fontWeight: '700', color: 'black' }} >Result</Text>
                      <Text style={{ fontSize: 17, color: 'black' }} >{date}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={{ margin: 8 }} >
                      <Text style={{ fontSize: 17, color: 'black' }} >Nama</Text>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: 'black' }} >{nama}</Text>
                    </View>
                    <View style={{ margin: 8 }} >
                      <Text style={{ fontSize: 17, color: 'black' }} >Barcode</Text>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: 'black' }} >{barcode}</Text>
                    </View>
                    <View style={{ margin: 8 }} >
                      <Text style={{ fontSize: 17, color: 'black' }} >Validasi Radius : {validasiRadius} meter dari Checkpoint</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={{ height: 70, justifyContent: 'center', alignItems: 'center' }} >
                      {
                        data == false ?
                          <View />
                          : <View style={{ margin: 8 }} >
                            <Text style={{ fontSize: 17, color: 'black' }} >Anda Jauh dari Radius</Text>
                          </View>
                      }
                      {
                        data == false ?
                          <Button full style={styles.btnSubmit} onPress={onSubmit} disabled={isLoading ? true : false} >
                            {
                              isLoading == true ?
                                <Spinner color='white' />
                                : <Text style={styles.btnFont} >Submit</Text>
                            }
                          </Button>
                          :
                          <Button full style={styles.btnScanUlang} onPress={() => {
                            setdata(false);
                            setscan(true);
                            getLokasi()
                          }} >
                            <Text style={styles.btnFont} >Scan Ulang</Text>
                          </Button>
                      }
                    </View>
                  </View>
                </View>
          }

          {
            submit == true ?
              isLoading == true ?
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                  <Spinner color='#252A34' />
                </View>
                : netInfo == true ?
                  list.length == 0 ?
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                      <Text style={{ color: '#bdbdbd', fontSize: 17, }} >Task Kosong</Text>
                    </View>
                    : list.map((item, index) => {
                      return <View key={index} style={styles.card} >
                        <Text style={{ fontSize: 17, color: 'black' }} >{item.task}</Text>
                        <View>
                          <Button full style={styles.btnSubTas} onPress={() => navigation.navigate('AbsenSatpam', {
                            sub_task: item.sub_task,
                            id_lokasi: item.id_lokasi
                          })} >
                            <Text style={styles.btnFont} >Lihat Task</Text>
                          </Button>
                        </View>
                      </View>
                    })
                  :
                  listLocal.length == 0 ?
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                      <Text style={{ color: '#bdbdbd', fontSize: 17, }} >Task Kosong</Text>
                    </View>
                    : listLocal.map((item, index) => {
                      return <View key={index} style={styles.card} >
                        <Text style={{ fontSize: 17, color: 'black' }} >{item.task}</Text>
                        <View>
                          <Button full style={styles.btnSubTas} onPress={() => navigation.navigate('AbsenSatpam', {
                            sub_task: [],
                            id_task: item.id_task,
                            id_lokasi: item.id_lokasi
                          })} >
                            <Text style={styles.btnFont} >Lihat Task</Text>
                          </Button>
                        </View>
                      </View>
                    })
              : <View />
          }
        </ScrollView>
      </View>
    </Container>
  )
}

export default ScanQR

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
    backgroundColor: '#bdbdbd',
    height: 3,
    margin: 8
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  },
  card: {
    margin: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'white',
    elevation: 8
  },
  btnScanUlang: {
    backgroundColor: '#c62828',
    borderRadius: 6,
    elevation: 6,
    margin: 8
  },
  btnSubmit: {
    backgroundColor: '#2e7d32',
    borderRadius: 6,
    elevation: 6,
    margin: 8
  },
  btnSubTas: {
    backgroundColor: '#2196f3',
    borderRadius: 6,
    elevation: 6,
    margin: 8
  },
  btnFont: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700'
  }
})
