export function _isObject(value) {
    const type = typeof value
    return value !== null && type === 'object'
}

export function _isFunction(value) {
    const toString = Object.prototype.toString
    if (!value) {
        return false
    }
    const tag = toString.call(value)
    return (
        tag === '[object Function]' ||
        tag === '[object AsyncFunction]' ||
        tag === '[object GeneratorFunction]' ||
        tag === '[object Proxy]'
    )
}

export function _errorLogger(err) {
    console.error('[ACTOX Store]', err)
}

export function _isValidState(state) {
    try {
        if (!state || !_isObject(state)) {
            throw new Error('Invalid state object. State should be an object of objects.')
        }
        return true
    } catch (e) {
        _errorLogger(e)
        return false
    }
}

export function _isValidActionListener(actionListener) {
    if (_isFunction(actionListener) || _isObject(actionListener)) {
        return true
    }
    return false
}

function strToPath(string) {
    const charCodeOfDot = '.'.charCodeAt(0)
    const reEscapeChar = /\\(\\)?/g
    const rePropName = RegExp(
        // Match anything that isn't a dot or bracket.
        '[^.[\\]]+' +
            '|' +
            // Or match property names within brackets.
            '\\[(?:' +
            // Match a non-string expression.
            '([^"\'].*)' +
            '|' +
            // Or match strings (supports escaping characters).
            '(["\'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2' +
            ')\\]' +
            '|' +
            // Or match "" as the space between consecutive dots or empty brackets.
            '(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))',
        'g'
    )

    const result = []
    if (string.charCodeAt(0) === charCodeOfDot) {
        result.push('')
    }
    string.replace(rePropName, (match, expression, quote, subString) => {
        let key = match
        if (quote) {
            key = subString.replace(reEscapeChar, '$1')
        } else if (expression) {
            key = expression.trim()
        }
        result.push(key)
    })
    return result
}

export function _accessModify(state) {
    if (!state) return state
    state._getValue = function(str, def) {
        if (!str) return undefined
        let index = 0
        const path = strToPath(str)
        const length = path.length
        while (state !== null && index < length) {
            state = state[path[index++]]
        }
        const obj = index && index === length ? state : undefined
        return obj ? obj : def
    }
    return state
}
