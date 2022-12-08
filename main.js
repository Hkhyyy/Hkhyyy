const { app, BrowserWindow, Tray, Menu, dialog} = require('electron');
const { SerialPort } = require('serialport');
const express = require('express')
const ex = express()
const packeage = require('./package.json')
const cors = require("cors")
let force_quit = false;
const open = [0xA0, 0x01, 0x01, 0xA2]
const close = [0xA0, 0x01, 0x00, 0xA1]
/*
* usb 뺐다 꼈을때, 시리얼포트경로 찾기 자동화
tcp 웹서버 여는 포트 변경되었을때 예외처리 3000포트 안열릴때?
app 업데이트 할때 (배포될때??) gcs 사용
확장가능성 고려해보기 ws agent 랑 결합 가능성?
작업표시줄에 앱 뜨지않기 (앱 숨기기) 트레이
express 말고 가벼운 웹서버도 고려해보기 (lighttpd)
* */
function createWindow () {  // 브라우저 창을 생성
    const win = new BrowserWindow({
        width: 300,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.webContents.openDevTools()
    //브라우저창이 읽어 올 파일 위치
    win.loadURL('http://localhost:3000')
}

// app.on('ready', createWindow);

const serial = new SerialPort({
    path:'/dev/tty.usbserial-1110',
    baudRate: 9600,
})

const serialFc = () => {
    ex.get('/', async (req, res) => {
        serial.write(open)
        const kk = await asyncFc()
        res.send(kk)
        // aasdasd
        serial.write(close)
    });
    ex.listen(3000, () => {
        console.log('1234')
    })
}

const asyncFc = () => {
    return new Promise(resolve => {
        setTimeout(() => resolve('Close'), 3000)
    })
}

// app.on('ready', serialFc)

const doorTest = () =>{
    serial.write(open)
    return new Promise(resolve => {
        setTimeout(() => resolve(serial.write(close)), 3000)
    })
}

const seriralPortlist = () =>{
    SerialPort.list().then(ports => {
        console.log((ports))
    })
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.exit()
    app.quit()
}

if(process.platform === 'darwin') {
    app.dock.hide(); //맥은 여기서 hide
}
ex.use(cors());

let tray = null
const trayFc = () =>{
    tray = new Tray('p_icon.png');
    const myMenu = Menu.buildFromTemplate([
        {label: `ver(${packeage.version})`, enabled:false},
        {label: '테스트', type: 'normal', click: () => {doorTest()}},
        {label: '설정', type: 'normal', submenu:[], click: () =>{seriralPortlist()}},
        {label: '개발자도구', type: 'normal', click: () => {createWindow()}},
        {label: '종료', type: 'normal', click: ()=> {
            app.
            app.quit()
        }}
    ])
    tray.setToolTip('트레이 아이콘!')
    tray.setContextMenu(myMenu)
}

app.on ('ready', trayFc)


// app.on('before-quit', function (e) {
//     e.preventDefault();
//     console.log(force_quit);
//
//     if(force_quit) {
//         dialog.showMessageBox({
//             type: 'info',
//             buttons: ['Ok', 'Exit'],
//             cancelId: 1,
//             defaultId: 0,
//             title: 'Warning',
//             detail: '이 앱을 종료 합니까 ?'
//         }).then(({ response, checkboxChecked }) => {
//             console.log(`response: ${response}`)
//             if (!response) {
//                 force_quit = true;
//                 app.exit();
//             }
//         })
//     } else {
//         app.relaunch(1);
//     }
// });

app.on('window-all-closed', function (){
    if (process.platform !== 'darwin') app.quit()
})