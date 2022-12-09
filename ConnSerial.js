const {SerialPort} = require('serialport');

module.exports = {
    connSerial: (function () {
        let instance;

        function conns() {
            return new SerialPort({
                path: "/dev/tty.usbserial-110",
                baudRate: 9600,
            },function (err) {
                if (err) {
                    console.log('Error: ', err.message);
                    return console.log('Error: ', err.message);
                } else {
                    console.log('Serial Port Opened');
                }
            });
            // function (err) {
            //     console.log("-------serial port conn ----------");
            //     console.log(err);
            //     if (err == null) {
            //         deviceStatus = true;
            //     } else if (err) {
            //         dialog.showErrorBox('Error', '출입통제 장치가 연결되지 않았거나 장치를 찾을 수 없습니다.');
            //         console.log('Error: ', err.message);
            //         app.exit();
            //     } else {
            //         deviceStatus = true;
            //         console.log('Serial Port Opened');
            //     }
            // })
        }

        return {
            getInstance: function () {
                if (!instance) {
                    instance = conns();
                }
                return instance;
            }
        }
    })()
}