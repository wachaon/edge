const edge = require('./index')

edge((window, navi, res) => {
    window.rect({x: 1 ,y: 1, width: 1200, height: 500})
    window.navigate('http://www.google.com')
    res.exports = []

    navi.on(/^https:\/\/www\.yahoo\.co\.jp/, (url) => {
        console.log('終了します')
        navi.emit('terminate', res, window)

    })

    navi.on(/./, (url) => {
        console.log('URL: %O', url)
        res.exports.push(url)
    })
})