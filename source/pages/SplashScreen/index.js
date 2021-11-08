import React, { useEffect } from 'react'
import { StyleSheet, Text, View, AsyncStorage } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Container, Spinner } from 'native-base';
import { createTableCheckpoint, createTableHistorySecurity, createTableSubTask, createTableTask, deleteValueTableHistorySecurity } from '../../SQLITE';
import { useNavigation } from '@react-navigation/native';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'SatpamDatabase.db' });

const SplashScreen = () => {
    const navigation = useNavigation();

    const getInfo = async () => {
        const barcode = await AsyncStorage.getItem('barcode');
        // console.log('Barcode : ',barcode);
        if (barcode) {
            setTimeout(() => {
                navigation.replace('Home')
            }, 2000);
        } else {
            setTimeout(() => {
                navigation.replace('TabView')
            }, 2000);
        }
    }

    useEffect(() => {
        getInfo()
        createTableHistorySecurity()
        createTableCheckpoint()
        createTableTask()
        createTableSubTask()
        // setTimeout(() => {
        // createTableHistorySecurity()
        //     createTableCheckpoint()
        //     createTableTask()
        //     createTableSubTask()
        // }, 1500);
        // db.transaction(function (txn) {
        //     txn.executeSql(
        //       "SELECT name FROM sqlite_master WHERE type='table' AND name='table_checkpoint'",
        //       [],
        //       function (tx, res) {
        //         console.log('item:', res.rows.length);
        //         txn.executeSql('DROP TABLE IF EXISTS table_checkpoint', []);
        //       }
        //     );
        //   });
        // db.transaction(function (txn) {
        //     txn.executeSql(
        //       "SELECT name FROM sqlite_master WHERE type='table' AND name='table_task'",
        //       [],
        //       function (tx, res) {
        //         console.log('item:', res.rows.length);
        //         txn.executeSql('DROP TABLE IF EXISTS table_task', []);
        //       }
        //     );
        //   });
        // db.transaction(function (txn) {
        //     txn.executeSql(
        //       "SELECT name FROM sqlite_master WHERE type='table' AND name='table_sub_task'",
        //       [],
        //       function (tx, res) {
        //         console.log('item:', res.rows.length);
        //         txn.executeSql('DROP TABLE IF EXISTS table_sub_task', []);
        //       }
        //     );
        //   });

    }, []);
    return (
        <View style={{ flex: 1, backgroundColor: '#252A34', justifyContent: 'center', alignItems: 'center' }} >
            <MaterialCommunityIcons
                name='security'
                size={60}
                color='white' />
            <Spinner color='white' />
        </View>
    )
}

export default SplashScreen

const styles = StyleSheet.create({})
