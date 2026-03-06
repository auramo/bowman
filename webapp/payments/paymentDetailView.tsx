import React from 'react'
import axios from 'axios'
import './paymentDetailView.less'
import { parseDate } from '../../common/date'
import { format } from 'date-fns'
import { stringToCents } from '../../common/money'
import { PaymentType, Payer, PaymentFormData } from '../../common/types'

const fetchChoiceData = async (): Promise<{ paymentTypes: PaymentType[] }> => {
  const {
    data: { paymentTypes }
  } = await axios.get('/api/paymentTypes')
  return { paymentTypes }
}

const fetchPayers = async (): Promise<{ payers: Payer[] }> => {
  const {
    data: { payers }
  } = await axios.get('/api/payers')
  return { payers }
}

const fetchPayment = async (paymentId: string): Promise<{ payment: PaymentFormData }> => {
  const {
    data: { payment }
  } = await axios.get(`/api/payment?paymentId=${paymentId}`)
  return { payment }
}

const fetchLatestPaymentByType = async (paymentTypeId: number | string): Promise<{ payment: PaymentFormData | null }> => {
  const {
    data: { payment }
  } = await axios.get(`/api/latestPaymentByType?paymentTypeId=${paymentTypeId}`)
  return { payment }
}

const notSelectedListValue = 'not-selected'

const createNewPayment = (): PaymentFormData => ({
  description: '',
  amount: '',
  paymentTypeId: notSelectedListValue,
  payerId: notSelectedListValue,
  paymentDate: format(new Date(), 'dd.MM.yyyy')
})

const savePayment = async (payment: PaymentFormData): Promise<void> => {
  if (payment.id) {
    await axios.put('/api/payment/', payment)
  } else {
    await axios.post('/api/payment/', payment)
  }
}

const deletePayment = async (paymentId: string): Promise<void> => {
  await axios.delete(`/api/payment?paymentId=${paymentId}`)
}

const validPaymentType = (candidate: string | number): boolean => candidate !== notSelectedListValue

const validPayer = (candidate: string | number): boolean => candidate !== notSelectedListValue

const validDate = (candidate: string | number): boolean => !!parseDate(String(candidate))

const validAmount = (candidate: string | number): boolean => !!stringToCents(String(candidate))

const validPayment = (candidate: PaymentFormData): boolean =>
  validPayer(candidate.payerId) &&
  validPaymentType(candidate.paymentTypeId) &&
  validDate(candidate.paymentDate) &&
  validAmount(candidate.amount)

const formGroupClassName = (validator: (v: string | number) => boolean, value: string | number): string =>
  `form-group ${validator(value) ? '' : 'has-error'}`

interface PaymentDetailViewProps {
  paymentId: string | null
  stopEditing: (saved: boolean) => void
}

interface PaymentDetailViewState {
  paymentTypes: PaymentType[] | null
  payers: Payer[] | null
  payment: PaymentFormData
  error: string | null
  saving: boolean
}

export default class PaymentDetailView extends React.PureComponent<PaymentDetailViewProps, PaymentDetailViewState> {
  constructor(props: PaymentDetailViewProps) {
    super(props)
    this.state = {
      paymentTypes: null,
      payers: null,
      payment: createNewPayment(),
      error: null,
      saving: false
    }
  }

  async save() {
    try {
      this.setState({ saving: true })
      await savePayment(this.state.payment)
      this.props.stopEditing(true)
    } catch (e) {
      console.log('Got exception while saving', e)
      this.setState({ error: 'Virhe tallennuksessa' })
    }
  }

  async copyFromPrevious() {
    const { payment } = await fetchLatestPaymentByType(this.state.payment.paymentTypeId)
    if (payment) {
      this.setState({
        payment: {
          ...this.state.payment,
          amount: payment.amount,
          description: payment.description
        }
      })
    }
  }

  async delete() {
    try {
      this.setState({ saving: true })
      await deletePayment(this.state.payment.id!)
      this.props.stopEditing(true)
    } catch (e) {
      console.log('Got exception while deleting', e)
      this.setState({ error: 'Virhe poistossa' })
    }
  }

  renderPaymentTypes() {
    return (
      <select
        className="form-select"
        value={this.state.payment.paymentTypeId}
        onChange={evt => this.setState({ payment: { ...this.state.payment, paymentTypeId: evt.target.value } })}
      >
        <option key={notSelectedListValue} value={notSelectedListValue}>
          Valitse
        </option>
        {this.state.paymentTypes!.map(paymentType => (
          <option key={paymentType.id} value={paymentType.id}>
            {paymentType.description}
          </option>
        ))}
      </select>
    )
  }

  renderPayers() {
    return (
      <select
        className="form-select"
        value={this.state.payment.payerId}
        onChange={evt => this.setState({ payment: { ...this.state.payment, payerId: evt.target.value } })}
      >
        <option key={notSelectedListValue} value={notSelectedListValue}>
          Valitse
        </option>
        {this.state.payers!.map(payer => (
          <option key={payer.id} value={payer.id}>
            {payer.name}
          </option>
        ))}
      </select>
    )
  }

  async componentDidMount() {
    try {
      const [{ paymentTypes }, { payers }, { data: { user } }] = await Promise.all([
        fetchChoiceData(),
        fetchPayers(),
        axios.get('/api/user/')
      ])
      this.setState({ paymentTypes, payers })
      if (this.props.paymentId) {
        const { payment } = await fetchPayment(this.props.paymentId)
        this.setState({ payment })
      } else {
        this.setState({ payment: { ...this.state.payment, payerId: user.id } })
      }
    } catch (e) {
      console.log('Got exception while mounting', e)
      this.setState({ error: 'Virhe tietojen haussa' })
    }
  }

  render() {
    return (
      <div className={'modal active'}>
        <a href="#close" className="modal-overlay" onClick={() => this.props.stopEditing(false)} />
        <div className="modal-container b__payment-detail-container">
          <div className="modal-header">
            <a href="#close" className="btn btn-clear float-right" onClick={() => this.props.stopEditing(false)} />
            <div className="b__payment-detail-header">
              <div className="b__payment-detail-logo">
                <img src="img/big-euro-coin-on-hand-svgrepo-com.svg" />
              </div>
              <div className="modal-title h5 b__payment-detail-heading">Maksun tiedot</div>
            </div>
          </div>

          {this.state.paymentTypes && this.state.payers ? (
            <div className="modal-body b__payment-detail-content">
              <div className="form-group">
                <div className={formGroupClassName(validPaymentType, this.state.payment.paymentTypeId)}>
                  <label className="form-label">Tyyppi</label>
                  {this.renderPaymentTypes()}
                  {!this.props.paymentId && validPaymentType(this.state.payment.paymentTypeId) && (
                    <button className="btn btn-sm b__copy-previous-btn" onClick={() => this.copyFromPrevious()}>
                      Kopioi Hinta ja lisätiedot edellisestä {this.state.paymentTypes!.find(pt => String(pt.id) === String(this.state.payment.paymentTypeId))?.description}-maksusta
                    </button>
                  )}
                </div>
                <div className={formGroupClassName(validPayer, this.state.payment.payerId)}>
                  <label className="form-label">Maksaja</label>
                  {this.renderPayers()}
                </div>
                <div className={formGroupClassName(validAmount, this.state.payment.amount)}>
                  <label className="form-label">Hinta</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Hinta euroina"
                    value={this.state.payment.amount}
                    onChange={newVal =>
                      this.setState({
                        payment: { ...this.state.payment, amount: newVal.target.value }
                      })
                    }
                  />
                </div>
                <div className={formGroupClassName(validDate, this.state.payment.paymentDate)}>
                  <label className="form-label">Päivä</label>
                  <div className="b__date-input-row">
                    <input
                      className="form-input"
                      type="text"
                      placeholder="PP.KK.VVVV"
                      value={this.state.payment.paymentDate}
                      onChange={newVal =>
                        this.setState({
                          payment: { ...this.state.payment, paymentDate: newVal.target.value }
                        })
                      }
                    />
                    <div className="b__date-picker-btn-wrapper">
                      <button
                        type="button"
                        className="btn btn-action b__date-picker-btn"
                        tabIndex={-1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </button>
                      <input
                        type="date"
                        className="b__date-picker-overlay"

                        onChange={evt => {
                          const val = evt.target.value
                          if (val) {
                            const [y, m, d] = val.split('-')
                            this.setState({
                              payment: { ...this.state.payment, paymentDate: `${d}.${m}.${y}` }
                            })
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                <label className="form-label">Lisätiedot</label>
                <textarea
                  className="form-input"
                  placeholder="Kuvaus"
                  rows={3}
                  value={this.state.payment.description}
                  onChange={evt =>
                    this.setState({ payment: { ...this.state.payment, description: evt.target.value } })
                  }
                />
              </div>
            </div>
          ) : (
            <div className="loading loading-lg" />
          )}

          <div className="b__payment-detail-footer modal-footer">
            <span
              className={`label label-error animate__animated ${
                this.state.error ? 'animate__rubberBand' : 'b__detail-error-indicator--hidden'
              }`}
            >
              {this.state.error ? this.state.error.toString() : ''}
            </span>

            <div>
              <button
                className="btn btn-error b__delete-payment"
                disabled={!this.state.payment.id || this.state.saving}
                onClick={async () => {
                  if (confirm('Poistetaanko maksu?')) {
                    this.delete()
                  }
                }}
              >
                Poista
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => this.save()}
                disabled={!validPayment(this.state.payment) || this.state.saving}
              >
                Tallenna
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
