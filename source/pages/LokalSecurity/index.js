import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react'
import { StyleSheet, View } from 'react-native';
import { Container, Button, Text } from 'native-base';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'SatpamDatabase.db' });

const LokalSecurity = () => {

    const [list, setlist] = useState([]);

    const getDataLokal = () => {
        var temp = [];
        var array = [];
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM table_history', [], async (tx, results) => {
                for (let i = 0; i < results.rows.length; ++i)
                    temp.push(results.rows.item(i));
                    // console.log(temp);
                setlist(temp)
            });
        });
    }
    useEffect(() => {
        getDataLokal()
    }, [getDataLokal]);
    return (
        <Container>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                <Text style={{ fontSize: 26 }} >{list.length}</Text>
            </View>
        </Container>
    )
}

export default LokalSecurity

const styles = StyleSheet.create({})
