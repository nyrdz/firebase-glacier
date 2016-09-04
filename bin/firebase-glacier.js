#!/usr/bin/env node

var glacier = require('firebase-glacier')

glacier.build([
    glacier.middleware.decorators
])