import React from 'react'
import Header from '../header'
import { navigateTo } from '../router'

export default params => (
  <div>
    <Header selectedTab="payments" />
    <div className="view-content">
      <h1>Maksut</h1>
      <button className="btn btn-primary" onClick={evt => navigateTo('/newPayment')}>
        Uusi maksu
      </button>
    </div>
  </div>
)
