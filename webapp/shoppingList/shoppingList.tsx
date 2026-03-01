import React from 'react'
import Header from '../header'

const ShoppingList = (_params: Record<string, string>) => (
  <div>
    <Header selectedTab="shoppingList" />
    <div className="view-content">
      <h1>Kauppalista: tulossa...</h1>
    </div>
  </div>
)

export default ShoppingList
