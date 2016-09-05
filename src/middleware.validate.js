module.exports = (glacier) => {
    // Get database object
    var database = glacier.database

    // Proccess $validate fields
    const generateValidate = (data) => {
        let objWithValidate = {}
        if (Object.prototype.toString.call(data) === '[object Array]') {
            objWithValidate = []
        }
        let validate = ""
        for(let key in data) {
            if(data.hasOwnProperty(key)) {
                if(key === ".validate" || key.startsWith("$validate")) {
                    validate += data[key] + " || "
                } else {
                    if(Object.prototype.toString.call(data[key]) === '[object Object]' || Object.prototype.toString.call(data[key]) === '[object Array]') {
                        objWithValidate[key] = generateValidate(data[key])
                    } else if(typeof(data[key]) === 'string' || typeof(data[key]) === 'number' || typeof(data[key]) === 'boolean') {
                        objWithValidate[key] = data[key]
                    }
                }
            }
        }
        if(validate !== "") {
            validate = validate.slice(0, validate.length - 4) // Remove the trailing ' || '
            objWithValidate[".validate"] = validate
        }

        return objWithValidate
    }
    database = generateValidate(database)

    return database
}