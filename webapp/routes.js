import * as R from 'ramda'
import React from 'react'
import Route from 'route-parser'

import paymentView from './payments/paymentView'
import newPayment from './payments/newPayment'
import shoppingList from './shoppingList/shoppingList'

const routeMappings = {
  '/': () => (document.location = '/payments'), //Go to the default view
  '/payments': paymentView,
  '/newPayment': newPayment,
  '/shoppingList': shoppingList
}

const routes = R.pipe(
  R.keys,
  R.map(k => ({ route: new Route(k), component: routeMappings[k] }))
)(routeMappings)

export default routes
