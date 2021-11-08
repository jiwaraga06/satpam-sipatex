import React, { useState, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { Container, Item, Input, Text, Button } from 'native-base'
// import * as dataLocal from '../../JSON/local.json';
import axios from 'axios';

const TestLocal = () => {
    const [nama, setnama] = useState('');
    const [barcode, setbarcode] = useState('');

    const post = async () => {
        
        // const name = dataLocal.user;
        // name.push({ 'nama': nama })
        // console.log(name);
        axios.get("../../JSON/local.json")
            .then((json) => {
                console.log(json)
            })
            .catch((error) => {
                console.log(error);
            })
    }

    return (
        <Container>
            <View style={{ flex: 1 }} >
                <View style={{ margin: 8 }} >
                    <Item regular >
                        <Input
                            onChangeText={(value) => setnama(value)}
                            placeholder='Nama'
                        />
                    </Item>
                </View>
                <View style={{ margin: 8 }} >
                    <Item regular >
                        <Input
                            onChangeText={(value) => setbarcode(value)}
                            placeholder='Barcode'
                        />
                    </Item>
                </View>
                <View style={{ margin: 8 }} >
                    <Button full onPress={post} >
                        <Text>Submit</Text>
                    </Button>
                </View>
            </View>
        </Container>
    )
}

export default TestLocal

const styles = StyleSheet.create({})
