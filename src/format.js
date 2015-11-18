"use strict";

var execSync = require('child_process').execSync,
    exec = require('child_process').exec,
    df = require('./df')

class Format {
    exec(device, partsNumber) {
        this.unmountAllPartitions(device)

        var deletePart = "d\n\n".repeat(partsNumber).trim()

        var cmd = `
echo "${deletePart}
n
p
1


t
c
w
"|fdisk ${device}`

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                exec(cmd, (error, stdout, stderr) => {
                    if (error) {
                        console.error(stderr, stdout)
                        throw error
                    }

                    resolve()
                })
            }, 1000)
        })
    }

    unmountAllPartitions(device) {
        var result = df.exec()

        for (var i = 0; i < result.length; i++) {
            var d = result[i]

            if (d.device == device) {
                console.log(`umount ${d.source}`)
                execSync(`umount ${d.source}`)
            }
        }
    }
}

module.exports = new Format
