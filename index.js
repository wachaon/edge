const IServerXMLHTTPRequest2 = require('MSXML2.ServerXMLHTTP')
const genGUID = require('genGUID')
const { writeFileSync, existsdirSync } = require('filesystem')
const { resolve, WorkingDirectory } = require('pathname')
const Event = require('event')
const { isRegExp } = require('typecheck')
const { eraseInLine, cursorHrAbs, color } = require('ansi')
const { has } = require('argv')
const { Window, request, getEdgeWebDriver } = require('webdriver')
const TERMINATE = 'terminate'
const BOL = cursorHrAbs(1) // beginning of line
const EIL = eraseInLine(0) // erase in line

function edge(callback, terminate) {
    let close = false
    class Navigation extends Event {
        emit(url, ...args) {
            console.print(`${BOL}${EIL}`)
            if (url === TERMINATE) {
                close = true
                this.get(TERMINATE).forEach((callback) => {
                    callback(url, ...args)
                })
            } else {
                this.forEach((callback, listener) => {
                    if (
                        (isRegExp(listener) && listener.test(url)) ||
                        listener === url
                    ) {
                        callback.forEach((cb) => cb(url, ...args))
                    }
                })
            }
        }
    }
    const navigation = new Navigation()

    const window = new Window()
    const result = {
        exports: {}
    }
    const errmsg = genGUID()

    if (typeof terminate == 'function') navigation.on(TERMINATE, terminate)
    else {
        navigation.on(TERMINATE, (message, res) => {
            const file = res.spec != null ? res.spec : genGUID() + '.json'
            const log = resolve(WorkingDirectory, 'log')
            const spec = existsdirSync(log)
                ? resolve(log, file)
                : resolve(WorkingDirectory, file)
            const source = JSON.stringify(res, null, 2)
            console.print('%S%S ', color(255, 165, 0), message || 'terminate')
            console.log(writeFileSync(spec, source, 'UTF-8'))
        })
    }

    try {
        callback(window, navigation, result)

        let url = 'about:blank'

        while (!close) {
            const _url = nomarize(url)
            let res = request(
                IServerXMLHTTPRequest2,
                'GET',
                `http://localhost:${window.port}/session/${window.sessionId}/url`,
                null,
                _url
            )
            if (close || IServerXMLHTTPRequest2.status != 200) break
            let curr = res ? res.value : null
            if (curr && curr !== url) {
                url = curr
                navigation.emit(url, result)
            }
        }
        throw new Error(errmsg)
    } catch (error) {
        if (error.message !== errmsg) throw error
        if (!close) navigation.emit(TERMINATE, result, window)
    } finally {
        window.quit()
        console.log('') // Line feed
        return result
    }
}

module.exports = edge

// util
function nomarize(url, size = 60) {
    if (url.length < size) return url
    const exp = /(^https?:\/\/[^\/]+\/)/
    const prefix = exp.test(url) ? url.match(/(^https?:\/\/[^\/]+\/)/)[1] : url.slice(0, 20)
    const suffix = url.slice((size - 4 - prefix.length) * -1)
    return `${prefix} ...${suffix}`
}

// command line
if (wes.Modules[wes.main].path === __filename) {
    if (has('d') || has('download')) getEdgeWebDriver()
}
