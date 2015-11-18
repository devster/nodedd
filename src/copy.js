"use strict";

var spawn = require('child_process').spawn,
    exec = require('child_process').exec

class ImageCopy {
    static exec(from, to, callback) {
        return new Promise((resolve, reject) => {
            var opts = ['bs=4M', `if=${from}`, `of=${to}`]

            var p = spawn('dcfldd', opts)

            p.stdout.on('data', (data) => {
                if (callback) {
                    callback(null, data.toString())
                }
            })

            p.stderr.on('data', (data) => {
                if (callback) {
                    callback(true, data.toString())
                }
            })

            p.on('close', (code) => {
                if (code > 0) {
                    reject(code)
                } else {
                    exec('sync', (err, stdout, stderr) => {
                        if (err) {
                            throw err
                        }

                        resolve()
                    })
                }
            })
        })
    }
}

module.exports = ImageCopy
