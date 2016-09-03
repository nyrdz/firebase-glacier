module.exports = (glacier) => {
    // Get decorators object from glacier
    var decorators = glacier.decorators !== undefined ? glacier.decorators : {}

    // Serialize glacier object
    var data = JSON.stringify(glacier)

    // Replace decorators with values
    for(var deco in decorators) {
        if(decorators.hasOwnProperty(deco)) {
            data = data.replace(new RegExp('@' + deco, 'g'), decorators[deco])
        }
    }

    // Generate new glacier without decorators object
    var tmp_glacier = JSON.parse(data)
    glacier = {}
    for(var key in tmp_glacier) {
        if(key !== 'decorators') {
            glacier[key] = tmp_glacier[key]
        }
    }

    return glacier
}