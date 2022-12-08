const { app, ipcMain, BrowserWindow } = require('electron');
const { SerialPort } = require('serialport');
const express = require('express')
const ex = express()
const open = [0xA0, 0x01, 0x01, 0xA2]
const close = [0xA0, 0x01, 0x00, 0xA1]


function createWindow () {  // 브라우저 창을 생성
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    //브라우저창이 읽어 올 파일 위치
    win.loadURL('http://localhost:3000')
}

app.on('ready', createWindow);

const serial = new SerialPort({
    path:'/dev/tty.usbserial-1110',
    baudRate: 9600,
})

const serialFc = () => {
    serial.write(open)
    ex.get('/', async (req, res) => {
        const kk = await asyncFc()
        res.send(kk)
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

app.on('ready', serialFc)

app.on('window-all-closed', function (){
    if (process.platform !== 'darwin') app.quit()
})