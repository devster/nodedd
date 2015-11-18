"use strict";

var execSync = require('child_process').execSync

class DF {
    exec() {
        var stdout = execSync('df -h --output="source,fstype,size,used,avail,pcent,target"')

        var rows = stdout.toString().split('\n').splice(1);
        rows = rows.splice(0, rows.length-1);

        return rows.reduce((array, row) => {
            row = row.split(/\s{1,}/)

            var device = this.extractDevice(row[0])

            array.push({
                device: device,
                isPart: device == row[0],
                source: row[0],
                fstype: row[1],
                size: row[2],
                used: row[3],
                avail: row[4],
                pcent: row[5],
                target: row[6],
            })

            return array
        }, [])
    }

    extractDevice(deviceName) {
        var reg = new RegExp('^(.+)p\\d{1,}$', 'g');

        var match = reg.exec(deviceName)

        if (match) {
            return match[1]
        }

        return deviceName
    }
}

module.exports = new DF
