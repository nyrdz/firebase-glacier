var database_rules_processor = require('./src/database.rules.processor')
var middleware_decorators = require('./src/middleware.decorators')

var serve = () => {

}

var build = (database_middleware = [], storage_middleware = []) => {
    database_rules_processor(database_middleware)
}

module.exports = {
    serve,
    build,
    processors: {
        database: database_rules_processor
    },
    middleware: {
        decorators: middleware_decorators
    }
}