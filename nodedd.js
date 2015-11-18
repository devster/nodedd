#!/usr/bin/env node

var pkg = require('./package.json'),
    program = require('commander'),
    fs = require('fs'),
    path = require('path')

program
    .version(pkg.version)
    .description(pkg.description)

function checkRootPermission() {
    if (process.geteuid() > 0) {
        console.error('You must be root')
        process.exit(1)
    }
}

program
    .command('list')
    .description('List available devices')
    .action(function () {
        checkRootPermission()
        var parted = require('./src/parted')

        parted.list().map((d) => {
            console.log(d)
        })
    })

program
    .command('copy <img> [device]')
    .description('Copy an image on a device')
    .option("-l, --loop", "Loop the copying, only if the device is not given")
    .action(function (img, deviceName) {
        checkRootPermission()
        var parted = require('./src/parted'),
            format = require('./src/format'),
            imgcopy = require('./src/copy')

        // verify image file
        try {
            fs.statSync(img)
            img = path.resolve(img)
        } catch (e) {
            console.error(`Image ${img} not found`)
            process.exit(1)
        }

        function run(device) {
            console.log(`Found: ${device.name} ${device.size} ${device.device}`)
            setTimeout(() => {
                format.exec(device.device, device.partsNumber).then(() => {
                    console.log(`Format ${device.device}`)
                    console.log(`Copying ${img} to ${device.device}`)
                    return imgcopy.exec(img, device.device, (err, data) => {
                        if (err) {
                            console.error(data)
                        } else {
                            console.log(data)
                        }
                    })
                })
                .then(() => {
                    console.log('Copy done!')
                })
            }, 1000)
        }

        // verify the device
        if (deviceName) {
            var device;
            if (device = parted.get(deviceName)) {
                run(device)
            } else {
                console.error(`Device ${deviceName} not found`)
                process.exit(1)
            }
        } else {
            console.log('Waiting device...')
            parted.detect().then((device) => {
                run(device)
            })
        }
    })

program
    .command('create <device> <img>')
    .description('Create an image from a device')
    .action(function (img) {
        console.log('bouya')
    })

program
    .command('format <device>')
    .description('Format a device')
    .action(function (deviceName) {
        checkRootPermission()
        var parted = require('./src/parted'),
            format = require('./src/format')

        var device;

        if (device = parted.get(deviceName)) {
            format.exec(device.device, device.partsNumber).then(() => {
                console.log(`${device.device} formatted!`)
            })
        } else {
            console.error(`Device ${deviceName} not found`)
            process.exit(1)
        }
    })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
    program.help()
}
