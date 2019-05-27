import axios from 'axios'
import { format } from 'date-fns'
import * as _ from 'lodash'
import * as R from 'ramda'
import React from 'react'
import { handleError } from '../errors/error-dispatch'
import Header from '../header'
import { navigateTo } from '../router'
import './paymentView.less'

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

const filterPayments = (filterString, payments) => {
  if (!filterString) return payments
  const matchesSubString = fieldValue => {
    if (fieldValue) {
      return fieldValue
        .toString()
        .toLowerCase()
        .includes(filterString.toLowerCase())
    } else {
      return false
    }
  }
  return payments.filter(payment => {
    const fieldValues = R.values(R.pick(['paymentType', 'description', 'amountCents', 'payerName'], payment))
    return fieldValues.some(matchesSubString)
  })
}

class SearchField extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { fieldValue: null }
    this.debouncedFilterValue = _.debounce(this.callFilterValue.bind(this), 500, { trailing: true })
  }

  callFilterValue(value) {
    this.props.filterValue(value)
  }

  render() {
    return (
      <input
        className="form-input b__search-payments"
        type="text"
        placeholder="Hae"
        onChange={evt => {
          this.debouncedFilterValue(evt.target.value)
          this.setState({ fieldValue: evt.target.value })
        }}
      />
    )
  }
}

export default class PaymentView extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { payments: [], filterString: null }
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
              <i className="icon icon-plus" />
            </button>
            <SearchField filterValue={value => this.setState({ filterString: value })} />
          </div>
          <div className="b__payments-content">
            <PaymentsTable payments={filterPayments(this.state.filterString, this.state.payments)} />
          </div>
          <div className="b__payments-footer">{this.state.payments ? this.state.payments.length + ' kpl' : ''}</div>
        </div>
      </div>
    )
  }
}
