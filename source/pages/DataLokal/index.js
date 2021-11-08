import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, ScrollView, AsyncStorage } from 'react-native';
import { Container, Text, Header, Title, Left, Body, Button, Spinner } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { apiToken, apiTransaksiAbsen } from '../../API';

const Datalokal = () => {
    const navigation = useNavigation();

    const [isLoading, setisLoading] = useState(false);
    const [list, setlist] = useState([]);
    const [message, setmessage] = useState('');
    const [messageSuccess, setmessageSuccess] = useState('');

    var parse;
    const getDataLocal = async () => {
        const datalocal = await AsyncStorage.getItem('datalocal');
        parse = JSON.parse(datalocal);
        var parser = parse;
        console.log(parse);
        // AsyncStorage.removeItem('datalocal');
        if (datalocal == null) {
            // console.log(parser);
        } else {
            // console.log(parser);
            setlist(parser)
        }
    }

    const uploadServer = async () => {
        const datalocal = await AsyncStorage.getItem('datalocal');
        parse = JSON.parse(datalocal);
        const data = {
            'data' :parse
        }
        setisLoading(true)
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
                getDataLocal()
                setmessageSuccess(json.message);
                setisLoading(false)

            }
        } catch (error) {
            console.log('Failed upload : ', error);
        }
    }

    useEffect(() => {
        getDataLocal()
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
                <Body style={{ flexGrow: 1.5 }} >
                    <Title>Data Lokal</Title>
                </Body>
            </Header>
            <View style={{ flex: 1 }} >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}>
                    {
                        // list.length == 0 ?
                        //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                        //         <Text style={{ color: '#bdbdbd', fontSize: 17 }} >Data Lokal Kosong</Text>
                        //     </View>
                            // : 
                            list.map((item, index) => {
                                return <View key={index} >
                                    <View style={styles.card} >
                                        <View style={{ margin: 8 }} >
                                            <Text style={{ fontSize: 17, fontWeight: '700' }} >Barcode</Text>
                                            <Text style={{ fontSize: 16 }} >{item.barcode}</Text>
                                        </View>
                                        <View style={{ margin: 8 }} >
                                            <Button style={{ height: 35, borderRadius: 6, elevation: 8 }}
                                                onPress={() => {
                                                    navigation.navigate('DatalokalTask', {
                                                        task: item.tasks
                                                    })
                                                }}>
                                                <Text>Lihat Task</Text>
                                            </Button>
                                        </View>
                                    </View>
                                </View>
                            })
                    }
                </ScrollView>
                <View style={{ margin: 8 }} >
                    <Button full style={{ backgroundColor: '#2e7d32', borderRadius: 6, elevation: 6 }} 
                    onPress={uploadServer}>
                        <Text style={{ fontSize: 16, fontWeight: '700' }} >Upload Data ke Server</Text>
                    </Button>
                </View>
            </View>
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

export default Datalokal

const styles = StyleSheet.create({
    card: {
        margin: 8,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 6,
        elevation: 6,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    btnClose: {
        backgroundColor: '#252A34',
        borderRadius: 6,
        elevation: 6,
        margin: 8
    },
})
