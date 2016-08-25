var YAML = require('yamljs')
var path = require('path')
var fs = require('fs')

module.exports = (pathToYaml, ouputFilename) => {
    if(!pathToYaml) {
        pathToYaml = './firebase_spec/glacier.yml'
    }

    if(!ouputFilename) {
        ouputFilename = './firebase_spec/database.rules.json'
    }

    fs.readFile(path.resolve(pathToYaml), 'utf8', (err, data) => {
        if(err) {
            return console.log(err)
        }

        // Generate object from yaml data
        var glacier = YAML.parse(data)

        // Get decorators object from glacier
        var decorators = glacier.decorators !== undefined ? glacier.decorators : {}

        // Replace decorators with values
        for(var deco in decorators) {
            if(decorators.hasOwnProperty(deco)) {
                data = data.replace(new RegExp('@' + deco, 'g'), decorators[deco])
            }
        }

        // Generate new glacier without decorators object
        glacier = {}
        var tmp_glacier = YAML.parse(data)
        for(var key in tmp_glacier) {
            if(key !== 'decorators') {
                glacier[key] = tmp_glacier[key]
            }
        }

        // Generate new object without metadata fields (those starting with $)
        var db = glacier.database !== undefined ? glacier.database : {}
        const removeMetadata = (data) => {
            let objWithoutMeta = {}
            if (Object.prototype.toString.call(data) === '[object Array]') {
                objWithoutMeta = []
            }
            for(let key in data) {
                if(data.hasOwnProperty(key)) {
                    if(key[0] !== '$'){
                        if(Object.prototype.toString.call(data[key]) === '[object Object]' || Object.prototype.toString.call(data[key]) === '[object Array]') {
                            objWithoutMeta[key] = removeMetadata(data[key])
                        } else if(typeof(data[key]) === 'string' || typeof(data[key]) === 'number' || typeof(data[key]) === 'boolean') {
                            objWithoutMeta[key] = data[key]
                        }
                    }
                }
            }
            return objWithoutMeta
        }
        db = removeMetadata(db)

        // Generate new object without slashes
        const removeSlashes = (data) => {
            let objWithoutSlashes = {}
            if (Object.prototype.toString.call(data) === '[object Array]') {
                objWithoutSlashes = []
            }
            for(let key in data) {
                if(data.hasOwnProperty(key)) {
                    let _key = key
                    if(key[0] === '/') {
                        _key = key.slice(1)
                    }
                    if(Object.prototype.toString.call(data[key]) === '[object Object]' || Object.prototype.toString.call(data[key]) === '[object Array]') {
                        objWithoutSlashes[_key] = removeSlashes(data[key])
                    } else if(typeof(data[key]) === 'string' || typeof(data[key]) === 'number' || typeof(data[key]) === 'boolean') {
                        objWithoutSlashes[_key] = data[key]
                    }
                }
            }
            return objWithoutSlashes
        }
        db = removeSlashes(db)

        // Write to ouputFilename
        fs.writeFile(path.resolve(ouputFilename), JSON.stringify({ rules: db }, null, 2), 'utf8', (err) => {
            if(err) {
                console.log(err)
            }
        })
    })
}