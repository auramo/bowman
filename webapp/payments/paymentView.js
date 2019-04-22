import React from 'react'
import axios from 'axios'
import Header from '../header'
import { navigateTo } from '../router'
import { handleError } from '../errors/error-dispatch'

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

  async componentDidMount() {
    try {
      const response = await axios.get('/api/payments')
      this.setState({ payments: response.data.payments })
    } catch (error) {
      handleError(error)
    }
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
