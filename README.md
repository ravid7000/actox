# <img src='https://raw.githubusercontent.com/ravid7000/actox/master/docs/actox-logo.png' height='60px' />

# Getting Started

Actox is state management library for JavaScript applications. You can use Actox together with React, or with any other view library.

# Installation

Actox is available as a package on NPM for use with a module bundler or in a Node application:

```sh
npm install --save actox
```

# Basic Example

The whole state of your app is stored in an object tree inside a single store. You can update state tree with emit an action and `updateState` api of store.

```js
import { createStore } from 'actox'

/**
 * This is a skeleton of your predicatable state.
 * createStore require shape of the state: object of object
 */

const actoxState = {
    counter: {
        value: 0,
    },
}

// Action Listener as a pure function, that has type and updateState arguments by default and other arguments passed with dispatch API
function actionListener(type, updateState, nextState) {
    if (type === 'UPDATE_COUNTER') {
        // DO Your calculations or fetch data from server and finally call updateState method to mutate state tree
        // updateState method takes first argument as state tree object key name and next argument as state object which you want to mutate
        updateState('counter', nextState)
    }
}

/**
 * Create a store holding the state of your app.
 * It's API is { updateState, getState, subscribe, dispatch }
 */

const store = createStore(actoxState, actionListener)

// You can use subscribe() to update the UI in response to state changes.
store.subscribe(() => console.log(store.getState()))

// You can mutate state by dispatching an action
store.dispatch('TYPE')
// or you can pass extra arguments with the action
store.dispatch('UPDATE_COUNTER', { value: 10 })
```

# Using connect() with React

You don't need to install any extra package for connect. Actox provide it to connect with react.

```js
import { connect } from 'actox'

// class App extends Component {}

function mapStateToProps(state) {
    // Use _getValue to get perticular state or pass default
    // state._getValue('counter.value', 0), second argument is default value
    return {
        counter: state.counter,
    }
}

export default connect(mapStateToProps)(App)
```

### connect() APIs:

```js
updateState() // same as Actox updateState method
```

```js
dispatch() // same as Actox dispatch method
```

That's it!

# Why Actox?

Actox is built to reduce the efforts to manage your data all the time. If you are building any JavaScript app, your major focus is to write the view logic of your application not to manage data.

Thank you for your interest.
