#!/usr/bin/env node

var glacier = require('firebase-glacier')
var path = require('path')
var fs = require('fs')

var BEHAVIOR = 'BUILD'

const run = () => {
    process.argv.forEach((val) => {
        if(val === 'init') {
            BEHAVIOR = 'INIT'
        }
    })

    if(BEHAVIOR === 'BUILD') {
        glacier.build([
            glacier.middleware.decorators,
            glacier.middleware.validate
        ])
    }

    if(BEHAVIOR === 'INIT') {
        if(fs.existsSync(path.resolve('./glacier.yml'))) {
            console.log('FORBIDDEN, glacier.yml already exists')
        } else {
            fs.writeFile(path.resolve('./glacier.yml'), init_template, 'utf8', (err) => {
                if(err) {
                    console.log(err)
                }
            })
        }
    }
}

var init_template =
`glacier: "1.0"
info:
    version: "0.0.0"
    title: none
    description: none
    termsOfService: none
    license: none
    config:
        web:
            apiKey: none
            authDomain: none
            databaseURL: none
            storageBucket: none
    glossary:
auth:
    methods:
        - email
        - google
        - facebook
        - twitter
        - github
        - anonymous
    oauthRedirectDomains:
        - localhost
    allowMultipleAccountsWithSameEmail: false
database:`

run()