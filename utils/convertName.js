function convertName(name) {
    if (name === '') return
    const nameArr = name.split('_')
    const convertedName = nameArr.map((item,) => item[0].toUpperCase() + item.slice(1))
    return (convertedName.join(' '))
}

module.exports = convertName