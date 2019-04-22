import React from 'react'
import { connect } from 'react-redux'
import * as R from 'ramda'
import axios from 'axios'
import { Link } from './router'
import { handleError } from './errors/error-dispatch'

const tabs = {
  payments: { label: 'Maksut', location: '/payments' },
  shoppingList: { label: 'Kauppalista', location: '/shoppingList' }
}

class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount() {
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
            ([tab, { label, location }]) => (
              <Link key={tab} className="btn btn-link" href={location}>
                {tab === this.props.selectedTab ? <strong>{label}</strong> : label}
              </Link>
            ),
            R.toPairs(tabs)
          )}
        </section>
        <section className="navbar-section">
          {this.props.error ? <span className="label label-error">{this.props.error.toString()}</span> : null}
          <span className="text-gray mr-2">{R.path(['user', 'name'], this.state)}</span>
          <a className="btn btn-sm mr-2" href="/logout">
            Log out
          </a>
        </section>
      </header>
    )
  }
}

const mapStateToProps = state => ({
  error: state.errorState.error
})

export default connect(mapStateToProps)(Header)
