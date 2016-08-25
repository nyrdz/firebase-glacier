var buildDbRules = require('./src/build.db.rules')

var serve = () => {

}

var build = (pathToYaml, databaseRulesFilename) => {
    buildDbRules(pathToYaml, databaseRulesFilename)
}

module.exports = {
    serve,
    build,
    buildDbRules,
}