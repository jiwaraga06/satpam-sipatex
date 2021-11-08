import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, AsyncStorage, Image } from 'react-native';
import { Container, Text, Header, Title, Left, Body, Button, Spinner, Tab, Tabs, TabHeading } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import TabCheckpoint from './TabCheckpoint';
import TabTask from './TabTask';
import TabSubTask from './TabSubTask';

const LocalCheckpoint = () => {
    const navigation = useNavigation();
    return (
        <Container>
            <Header androidStatusBarColor='#252A34' style={{ backgroundColor: '#252A34' }} hasTabs={true}>
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
                <Body style={{ flexGrow: 1.9 }} >
                    <Title>Lokal Checkpoint</Title>
                </Body>
            </Header>
            <View style={{ flex: 1 }} >
                <Tabs tabBarBackgroundColor='#252A34' >
                    <Tab heading="Checkpoint"
                        activeTabStyle={{ backgroundColor: '#252A34' }}
                        tabStyle={{ backgroundColor: '#222831' }}
                        textStyle={{ color: 'white' }} >
                        <TabCheckpoint />
                    </Tab>
                    <Tab heading="Task"
                        activeTabStyle={{ backgroundColor: '#252A34' }}
                        tabStyle={{ backgroundColor: '#222831' }}
                        textStyle={{ color: 'white' }} >
                        <TabTask />
                    </Tab>
                    <Tab heading="Sub Task"
                        activeTabStyle={{ backgroundColor: '#252A34' }}
                        tabStyle={{ backgroundColor: '#222831' }}
                        textStyle={{ color: 'white' }} >
                        <TabSubTask />
                    </Tab>
                </Tabs>
            </View>
        </Container>
    )
}

export default LocalCheckpoint

const styles = StyleSheet.create({})
