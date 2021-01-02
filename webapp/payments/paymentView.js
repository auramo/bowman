import axios from 'axios'
import { format } from 'date-fns'
import * as _ from 'lodash'
import * as R from 'ramda'
import React from 'react'
import { handleError } from '../errors/error-dispatch'
import Header from '../header'
import { navigateTo } from '../router'
import PaymentDetailView from './paymentDetailView'
import {centsToString} from './payment'
import './paymentView.less'

class PaymentsTable extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { editing: false, paymentId: null }
  }
  closeEditing() {
    this.setState({ editing: false, paymentId: null })
  }
  render() {
    const { payments } = this.props
    return (
      <React.Fragment>
        {this.state.editing 
          ? <PaymentDetailView 
              paymentId={this.state.paymentId} 
              closeDetailView={this.closeEditing.bind(this)}
              onSave={this.props.onSave} /> 
          : null
         }
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
                <tr
                  style={{ cursor: 'pointer' }}
                  onClick={() => this.setState({ editing: true, paymentId: payment.id })}
                  key={index}
                >
                  <td>
                    <span className={payment.description ? 'popover popover-right' : ''}>
                      {payment.paymentType}
                      {payment.description ? (
                        <React.Fragment>
                          {'  '}
                          <img className="b__info-icon" src="img/Information_icon.svg" width="20" height="20" />
                          <div className="popover-container">
                            <div className="card">
                              <div className="card-body">{payment.description}</div>
                            </div>
                          </div>
                        </React.Fragment>
                      ) : null}
                    </span>
                  </td>
                  <td>{format(payment.paymentDate, 'DD.MM.YYYY')}</td>
                  <td>
                    {centsToString(payment.amountCents)}
                  </td>
                  <td>{payment.payerName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </React.Fragment>
    )
  }
}

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
    this.state = { 
      payments: null, 
      filterString: null,
      savedIndicatorClass: "b__saved-indicator--hidden"
    }
  }

  notifySaved() {
    this.setState({savedIndicatorClass: 'animate__backInDown'})
    setTimeout(() => this.setState({savedIndicatorClass: 'animate__backOutDown'}) ,4000)
  }

  async componentDidMount() {
    try {
      const response = await axios.get('/api/payments')
      this.setState({ 
        payments: response.data.payments
       })
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
            <div className="b__grow_filler"/>
            <div className={`b__saved-indicator label label-success animate__animated ${this.state.savedIndicatorClass}`}>
              Tallennettu
            </div>
          </div>
          <div className="divider" />
          <div className="b__payments-content">
            {this.state.payments ? (
              <PaymentsTable 
                payments={filterPayments(this.state.filterString, this.state.payments)}
                onSave={this.notifySaved.bind(this)} />
            ) : (
              <div className="loading loading-lg" />
            )}
          </div>
          <div className="b__payments-footer">{this.state.payments ? this.state.payments.length + ' kpl' : ''}</div>
        </div>
      </div>
    )
  }
}
