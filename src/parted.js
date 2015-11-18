"use strict";

var execSync = require('child_process').execSync

class Parted {
    static list() {
        var stdout = execSync('parted -l -m')

        var devices = stdout.toString().split(/BYT;/).splice(1);

        return devices.reduce((array, device) => {
            var rows = device.split(";\n").map((line) => { return line.trim() })
            var device = rows.splice(0, 1)[0];
            var parts = []

            if (rows.length > 1) {
                parts = rows.splice(1)
            }

           var row = device.split(':')

            array.push({
                name: row[6],
                device: row[0],
                size: row[1],
                partsNumber: parts.length
            })

            return array
        }, [])
    }

    static get(device) {
        var devices = this.list()

        for (var i = 0; i < devices.length; i++) {
            if (devices[i].device == device) {
                return devices[i];
            }
        }

        return null;
    }

    static detect() {
        return new Promise((resolve, reject) => {
            var data = this.list()

            var interval = setInterval(() => {
                var currentData = this.list()

                if (currentData.length > data.length) {
                    clearInterval(interval)
                    resolve(this.arrayDiff(data, currentData)[0])
                    return
                }

                data = currentData
            }, 200)
        })
    }

    static arrayDiff(array_a, array_b) {
        var diff = []

        for (var i = 0; i < array_b.length; i++) {
            var found = false
            for (var j = 0; j < array_a.length; j++) {
                if (
                    array_a[j].name == array_b[i].name
                    && array_a[j].device == array_b[i].device
                    && array_a[j].size == array_b[i].size
                ) {
                    found = true
                    break
                }
            }

            if (!found) {
                diff.push(array_b[i])
            }
        }

        return diff
    }
}

module.exports = Parted
