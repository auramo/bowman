import React from 'react'
import Header from '../header'
import { navigateTo } from '../router'

export default params => (
  <div>
    <Header selectedTab="payments" />
    <div className="view-content">
      <h1>Uusi maksu</h1>
      <input type="text" />
    </div>
  </div>
)
