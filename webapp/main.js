import './app-styles/style.less'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import { store } from './store'
import routes from './routes'
import { Router } from './router'

function renderApp() {
  createRoot(document.getElementById('main')).render(
    <Provider store={store}>
      <Router routes={routes} />
    </Provider>
  )
}

renderApp()
