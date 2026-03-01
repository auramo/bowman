import React from 'react'
import * as R from 'ramda'
import Route from 'route-parser'

const currentLocation = (): string => window.location.pathname + window.location.search

export const navigateTo = (location: string, title?: string): void => {
  history.pushState({}, title || '', location)
  const navigationEvent = document.createEvent('Event') as Event & { location: string }
  navigationEvent.initEvent('routerNavigateTo', false, false)
  navigationEvent.location = location
  window.dispatchEvent(navigationEvent)
}

export const Link = (props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
  <a
    {...props}
    onClick={evt => {
      evt.preventDefault()
      navigateTo(props.href)
    }}
  >
    {props.children}
  </a>
)

export interface RouteMapping {
  route: Route
  component: React.ComponentType<Record<string, string>>
}

interface RouterProps {
  routes: RouteMapping[]
}

interface RouterState {
  location: string
}

export class Router extends React.Component<RouterProps, RouterState> {
  private navigateToListener: ((evt: Event) => void) | null = null

  constructor(props: RouterProps) {
    super(props)
    this.state = { location: currentLocation() }
  }

  componentDidMount() {
    window.onpopstate = () => {
      this.setState({ location: currentLocation() })
    }
    this.navigateToListener = (evt: Event) => {
      this.setState({ location: (evt as Event & { location: string }).location })
    }
    window.addEventListener('routerNavigateTo', this.navigateToListener)
  }

  componentWillUnmount() {
    if (this.navigateToListener) {
      window.removeEventListener('routerNavigateTo', this.navigateToListener)
    }
  }

  render() {
    const route = R.find((r: RouteMapping) => !!r.route.match(this.state.location))(this.props.routes)
    if (route) {
      const params = route.route.match(this.state.location)
      return React.createElement(route.component, params || {})
    }
    return <div>Client route not found</div>
  }
}
