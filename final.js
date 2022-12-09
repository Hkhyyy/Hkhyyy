const { app, dialog } = require('electron');
const express = require('express')
const exp = express()
const cors = require("cors")
const modules =  require('./agentFunc')
const connserial =  require('./ConnSerial')
let force_quit = false;
let expressPortNum = 3000;
const http = require('http');
const { Socket } = require('socket.io');
const server = http.Server(exp);
const io = require('socket.io')(server);
let open = [0xA0, 0x01, 0x01, 0xA2];
let close = [0xA0, 0x01, 0x00, 0xA1];
exp.use(cors());
let serial = connserial.connSerial.getInstance();

function listen(port) {
    exp.portNumber = port;
    exp.listen(port, () => {
        console.log("server is running on port :" + port);
    }).on('error', function (err) {
        if(err.errno === 'EADDRINUSE') {
            console.log(`----- Port ${port} is busy, trying with port ${port} -----`);
        } else {
            console.log(err);
        }
    });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.exit()
    app.quit()
}

if(process.platform === 'darwin') {
    app.dock.hide(); //맥은 여기서 hide
}

app.on('window-all-closed', function (){
    if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', function (e) {
    e.preventDefault();
    console.log('force_quit:', force_quit);
    if(force_quit) {
        dialog.showMessageBox({
            type: 'info',
            buttons: ['Ok', 'Exit'],
            cancelId: 1,
            defaultId: 0,
            title: 'Warning',
            detail: '이 앱을 종료 합니까 ?'
        }).then(({ response, checkboxChecked }) => {
            console.log(`response: ${response}`)
            if (!response) {
                force_quit = true;
                app.exit();
            }
        })
    } else {
        app.relaunch(1);
    }
});

app.whenReady().then(() => {
    force_quit = true;

    exp.get("/", async function (req, res) {
        serial.write(open);
        console.log("Port Open......");
        await new Promise(resolve => setTimeout(resolve, 3000)).then(() => {
            serial.write(close);
            console.log("Port Close......");
        });
        res.json({ result : true });
    });
    // modules.WebServerListen(expressPortNum)
    modules.trayFc()
    listen(expressPortNum);
})
