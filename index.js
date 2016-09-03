var buildDbRules = require('./src/build.db.rules')

var serve = () => {

}

var build = () => {
    buildDbRules()
}

var use = {}
use.database = () => {
    
}

use.storage = () => {

}

use.html = () => {

}

module.exports = {
    serve,
    build,
    buildDbRules,
}