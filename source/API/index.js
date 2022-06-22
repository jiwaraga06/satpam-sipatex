const apiToken = () => {
    const url = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJuYW1hIjoicm9vdCIsImVtYWlsIjoicm9vdEBsb2NhbGhvc3QifSwiaWF0IjoxNTkyMjM1MzE2fQ.KHYQ0M1vcLGSjJZF-zvTM5V44hM0B8TqlTD0Uwdh9rY';
    return url;
}
const apiLogin = () => {
    // const url = 'http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/login';
    const url = 'https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/login';
    return url;
}
const apiLogout = () => {
    // const url = 'http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/logout';
    const url = 'https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/logout';
    return url;
}
const apiChangePassword = () => {
    // const url = 'http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/change_password';
    const url = 'https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/change_password';
    return url;
}
const apiPostHistoryLokasiSecurity = () => {
    // const url = 'http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/history_lokasi_security';
    const url = 'https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/history_lokasi_security';
    return url;
}
const apiDataCheckPoint = (barcode) => {
    // const url = `http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/checkpoint?user_creator=${barcode}`;
    const url = `https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/checkpoint?user_creator=${barcode}`;
    return url;
}
const apiCheckPoint = () => {
    // const url = `http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/checkpoint?user_creator=${barcode}`;
    const url = 'https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/checkpoint';
    return url;
}
const apiSimpanCheckPoint = () => {
    // const url = 'http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/checkpoint/store';
    const url = 'https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/checkpoint/store';
    return url;
}
const apiUpdateCheckPoint = () => {
    // const url = 'http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/checkpoint/update';
    const url = 'https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/checkpoint/update';
    return url;
}
const apiBikinTask = () => {
    // const url = 'http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/task/store';
    const url = 'https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/task/store';
    return url;
}
const apiUpdateTask = () => {
    // const url = 'http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/task/update';
    const url = 'https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/task/update';
    return url;
}
const apiBikinSubTask = () => {
    // const url = 'http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/subtask/store';
    const url = 'https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/subtask/store';
    return url;
}
const apiUpdateSubTask = () => {
    // const url = 'http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/subtask/update';
    const url = 'https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/subtask/update';
    return url;
}
const apiTransaksiAbsen = () => {
    // const url = 'http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/absen/store';
    const url = 'https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/absen/store';
    return url;
}
const apiTaskSubTaskByLokasi = (id_lokasi) => {
    // const url = `http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/checkpoint/task?id_lokasi=${id_lokasi}`;
    const url = `https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/checkpoint/task?id_lokasi=${id_lokasi}`;
    return url;
}
const apiHistoryTransaksiAbsen = (barcode, first_date, last_date) => {
    // const url = `http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/absen?barcode=${barcode}&from=${first_date}&to=${last_date}`;
    const url = `https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/absen?barcode=${barcode}&from=${first_date}&to=${last_date}`;
    return url;
}
const apiRadius = () => {
    // const url = 'http://192.168.50.95/simr/public/api/v1/mobile-app/secsms/radius';
    const url = 'https://satu.sipatex.co.id:2087/api/v1/mobile-app/secsms/radius';
    return url;
}
export {
    apiToken,
    apiLogin,
    apiLogout,
    apiChangePassword,
    apiPostHistoryLokasiSecurity,
    apiDataCheckPoint,
    apiCheckPoint,
    apiSimpanCheckPoint,
    apiUpdateCheckPoint,
    apiBikinTask,
    apiUpdateTask,
    apiBikinSubTask,
    apiUpdateSubTask,
    apiTransaksiAbsen,
    apiTaskSubTaskByLokasi,
    apiHistoryTransaksiAbsen,
    apiRadius,
}
