import React from 'react'
import { connect } from 'react-redux'
import * as R from 'ramda'
import axios from 'axios'
import { Link } from './router'
import { handleError } from './errors/error-dispatch'
import { RootState } from './store'
import { UserAccount } from '../common/types'

const getAvatarIndex = (name: string): number => {
  return (name.charCodeAt(0) + 5) % 5 + 1
}

const tabs: Record<string, { label: string; location: string }> = {
  payments: { label: 'Maksut', location: '/payments' }
}

interface HeaderProps {
  selectedTab: string
  error?: unknown
}

interface HeaderState {
  user?: UserAccount
}

class Header extends React.Component<HeaderProps, HeaderState> {
  constructor(props: HeaderProps) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    axios
      .get('/api/user/')
      .then(resp => this.setState({ user: resp.data.user }))
      .catch(err => handleError(err))
  }

  render() {
    return (
      <header className="navbar">
        <section className="navbar-section">
          {R.map(
            ([tab, { label, location }]: [string, { label: string; location: string }]) => (
              <Link key={tab} className="btn btn-link" href={location}>
                {tab === this.props.selectedTab ? <strong>{label}</strong> : label}
              </Link>
            ),
            R.toPairs(tabs)
          )}
        </section>
        <section className="navbar-section">
          {this.props.error ? (
            <span className="label label-error">{String(this.props.error)}</span>
          ) : null}
          {this.state.user?.name && (
            <figure className="avatar avatar-sm mr-2">
              <img src={`img/avatar-${getAvatarIndex(this.state.user.name)}.png`} />
            </figure>
          )}
          <span className="text-gray mr-2">{this.state.user?.name}</span>
          <a className="btn btn-sm mr-2" href="/logout">
            Kirjaudu ulos
          </a>
        </section>
      </header>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  error: state.errorState.error
})

export default connect(mapStateToProps)(Header)
