import React from "react"
import Header from "./header"
import Atom from "kefir.atom"
import { StateContext } from "./state"

const Foo = () => (
  <StateContext.Consumer>
    {state => {
      const xView = state.view("x")
      return xView.get()
    }}
  </StateContext.Consumer>
)

export default params => (
  <div>
    <Header selectedTab="tab1" />
    <div className="view-content">
      <div>View 1 contents</div>
      {params.p1 ? <div>Param value: {params.p1}</div> : null}
      <Foo />
    </div>
  </div>
)
