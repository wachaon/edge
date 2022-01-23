const IServerXMLHTTPRequest2 = require('MSXML2.ServerXMLHTTP')
const genGUID = require('genGUID')
const { writeTextFileSync, existsdirSync } = require('filesystem')
const { resolve, WorkingDirectory } = require('pathname')
const Event = require('event')
const { isRegExp } = require('typecheck')
const { color } = require('ansi')
const { Window, request } = require('webdriver')
const TERMINATE = 'terminate'

function edge(callback, terminate) {
    let close = false
    class Navigation extends Event {
        emit(url, ...args) {
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
        navigation.on(TERMINATE, (message, res, win) => {
            const log = resolve(WorkingDirectory, 'log')
            const spec = existsdirSync(log)
                ? resolve(log, genGUID() + '.json')
                : resolve(WorkingDirectory, genGUID() + '.json')
            const source = JSON.stringify(res, null, 2)
            console.print('%S%S ', color(255, 165, 0), message)
            console.log(writeTextFileSync(spec, source))
        })
    }

    try {
        callback(window, navigation, result)

        let url = window.getURL()

        while (!close) {
            const res = request(
                IServerXMLHTTPRequest2,
                'GET',
                `http://localhost:${window.port}/session/${window.sessionId}/url`,
                null,
                'Poling'
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
        window.close()
    }
}

module.exports = edge
