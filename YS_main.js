const {app, dialog, BrowserWindow} = require('electron')
const { SerialPort } = require('serialport')
const express = require('express')
const app2 = express()

const cors = require("cors")
let force_quit = false;

const _serialPort = new SerialPort({
    path : "/dev/tty.usbserial-2110",
    baudRate: 9600,
    // autoOpen: false,
}, function(err) {
    if(err) {
        console.log('Error: ', err.message );
        return console.log('Error: ', err.message );
    } else {
        console.log('Serial Port Opened');
    }
});

let mainWindow = null;

let openPort = [0xA0, 0x01, 0x01, 0xA2];
let closePort = [0xA0, 0x01, 0x00, 0xA1];

//앞에 동일한 앱을 죽임
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit()
}

if(process.platform === 'darwin') {
    app.dock.hide(); //맥은 여기서 hide
}

app2.expressPort = 3000;
app2.use(cors());

app.whenReady().then(() => {
    force_quit = true;
    app.hide(); //윈도우는 여기서 hide

    app2.get("/", async function (req, res) {

        _serialPort.write(openPort);
        //     , function(err) {
        //     if(err) {
        //         res.json({ result : false });
        //         return console.log('Error on Write : ', err.message)
        //     }
        //     console.log('Open write port')
        // });
        console.log("Port Open......");
        await new Promise(resolve => setTimeout(resolve, 3000)).then(() => {
            _serialPort.write(closePort);
            console.log("Port Close......");
        });
        res.json({ result : true });
    });

    listen(app2.expressPort);
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', function (e) {
    e.preventDefault();
    console.log(force_quit);

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

function listen(port) {
    app2.portNumber = port;
    app2.listen(port, () => {
        console.log("server is running on port :" + app2.portNumber);
    }).on('error', function (err) {
        if(err.errno === 'EADDRINUSE') {
            console.log(`----- Port ${port} is busy, trying with port ${port} -----`);
        } else {
            console.log(err);
        }
    });
}