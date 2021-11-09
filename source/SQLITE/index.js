import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'SatpamDatabase.db' });
import React from 'react';
import { Alert } from 'react-native';

const createTableHistorySecurity = () => {
    db.transaction(function (txn) {
        txn.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='table_history'",
            [],
            function (tx, res) {
                console.log('item:', res.rows.length);
                txn.executeSql(
                    'CREATE TABLE IF NOT EXISTS table_history(id INTEGER PRIMARY KEY AUTOINCREMENT,barcode VARCHAR(255), nama VARCHAR(255), lat VARCHAR(255), lng VARCHAR(255), warna VARCHAR(255), gender VARCHAR(10), waktu VARCHAR(255) )',
                    []
                );
                if (res.rows.length > 0) {
                    console.log('Success Buat Table History Security');
                } else {
                    console.log('Failed Buat Table History Security');

                }
            }
        );
    });
}

const insertValueTableHistorySecurity = (barcode, nama, lat, lng, warna, gender, waktu) => {
    db.transaction(function (tx) {
        tx.executeSql(
            'INSERT INTO table_history (barcode, nama, lat, lng, warna, gender, waktu) VALUES (?,?,?,?,?,?,?)',
            [barcode, nama, lat, lng, warna, gender, waktu],
            (tx, results) => {
                if (results.rowsAffected > 0) {
                    // console.log('Success upload history security');
                } else {
                    console.log('Failed upload history security');
                }
            }
        );
    });
}

const deleteValueTableHistorySecurity = () => {
    db.transaction((tx) => {
        tx.executeSql(
            'DELETE FROM table_history',
            [],
            (tx, results) => {
                // console.log('Results', results.rowsAffected);
                if (results.rowsAffected > 0) {
                    console.log('Success Delete Value Table History Security');
                } else {
                    console.log('Failed Delete Value');
                }
            }
        );
    });
}

const createTableCheckpoint = () => {
    db.transaction(function (txn) {
        txn.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='table_checkpoint'",
            [],
            function (tx, res) {
                console.log('item:', res.rows.length);
                txn.executeSql(
                    'CREATE TABLE IF NOT EXISTS table_checkpoint(id INTEGER PRIMARY KEY AUTOINCREMENT,id_checkpoint INTEGER(255), nama_lokasi VARCHAR(255), lati INTEGER(255), longi INTEGER(255), keterangan VARCHAR(255), created_at VARCHAR(255), updated_at VARCHAR(255), user_creator VARCHAR(255), isOffline INTEGER(10) )',
                    []
                );
                if (res.rows.length > 0) {
                    console.log('Success Buat Table Checkpoint Security');
                } else {
                    console.log('Failed Buat Table Checkpoint Security');

                }
            }
        );
    });
}

const insertValueTableCheckpoint = (id_checkpoint, nama_lokasi, lati, longi, keterangan, created_at, updated_at, user_creator) => {
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM table_checkpoint WHERE id_checkpoint= ? AND nama_lokasi= ? AND lati= ? AND longi= ? AND keterangan= ? AND created_at= ? AND updated_at= ? AND user_creator= ?',
            [id_checkpoint, nama_lokasi, lati, longi, keterangan, created_at, updated_at, user_creator],
            (tx, result) => {
                if (result.rows.length > 0) {
                    console.log('Data Sudah ada checkpoint');
                    console.log(result.rows.length);
                } else {
                    console.log(result.rows.length);
                    console.log('Data Belum ada checkpoint');
                    tx.executeSql(
                        'INSERT INTO table_checkpoint (id_checkpoint, nama_lokasi, lati, longi, keterangan, created_at, updated_at, user_creator,isOffline ) VALUES (?,?,?,?,?,?,?,?,?)',
                        [id_checkpoint, nama_lokasi, lati, longi, keterangan, created_at, updated_at, user_creator, 0],
                        (tx, results) => {
                            // console.log('Result checkpoint local : ', results);
                            if (results.rowsAffected > 0) {
                                console.log('Success insert value checkpoint security');
                            } else {
                                console.log('Failed insert value checkpoint security');
                            }
                        }
                    );
                }
            }
        )
    });
}
const insertValueTableCheckpointForm = (id_checkpoint, nama_lokasi, lati, longi, keterangan, created_at, updated_at, user_creator) => {
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM table_checkpoint WHERE nama_lokasi= ? AND lati= ? AND longi= ? AND keterangan= ? AND created_at= ? AND updated_at= ? AND user_creator= ?',
            [nama_lokasi, lati, longi, keterangan, created_at, updated_at, user_creator],
            (tx, result) => {
                if (result.rows.length > 0) {
                    console.log('Data Sudah ada');
                    Alert.alert('Information', 'Data Sudah Ada')
                    console.log(result.rows.length);
                } else {
                    console.log(result.rows.length);
                    console.log('Data Belum ada');
                    tx.executeSql(
                        'INSERT INTO table_checkpoint (id_checkpoint, nama_lokasi, lati, longi, keterangan, created_at, updated_at, user_creator, isOffline) VALUES (?,?,?,?,?,?,?,?,?)',
                        [id_checkpoint + 1, nama_lokasi, lati, longi, keterangan, created_at, updated_at, user_creator, 1],
                        (tx, results) => {
                            console.log('Result checkpoint local : ', results);
                            if (results.rowsAffected > 0) {
                                Alert.alert('Information', 'Data Berhasil di Simpan di Local')
                                console.log('Success insert value checkpoint security');
                            } else {
                                Alert.alert('Information', 'Data Gagal di Simpan di Local')
                                console.log('Failed insert value checkpoint security');
                            }
                        }
                    );
                }
            }
        )

    });
}

const updateValueTableCheckpoint = (nama_lokasi, lati, longi, keterangan, updated_at, user_creator, id) => {
    db.transaction(function (tx) {
        tx.executeSql(
            'UPDATE table_checkpoint set nama_lokasi=?, lati=?, longi=?, keterangan=?, updated_at=?, user_creator=? WHERE id=?',
            [nama_lokasi, lati, longi, keterangan, updated_at, user_creator, id],
            (tx, results) => {
                console.log('Result checkpoint local : ', results);
                if (results.rowsAffected > 0) {
                    Alert.alert('Information', 'Data Berhasil di Update di Local')
                    console.log('Success update value checkpoint security');
                } else {
                    Alert.alert('Information', 'Data Gagal di Update di Local')
                    console.log('Failed update value checkpoint security');
                }
            }
        );
    });
}
const deleteValueTableCheckpoint = (id) => {
    db.transaction((tx) => {
        tx.executeSql(
            'DELETE FROM table_checkpoint WHERE id=?',
            [id],
            (tx, results) => {
                // console.log('Results', results.rowsAffected);
                if (results.rowsAffected > 0) {
                    console.log('Success Delete Value Table History Checkpoint');
                } else {
                    console.log('Failed Delete Value History Checkpoint');
                }
            }
        );
    });
}

const createTableTask = () => {
    db.transaction(function (txn) {
        txn.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='table_task'",
            [],
            function (tx, res) {
                console.log('item:', res.rows.length);
                txn.executeSql(
                    'CREATE TABLE IF NOT EXISTS table_task(id INTEGER PRIMARY KEY AUTOINCREMENT,id_task INTEGER(255), id_lokasi INTEGER(255), task VARCHAR(255), user_creator VARCHAR(255), created_at VARCHAR(255), updated_at VARCHAR(255),isOffline INTEGER(10) )',
                    []
                );
                if (res.rows.length > 0) {
                    console.log('Success Buat Table Task Security');
                } else {
                    console.log('Failed Buat Table Task Security');

                }
            }
        );
    });
}

const insertValueTableTask = (id_task, id_lokasi, task, user_creator, created_at, updated_at) => {
    db.transaction(function (tx) {
        tx.executeSql(
            'SELECT * FROM table_task WHERE id_task=?',
            [id_task],
            (tx, result) => {
                if (result.rows.length > 0) {
                    console.log('Data Sudah ada Task');
                    // tx.executeSql(
                    //     'SELECT * FROM table_task WHERE task=?',
                    //     [task],
                    //     (tx, results) => {
                    //         var temp = [];
                    //         console.log('row: ', results.rows.length);
                    //         for (let i = 0; i < results.rows.length; ++i)
                    //             temp.push(results.rows.item(i));
                    //         console.log('Dari Lokal', temp);
                    //         if (results.rows.length == 0) {
                    //             console.log('task beda');
                    //             console.log('   ');
                    db.transaction(function (tx) {
                        tx.executeSql(
                            'UPDATE table_task set task=?, user_creator=?, updated_at=? WHERE id_task=?',
                            [task, user_creator, updated_at, id_task],
                            (tx, results) => {
                                // console.log("result: ",results);
                                if (results.rowsAffected > 0) {
                                    // Alert.alert('Information', 'Data Berhasil di update di Local')
                                    console.log('Success update value task security');
                                } else {
                                    // console.log('Failed: ',results.rowsAffected);
                                    // Alert.alert('Information', 'Data Gagal di Update di Local')
                                    console.log('Failed update value task security');
                                }
                            }
                        );
                    });
                    //         } else {
                    //             console.log('task sama');
                    //         }
                    //     }
                    // );

                } else {
                    console.log('Data Belum ada Task');
                    tx.executeSql(
                        'INSERT INTO table_task (id_task, id_lokasi, task, user_creator, created_at, updated_at, isOffline) VALUES (?,?,?,?,?,?,?)',
                        [id_task, id_lokasi, task, user_creator, created_at, updated_at, 0],
                        (tx, results) => {
                            if (results.rowsAffected > 0) {
                                console.log('Success insert value task security');
                            } else {
                                console.log('Failed insert value task security');
                            }
                        }
                    );
                }
            }
        )

    });
}
const insertValueTableTaskForm = (id_lokasi, id_task, task, user_creator, created_at, updated_at) => {
    db.transaction(function (tx) {
        tx.executeSql(
            'SELECT * FROM table_task WHERE id_lokasi=?',
            [id_lokasi],
            (tx, result) => {
                if (result.rows.length > 0) {
                    console.log('Data Sudah ada Task');
                    Alert.alert('Information', 'Data Sudah Ada')
                } else {
                    console.log('Data Belum ada Task');
                    tx.executeSql(
                        'INSERT INTO table_task (id_lokasi,id_task, task, user_creator, created_at, updated_at, isOffline) VALUES (?,?,?,?,?,?,?)',
                        [id_lokasi, id_task, task, user_creator, created_at, updated_at, 1],
                        (tx, results) => {
                            if (results.rowsAffected > 0) {
                                Alert.alert('Information', 'Data Berhasil di Simpan di Local')
                                console.log('Success insert value task security');
                            } else {
                                Alert.alert('Information', 'Data Gagal di Simpan di Local')
                                console.log('Failed insert value task security');
                            }
                        }
                    );
                }
            }
        )

    });
}

const updateValueTableTask = (id_lokasi, task, user_creator, updated_at, id) => {
    db.transaction(function (tx) {
        tx.executeSql(
            'UPDATE table_task set id_lokasi=?, task=?, user_creator=?, updated_at=? WHERE id=?',
            [id_lokasi, task, user_creator, updated_at, id],
            (tx, results) => {
                if (results.rowsAffected > 0) {
                    Alert.alert('Information', 'Data Berhasil di update di Local')
                    console.log('Success update value task security');
                } else {
                    Alert.alert('Information', 'Data Gagal di Update di Local')
                    console.log('Failed update value task security');
                }
            }
        );
    });
}

const deleteValueTableTask = (id) => {
    db.transaction((tx) => {
        tx.executeSql(
            'DELETE FROM table_task WHERE id=?',
            [id],
            (tx, results) => {
                // console.log('Results', results.rowsAffected);
                if (results.rowsAffected > 0) {
                    console.log('Success Delete Value Table History Task');
                } else {
                    console.log('Failed Delete Value History Task');
                }
            }
        );
    });
}

const createTableSubTask = () => {
    db.transaction(function (txn) {
        txn.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='table_sub_task'",
            [],
            function (tx, res) {
                console.log('item:', res.rows.length);
                txn.executeSql(
                    'CREATE TABLE IF NOT EXISTS table_sub_task(id INTEGER PRIMARY KEY AUTOINCREMENT,id_sub_task INTEGER(255), id_task INTEGER(255), sub_task VARCHAR(255), keterangan VARCHAR(255), is_aktif INTEGER(10), created_at VARCHAR(255), updated_at VARCHAR(255),isOffline INTEGER(10) )',
                    []
                );
                if (res.rows.length > 0) {
                    console.log('Success Buat Table Sub Task Security');
                } else {
                    console.log('Failed Buat Table Sub Task Security');

                }
            }
        );
    });
}

const insertValueTableSubTask = (id_sub_task, id_task, sub_task, keterangan, is_aktif, created_at, updated_at) => {
    db.transaction(function (tx) {
        tx.executeSql(
            'SELECT * FROM table_sub_task WHERE id_sub_task= ?',
            [id_sub_task],
            (tx, result) => {
                if (result.rows.length > 0) {
                    console.log('Data Sudah ada sub task');
                    db.transaction(function (tx) {
                        tx.executeSql(
                            'UPDATE table_sub_task set sub_task=?, keterangan=?, is_aktif=?, updated_at=? WHERE id_sub_task=?',
                            [sub_task, keterangan, is_aktif, updated_at, id_sub_task],
                            (tx, results) => {
                                if (results.rowsAffected > 0) {
                                    // Alert.alert('Information', 'Data Sub Task Berhasil di Update di Local')
                                    console.log('Success update value sub task security');
                                } else {
                                    // Alert.alert('Information', 'Data Sub Task Gagal di Update di Local')
                                    console.log('Failed update value sub task security');
                                }
                            }
                        );
                    });
                } else {
                    console.log('Data Belum ada sub task');
                    tx.executeSql(
                        'INSERT INTO table_sub_task (id_sub_task, id_task, sub_task, keterangan, is_aktif, created_at, updated_at, isOffline) VALUES (?,?,?,?,?,?,?,?)',
                        [id_sub_task, id_task, sub_task, keterangan, is_aktif, created_at, updated_at, 0],
                        (tx, results) => {
                            if (results.rowsAffected > 0) {
                                console.log('Success insert value sub task security');
                            } else {
                                console.log('Failed insert value sub task security');
                            }
                        }
                    );
                }
            }
        )
    });
}
const insertValueTableSubTaskForm = (id_task, id_sub_task, sub_task, keterangan, created_at, updated_at, is_aktif) => {
    db.transaction(function (tx) {
        tx.executeSql(
            'SELECT * FROM table_sub_task WHERE id_task= ? AND sub_task= ? AND keterangan= ? AND is_aktif= ? AND created_at= ? AND updated_at= ?',
            [id_task, sub_task, keterangan, is_aktif, created_at, updated_at],
            (tx, result) => {
                if (result.rows.length > 0) {
                    console.log('Data Sudah ada sub task');
                    Alert.alert('Information', 'Data Sudah Ada')
                } else {
                    console.log('Data Belum ada sub task');
                    tx.executeSql(
                        'INSERT INTO table_sub_task (id_task,id_sub_task, sub_task, keterangan, is_aktif, created_at, updated_at,isOffline ) VALUES (?,?,?,?,?,?,?,?)',
                        [id_task, id_sub_task, sub_task, keterangan, is_aktif, created_at, updated_at, 1],
                        (tx, results) => {
                            if (results.rowsAffected > 0) {
                                Alert.alert('Information', 'Data Berhasil di Simpan di Local')
                                console.log('Success insert value sub task security');
                            } else {
                                Alert.alert('Information', 'Data Gagal di Simpan di Local')
                                console.log('Failed insert value sub task security');
                            }
                        }
                    );
                }
            }
        )

    });
}
const updateValueTableSubTask = (id_task, sub_task, keterangan, is_aktif, updated_at, id) => {
    db.transaction(function (tx) {
        tx.executeSql(
            'UPDATE table_sub_task set id_task=?, sub_task=?, keterangan=?, is_aktif=?, updated_at=? WHERE id=?',
            [id_task, sub_task, keterangan, is_aktif, updated_at, id],
            (tx, results) => {
                if (results.rowsAffected > 0) {
                    Alert.alert('Information', 'Data Berhasil di Update di Local')
                    console.log('Success insert value sub task security');
                } else {
                    Alert.alert('Information', 'Data Gagal di Update di Local')
                    console.log('Failed insert value sub task security');
                }
            }
        );
    });
}

const deleteValueTableSubTask = (id) => {
    db.transaction((tx) => {
        tx.executeSql(
            'DELETE FROM table_sub_task WHERE id=?',
            [id],
            (tx, results) => {
                // console.log('Results', results.rowsAffected);
                if (results.rowsAffected > 0) {
                    console.log('Success Delete Value Table Sub Task');
                } else {
                    console.log('Failed Delete Value Sub Task');
                }
            }
        );
    });
}

export {
    createTableHistorySecurity,
    insertValueTableHistorySecurity,
    deleteValueTableHistorySecurity,
    deleteValueTableCheckpoint,
    deleteValueTableTask,
    deleteValueTableSubTask,
    createTableCheckpoint,
    insertValueTableCheckpoint,
    insertValueTableCheckpointForm,
    updateValueTableCheckpoint,
    createTableTask,
    insertValueTableTask,
    insertValueTableTaskForm,
    updateValueTableTask,
    createTableSubTask,
    insertValueTableSubTask,
    insertValueTableSubTaskForm,
    updateValueTableSubTask
}