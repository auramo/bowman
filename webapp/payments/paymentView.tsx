import axios from 'axios'
import { format } from 'date-fns'
import * as _ from 'lodash'
import * as R from 'ramda'
import React from 'react'
import { handleError } from '../errors/error-dispatch'
import Header from '../header'
import { navigateTo } from '../router'
import PaymentDetailView from './paymentDetailView'
import { centsToString } from '../../common/money'
import './paymentView.less'
import { PaymentListItem, SummaryRow } from '../../common/types'

interface PaymentsTableProps {
  payments: PaymentListItem[]
  startEditing: (paymentId: string) => void
}

class PaymentsTable extends React.PureComponent<PaymentsTableProps> {
  render() {
    const { payments } = this.props
    return (
      <React.Fragment>
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
                <tr style={{ cursor: 'pointer' }} onClick={() => this.props.startEditing(payment.id)} key={index}>
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
                  <td>{format(payment.paymentDate as Date, 'dd.MM.yyyy')}</td>
                  <td>{centsToString(payment.amountCents as number)}</td>
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

const filterPayments = (filterString: string | null, payments: PaymentListItem[]): PaymentListItem[] => {
  if (!filterString) return payments
  const matchesSubString = (fieldValue: unknown): boolean => {
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

interface SearchFieldProps {
  filterValue: (value: string) => void
}

interface SearchFieldState {
  fieldValue: string | null
}

class SearchField extends React.PureComponent<SearchFieldProps, SearchFieldState> {
  private debouncedFilterValue: (value: string) => void

  constructor(props: SearchFieldProps) {
    super(props)
    this.state = { fieldValue: null }
    this.debouncedFilterValue = _.debounce(this.callFilterValue.bind(this), 500, { trailing: true })
  }

  callFilterValue(value: string) {
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

interface PaymentViewState {
  payments: PaymentListItem[] | null
  filterString: string | null
  savedIndicatorClass: string
  editing: boolean
  paymentId: string | null
  summary: SummaryRow[]
  paymentCount: number | null
}

export default class PaymentView extends React.PureComponent<Record<string, string>, PaymentViewState> {
  constructor(props: Record<string, string>) {
    super(props)
    this.state = {
      payments: null,
      filterString: null,
      savedIndicatorClass: 'b__saved-indicator--hidden',
      editing: false,
      paymentId: null,
      summary: [],
      paymentCount: null
    }
  }

  notifySaved() {
    this.setState({ savedIndicatorClass: 'animate__backInDown' })
    setTimeout(() => this.setState({ savedIndicatorClass: 'animate__backOutDown' }), 4000)
  }

  startEditing(paymentId: string) {
    this.setState({ editing: true, paymentId })
  }

  stopEditing(saved: boolean) {
    this.setState({
      editing: false,
      paymentId: null,
      savedIndicatorClass: saved ? 'animate__backInDown' : 'b__saved-indicator--hidden'
    })
    if (saved) {
      this.fetchPayments()
      setTimeout(() => this.setState({ savedIndicatorClass: 'animate__backOutDown' }), 4000)
    }
  }

  async fetchPayments() {
    try {
      const response = await axios.get('/api/payments')
      this.setState({
        payments: response.data.payments
      })
    } catch (error) {
      handleError(error)
    }
  }

  async fetchSummary() {
    try {
      const response = await axios.get('/api/summary')
      this.setState({
        summary: response.data.summary,
        paymentCount: response.data.paymentCount
      })
    } catch (error) {
      handleError(error)
    }
  }

  async componentDidMount() {
    await this.fetchPayments()
    await this.fetchSummary()
  }

  render() {
    return (
      <div>
        <Header selectedTab="payments" />
        {this.state.editing ? (
          <PaymentDetailView paymentId={this.state.paymentId} stopEditing={(saved: boolean) => this.stopEditing(saved)} />
        ) : null}
        <div className="b__payments-logo">
          <img src="img/euro-svgrepo-com.svg" />
        </div>
        <div className="b__view-content b__payments-container">
          <div className="b__payments-controls">
            <button
              className="btn btn-primary b__add-payment-button"
              onClick={() => {
                this.setState({ editing: true, paymentId: null })
              }}
            >
              <i className="icon icon-plus" />
            </button>
            <SearchField filterValue={(value: string) => this.setState({ filterString: value })} />
            <div className="b__grow_filler" />
            <div
              className={`b__saved-indicator label label-success animate__animated ${this.state.savedIndicatorClass}`}
            >
              Tallennettu
            </div>
          </div>
          <div className="divider" />
          <div className="b__payments-content">
            {this.state.payments ? (
              <PaymentsTable
                payments={filterPayments(this.state.filterString, this.state.payments)}
                startEditing={(paymentId: string) => this.startEditing(paymentId)}
              />
            ) : (
              <div className="loading loading-lg" />
            )}
          </div>
          <div className="b__payments-footer">
            <div>
              {this.state.summary.map((summaryRow, index) => (
                <span style={{ marginRight: '10px' }} key={index}>
                  {summaryRow.payer}:{' '}
                  <span style={{ color: summaryRow.minPayer ? '#e85600' : '#32b643' }}>
                    {centsToString(summaryRow.sum)}
                  </span>
                </span>
              ))}
            </div>
            <div>{this.state.paymentCount !== null ? this.state.paymentCount + ' kpl' : ''}</div>
          </div>
        </div>
      </div>
    )
  }
}
