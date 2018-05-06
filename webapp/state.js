import React from "react"
import Atom from "kefir.atom"

const StateContext = React.createContext("state")
const initialState = Atom({ x: 167 })

export { StateContext, initialState }
