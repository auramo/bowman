import React from 'react'
import Header from '../header'

const NewPayment = (_params: Record<string, string>) => (
  <div>
    <Header selectedTab="payments" />
    <div className="view-content">
      <h1>Uusi maksu</h1>
      <input type="text" />
    </div>
  </div>
)

export default NewPayment
