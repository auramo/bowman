import React from 'react'
import Header from '../header'
import { navigateTo } from '../router'
import axios from 'axios'

const PaymentsTable = ({ payments }) => (
  <table className="table table-striped">
    <thead>
      <tr>
        <th>Maksaja</th>
        <th>Tyyppi</th>
        <th>Hinta</th>
      </tr>
    </thead>
    <tbody>
      {payments.map((payment, index) => (
        <tr key={index}>
          <td>{payment.name}</td>
          <td>{payment.description}</td>
          <td>{payment.amountCents}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

export default class PaymentView extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { payments: [] }
  }
  componentDidMount() {
    axios.get('/api/payments').then(response => {
      this.setState({ payments: response.data.payments })
    })
  }
  render() {
    return (
      <div>
        <Header selectedTab="payments" />
        <div className="view-content">
          <h1>Maksut</h1>
          <button className="btn btn-primary" onClick={evt => navigateTo('/newPayment')}>
            Uusi maksu
          </button>
          <PaymentsTable payments={this.state.payments} />
        </div>
      </div>
    )
  }
}
