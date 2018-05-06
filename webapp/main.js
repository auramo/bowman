import "./app-styles/style.less"
import React from "react"
import ReactDOM from "react-dom"

import routes from "./routes"
import { Router } from "./router"
import { StateContext, initialState } from "./state"

function renderApp() {
  ReactDOM.render(
    <StateContext.Provider value={initialState}>
      <Router routes={routes} />
    </StateContext.Provider>,
    document.getElementById("main")
  )
}

renderApp()
