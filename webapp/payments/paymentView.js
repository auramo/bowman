import './paymentView.less'
import React from 'react'
import axios from 'axios'
import Header from '../header'
import { navigateTo } from '../router'
import { handleError } from '../errors/error-dispatch'

const PaymentsTable = ({ payments }) => (
  <div className="b__payment-list">
    <table className="table table-striped b__payment-table">
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
  </div>
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
        <div className="b__view-content b__payments-container">
          <div className="b__payments-controls">
            <button className="btn btn-primary" onClick={evt => navigateTo('/newPayment')}>
              <i class="icon icon-plus" />
            </button>
          </div>
          <div className="b__payments-content">
            <PaymentsTable payments={this.state.payments} />
          </div>
          <div className="b__payments-footer">{this.state.payments ? this.state.payments.length + ' kpl' : ''}</div>
        </div>
      </div>
    )
  }
}
