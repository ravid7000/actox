import { PureComponent, createElement } from 'react'
import { updateState, dispatch, getState, subscribe } from './actox'
import { _isFunction, _errorLogger, _accessModify } from './utils'

export default function connectAdvance(selectorState) {
    return function wrapComponent(WrappedComponent) {
        try {
            return class extends PureComponent {
                constructor(props) {
                    super(props)
                    this._isMounted = false
                    this.selector = null
                    this.initSelector()
                    let derivedProps = null
                    if (selectorState && _isFunction(selectorState)) {
                        derivedProps = selectorState(_accessModify(getState()))
                    }
                    this.state = {
                        storeState: derivedProps,
                    }
                }

                initSelector() {
                    this.selector = WrappedComponent
                }

                componentDidMount() {
                    this._isMounted = true
                    this._subscribe()
                }

                componentWillUnmount() {
                    this._isMounted = false
                }

                _subscribe() {
                    subscribe(() => {
                        if (!this._isMounted) {
                            return
                        }
                        let derivedProps = null
                        if (selectorState && _isFunction(selectorState)) {
                            derivedProps = selectorState(_accessModify(getState()))
                        }
                        this.setState({
                            storeState: derivedProps,
                        })
                    })
                    if (selectorState && _isFunction(selectorState)) {
                        const postMountStoreState = selectorState(_accessModify(getState()))
                        if (postMountStoreState !== this.state.storeState) {
                            this.setState({
                                storeState: postMountStoreState,
                            })
                        }
                    }
                }

                render() {
                    const props = {
                        ...this.props,
                        ...this.state.storeState,
                        updateState,
                        dispatch,
                    }
                    return createElement(this.selector, props)
                }
            }
        } catch (e) {
            _errorLogger(e)
        }
    }
}
