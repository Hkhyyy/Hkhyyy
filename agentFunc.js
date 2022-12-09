const { app, BrowserWindow, Tray, Menu, dialog} = require('electron');
const { SerialPort } = require('serialport');
const express = require('express')
const packeage = require("./package.json");
const connserial = require("./ConnSerial");
const exp = express()

module.exports = {
    alerts: function (code) {
        switch (code) {
            case 1 :
                return 'eeeee'
            default :
                return 'defaults'
        }
    },
    createWindow: function ()
    {  // 브라우저 창을 생성
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
    },
    trayFc : function () {

        let open = [0xA0, 0x01, 0x01, 0xA2];
        let close = [0xA0, 0x01, 0x00, 0xA1];

        const doorTest = () => {
            console.log('----start doortest---')
            let serial = connserial.connSerial.getInstance()
            serial.write(open)
            return new Promise(resolve => {
                setTimeout(() => resolve(serial.write(close)), 3000)
            })
        }

        async function showbox(){
            console.log('---showbox')
            const test = await SerialPort.list().then((ports, err) => {
                if(err) {
                    console.log('error!!!!!!!')
                    return []
                }
                if (ports.length === 0) {
                    console.log('ports is null');
                    return []
                }
                const pathlist = ports.map(item => item.path);
                console.log('@@@' , pathlist)
                return pathlist
            })
            console.log('e333' , test)
            dialog.showMessageBox({
                // option Object
                type: 'none',
                buttons: test,
                defaultId: 0,
                icon: '',
                title: 'This is the Title',
                message: 'This is a Message',
                detail: 'This is extra Information',
                checkboxLabel: 'Checkbox',
                checkboxChecked: false,
                cancelId: 0,
                noLink: false,
                normalizeAccessKeys: false,
            }).then(box => {
                console.log('Button Clicked Index - ', box.response);
                console.log('Checkbox Checked - ', box.checkboxChecked);
            }).catch(err => {
                console.log(err)
            });
        }
        tray = new Tray('p_icon.png');
        const myMenu = Menu.buildFromTemplate([
            {label: `ver(${packeage.version})`, enabled:false},
            {label: '테스트', type: 'normal', click: () => {doorTest()}},
            {label: '설정', type: 'normal', click: async () => {
                    await showbox()
                }},
            {label: '개발자도구', type: 'normal', click: () => {this.createWindow()}},
            {label: '종료', type: 'normal', click: ()=> {
                    app.quit()
                    app.exit()
                }}
        ])
        tray.setToolTip('트레이 아이콘!')
        tray.setContextMenu(myMenu)
    },
    WebServerListen : function (port) {
        exp.portNumber = port;
        exp.listen(port, () => {
            console.log("webserver is running on port :" + exp.portNumber);
        }).on('error', function (err) {
            if(err.errno === 'EADDRINUSE') {
                dialog.showErrorBox('Error', `Port ${port} is busy, trying with port ${port}`);
                console.log(`----- Port ${port} is busy, trying with port ${port} -----`);
            } else {
                console.log(err);
            }
        });
    }
}