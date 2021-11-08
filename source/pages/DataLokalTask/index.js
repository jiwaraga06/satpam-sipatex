import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, ScrollView, AsyncStorage, Image } from 'react-native';
import { Container, Text, Header, Title, Left, Body, Button, Spinner, Item, Textarea, CheckBox, ListItem } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const DatalokalTask = ({ route }) => {
    const navigation = useNavigation();

    const { task } = route.params;

    useEffect(() => {
        // console.log(task);
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
                <Body style={{ flexGrow: 1.8 }} >
                    <Title>Data Lokal Task</Title>
                </Body>
            </Header>
            <View style={{ flex: 1 }} >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}>
                    {
                        task.length == 0 ?
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                                <Text style={{ color: '#bdbdbd', fontSize: 17 }} >Data Lokal Kosong</Text>
                            </View>
                            : task.map((item, index) => {
                                return <View key={index} >
                                    <View style={styles.card} >
                                        <View style={{ margin: 8, alignItems: 'center' }} >
                                            <Image
                                                source={{ uri: item.photo }}
                                                style={{ width: 200, height: 250, resizeMode: 'stretch', borderRadius: 2, transform: [{ rotate: '90deg' }] }}
                                            />
                                        </View>
                                        <View style={styles.divider} />
                                        <View style={{ margin: 8 }} >
                                            <Item regular>
                                                <Textarea
                                                    value={item.note}
                                                    rowSpan={4}
                                                />
                                            </Item>
                                            <ListItem >
                                                <CheckBox
                                                    checked={item.checklist}
                                                    activeOpacity={20}
                                                    style={{ width: 25, height: 25 }} />
                                                <Body>
                                                    <Text>Check disini</Text>
                                                </Body>
                                            </ListItem>
                                        </View>
                                    </View>
                                </View>
                            })
                    }
                </ScrollView>
            </View>
        </Container>
    )
}

export default DatalokalTask

const styles = StyleSheet.create({
    divider: {
        margin: 8,
        height: 3,
        backgroundColor: '#bdbdbd'
    },
    card: {
        margin: 8,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 6,
        elevation: 6,
    }
})
