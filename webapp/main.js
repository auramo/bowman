import './app-styles/style.less'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { store } from './store'
import routes from './routes'
import { Router } from './router'

function renderApp() {
  ReactDOM.render(
    <Provider store={store}>
      <Router routes={routes} />
    </Provider>,
    document.getElementById('main')
  )
}

renderApp()
