import React from 'react'
import axios from 'axios'
import './paymentDetailView.less'
import { parseDate } from '../../common/date'
const { format } = require('date-fns')
import { stringToCents } from '../../common/money'

const fetchChoiceData = async () => {
  const {
    data: { paymentTypes }
  } = await axios.get('/api/paymentTypes')
  return { paymentTypes }
}

const fetchPayers = async () => {
  const {
    data: { payers }
  } = await axios.get('/api/payers')
  return { payers }
}

const fetchPayment = async paymentId => {
  const {
    data: { payment }
  } = await axios.get(`/api/payment?paymentId=${paymentId}`)
  return { payment }
}

const notSelectedListValue = 'not-selected'

const createNewPayment = () => ({
  description: '',
  amount: '',
  paymentTypeId: notSelectedListValue,
  payerId: notSelectedListValue,
  paymentDate: format(new Date(), 'DD.MM.YYYY')
})

const savePayment = async payment => {
  if (payment.id) {
    await axios.put('/api/payment/', payment)
  } else {
    await axios.post('/api/payment/', payment)
  }
}

const deletePayment = async paymentId => await axios.delete(`/api/payment?paymentId=${paymentId}`)

const validPaymentType = candidate => candidate !== notSelectedListValue

const validPayer = candidate => candidate !== notSelectedListValue

const validDate = candidate => !!parseDate(candidate)

const validAmount = candidate => !!stringToCents(candidate)

const validPayment = candidate =>
  validPayer(candidate.payerId) &&
  validPaymentType(candidate.paymentTypeId) &&
  validDate(candidate.paymentDate) &&
  validAmount(candidate.amount)

const formGroupClassName = (validator, value) => `form-group ${validator(value) ? '' : 'has-error'}`

export default class PaymentDetailView extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      paymentTypes: null,
      selectedPaymentType: null,
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

  async delete() {
    try {
      this.setState({ saving: true })
      await deletePayment(this.state.payment.id)
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
        {this.state.paymentTypes.map(paymentType => (
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
        {this.state.payers.map(payer => (
          <option key={payer.id} value={payer.id}>
            {payer.name}
          </option>
        ))}
      </select>
    )
  }

  async componentDidMount() {
    try {
      const { paymentTypes } = await fetchChoiceData()
      const { payers } = await fetchPayers()
      this.setState({ paymentTypes, payers })
      if (this.props.paymentId) {
        const { payment } = await fetchPayment(this.props.paymentId)
        this.setState({ payment })
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
                </div>
                <label className="form-label">Lisätiedot</label>
                <textarea
                  className="form-input"
                  placeholder="Kuvaus"
                  rows="3"
                  value={this.state.payment.description}
                  onChange={evt => this.setState({ payment: { ...this.state.payment, description: evt.target.value } })}
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
