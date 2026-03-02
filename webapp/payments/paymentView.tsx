import axios from 'axios'
import { format } from 'date-fns'
import * as _ from 'lodash'
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
  offset: number
  hasMore: boolean
  onPreviousPage: () => void
  onNextPage: () => void
  listRef: React.RefObject<HTMLDivElement | null>
}

class PaymentsTable extends React.PureComponent<PaymentsTableProps> {
  render() {
    const { payments, offset, hasMore, onPreviousPage, onNextPage, listRef } = this.props
    return (
      <React.Fragment>
        <div className="b__payment-list" ref={listRef}>
          {offset > 0 && (
            <div className="b__paging-buttons">
              <button className="btn" onClick={onPreviousPage}>Edelliset 200</button>
            </div>
          )}
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
          {hasMore && (
            <div className="b__paging-buttons">
              <button className="btn" onClick={onNextPage}>Seuraavat 200</button>
            </div>
          )}
        </div>
      </React.Fragment>
    )
  }
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
  searching: boolean
  savedIndicatorClass: string
  editing: boolean
  paymentId: string | null
  summary: SummaryRow[]
  paymentCount: number | null
  offset: number
  hasMore: boolean
  currentSearch: string | undefined
}

export default class PaymentView extends React.PureComponent<Record<string, string>, PaymentViewState> {
  private paymentListRef = React.createRef<HTMLDivElement>()

  constructor(props: Record<string, string>) {
    super(props)
    this.state = {
      payments: null,
      searching: false,
      savedIndicatorClass: 'b__saved-indicator--hidden',
      editing: false,
      paymentId: null,
      summary: [],
      paymentCount: null,
      offset: 0,
      hasMore: false,
      currentSearch: undefined
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
      this.fetchSummary()
      setTimeout(() => this.setState({ savedIndicatorClass: 'animate__backOutDown' }), 4000)
    }
  }

  async fetchPayments(search?: string, offset: number = 0) {
    this.setState({ searching: true })
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (offset > 0) params.set('offset', String(offset))
      const qs = params.toString()
      const response = await axios.get(`/api/payments${qs ? `?${qs}` : ''}`)
      this.setState({
        payments: response.data.payments,
        hasMore: response.data.hasMore,
        offset,
        currentSearch: search,
        searching: false
      })
    } catch (error) {
      this.setState({ searching: false })
      handleError(error)
    }
  }

  async loadNextPage() {
    await this.fetchPayments(this.state.currentSearch, this.state.offset + 200)
    this.paymentListRef.current?.scrollTo(0, 0)
  }

  async loadPreviousPage() {
    await this.fetchPayments(this.state.currentSearch, Math.max(0, this.state.offset - 200))
    this.paymentListRef.current?.scrollTo(0, this.paymentListRef.current.scrollHeight)
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
            <SearchField filterValue={(value: string) => {
              if (value.length >= 2) {
                this.fetchPayments(value, 0)
              } else if (value.length === 0) {
                this.fetchPayments(undefined, 0)
              }
            }} />
            <div className="b__grow_filler" />
            <div
              className={`b__saved-indicator label label-success animate__animated ${this.state.savedIndicatorClass}`}
            >
              Tallennettu
            </div>
          </div>
          <div className="divider" />
          <div className="b__payments-content">
            {this.state.searching ? (
              <div className="loading loading-lg" />
            ) : this.state.payments ? (
              <PaymentsTable
                payments={this.state.payments}
                startEditing={(paymentId: string) => this.startEditing(paymentId)}
                offset={this.state.offset}
                hasMore={this.state.hasMore}
                onPreviousPage={() => this.loadPreviousPage()}
                onNextPage={() => this.loadNextPage()}
                listRef={this.paymentListRef}
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
