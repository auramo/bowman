import Route from 'route-parser'

import PaymentView from './payments/paymentView'
import NewPayment from './payments/newPayment'
import ShoppingList from './shoppingList/shoppingList'
import { RouteMapping } from './router'

const routeMappings: Record<string, React.ComponentType<Record<string, string>>> = {
  '/': () => {
    document.location = '/payments'
    return null
  },
  '/payments': PaymentView,
  '/newPayment': NewPayment,
  '/shoppingList': ShoppingList
}

const routes: RouteMapping[] = Object.keys(routeMappings).map(k => ({
  route: new Route(k),
  component: routeMappings[k]
}))

export default routes
