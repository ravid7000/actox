import {
    _errorLogger,
    _isFunction,
    _isObject,
    _isValidActionListener,
    _isValidState,
} from './utils'

const StateManager = (function() {
    let instance = null
    return {
        get: () => {
            return instance
        },
        set: state => {
            instance = state
        },
    }
})()

function _logger(type, what) {
    const storeObj = StateManager.get()
    if (!storeObj) {
        return false
    }
    if (!storeObj.logger) {
        return false
    }
    if (!storeObj.state) {
        return false
    }
    console.group('[ACTOX Store]')
    console.log(type, what)
    console.log('State', storeObj.state)
    console.groupEnd()
}

function _updateState(type, data) {
    const storeObj = StateManager.get()
    try {
        if (!type) {
            throw new Error('To update a state, type must be provided.')
        }

        if (!storeObj) {
            throw new Error('Initialize store first with createStore()')
        }
        if (!storeObj.state) {
            return
        }
        if (storeObj.isDispatching) {
            throw new Error('You may not call updateState() while executing updateState().')
        }
        storeObj.isDispatching = true
        StateManager.set(storeObj)
        const { state } = storeObj
        if (_isObject(data)) {
            const st = state[type]
            if (st) {
                const newState = Object.assign({}, st, data)
                state[type] = newState
                storeObj.state = state
                StateManager.set(Object.assign({}, storeObj))
                _logger('Update: ' + type, data)
            }
        }
    } catch (e) {
        _errorLogger(e)
    } finally {
        storeObj.isDispatching = false
        StateManager.set(storeObj)
        _updateListeners()
    }
}

function _dispatchAction(type, ...rest) {
    const storeObj = StateManager.get()

    try {
        if (!type) {
            throw new Error('To dispatch an action, type must be provided.')
        }
        if (!storeObj) {
            throw new Error('Initialize store first with createStore()')
        }
        if (storeObj.state) {
            if (!_isValidActionListener(storeObj.actionListener)) {
                throw new Error('Invalid type of action listener is provided')
            }
            _logger('Dispatch:', `"${type}"`)
            if (_isFunction(storeObj.actionListener)) {
                return storeObj.actionListener.apply(undefined, [type, _updateState].concat(rest))
            } else if (_isObject(storeObj.actionListener)) {
                const fn = storeObj.actionListener[type]
                if (_isFunction(fn)) {
                    return fn.apply(undefined, [_updateState].concat(rest))
                }
            }
        }
    } catch (e) {
        _errorLogger(e)
        return null
    }
}

function _getState() {
    try {
        if (!StateManager.get()) {
            return null
        }
        if (StateManager.get().isDispatching) {
            throw new Error('You may not call getState() while executing updateState().')
        }
        return StateManager.get().state
    } catch (e) {
        _errorLogger(e)
    }
}

function _addState(newState) {
    try {
        if (!StateManager.get()) {
            return null
        }
        if (StateManager.get().isDispatching) {
            throw new Error('You may not call addState() while executing updateState().')
        }
        if (_isValidState(newState)) {
            const storeState = Object.assign({}, StateManager.get().state, newState)
            const storeObj = StateManager.get()
            storeObj.state = storeState
            StateManager.set(storeObj)
            _logger('State: new state added', newState)
        }
    } catch (e) {
        _errorLogger(e)
    }
}

function _subscribe(cb) {
    try {
        if (!_isFunction(cb)) {
            throw new Error('Expected the listener to be a function.')
        }
        if (!StateManager.get()) {
            return null
        }

        const stateObj = StateManager.get()
        stateObj.listeners.push(cb)
        StateManager.set(stateObj)
    } catch (e) {
        _errorLogger(e)
    }
}

function _updateListeners() {
    if (!StateManager.get()) {
        return null
    }
    const listeners = StateManager.get().listeners
    for (let i = 0; i < listeners.length; i++) {
        listeners[i]()
    }
}

export default function createStore(state, actionListener, logger) {
    _isValidState(state)
    const storeObj = {
        state,
        logger,
        actionListener,
        isDispatching: false,
        listeners: [],
    }
    StateManager.set(storeObj)
    _logger('Init:', 'store')

    return {
        getState: _getState,
        updateState: _updateState,
        dispatch: _dispatchAction,
        subscribe: _subscribe,
        addState: _addState,
    }
}

export const updateState = _updateState
export const dispatch = _dispatchAction
export const getState = _getState
export const subscribe = _subscribe
export const addState = _addState
