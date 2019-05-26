import './paymentView.less'
import React from 'react'
import axios from 'axios'
import Header from '../header'
import { navigateTo } from '../router'
import { handleError } from '../errors/error-dispatch'
import { format } from 'date-fns'

const PaymentsTable = ({ payments }) => (
  <div className="b__payment-list">
    <table className="table table-striped b__payment-table">
      <thead>
        <tr>
          <th>Tyyppi</th>
          <th>Päivä</th>
          <th>Hinta</th>
          <th>Maksaja</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((payment, index) => (
          <tr key={index} title={payment.description}>
            <td>
              <span className={payment.description ? 'tooltip tooltip-right' : ''} data-tooltip={payment.description}>
                {payment.paymentType}
              </span>
            </td>
            <td>{format(payment.paymentDate, 'DD.MM.YYYY')}</td>
            <td>
              {Math.floor(payment.amountCents / 100)}
              {payment.amountCents % 100 ? `,${payment.amountCents % 100}` : ''}
            </td>
            <td>{payment.payerName}</td>
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
        <div className="b__payments-logo">
          <img src="img/euro-svgrepo-com.svg" />
        </div>
        <div className="b__view-content b__payments-container">
          <div className="b__payments-controls">
            <button className="btn btn-primary b__add-payment-button" onClick={evt => navigateTo('/newPayment')}>
              <i class="icon icon-plus" />
            </button>
            <input class="form-input b__search-payments" type="text" placeholder="Hae" />
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
