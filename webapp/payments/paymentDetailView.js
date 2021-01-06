import React from 'react'
import axios from 'axios'
import './paymentDetailView.less'
import { parse, isValid } from 'date-fns'
import { parseDate } from '../../common/date'

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
  console.log(payment)
  return { payment }
}

const createNewPayment = () => ({
  description: '',
  amount: null,
  paymentTypeId: null,
  payerId: null,
  paymentDate: null
})

const savePayment = async payment => {
  if (payment.id) {
    await axios.put('/api/payment/', payment)
  } else {
    await axios.post('/api/payment/', payment)
  }
}

const validDate = candidate => !!parseDate(candidate)

export default class PaymentDetailView extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      paymentTypes: null,
      selectedPaymentType: null,
      payment: createNewPayment()
    }
  }

  renderPaymentTypes() {
    return (
      <select
        className="form-select"
        value={this.state.payment.paymentTypeId}
        onChange={evt => this.setState({ payment: { ...this.state.payment, paymentTypeId: evt.target.value } })}
      >
        <option value={null}>Valitse</option>
        {this.state.paymentTypes.map(paymentType => (
          <option value={paymentType.id}>{paymentType.description}</option>
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
        <option value={null}>Valitse</option>
        {this.state.payers.map(payer => (
          <option value={payer.id}>{payer.name}</option>
        ))}
      </select>
    )
  }

  async componentDidMount() {
    const { paymentTypes } = await fetchChoiceData()
    const { payers } = await fetchPayers()
    console.log({ payers })
    this.setState({ paymentTypes, payers })
    if (this.props.paymentId) {
      const { payment } = await fetchPayment(this.props.paymentId)
      this.setState({ payment })
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

          {this.state.paymentTypes && this.state.payers /* TODO check for all necessary state here (extract) */ ? (
            <div className="modal-body b__payment-detail-content">
              <div className="form-group">
                <label className="form-label">Tyyppi</label>
                {this.renderPaymentTypes()}
                <label className="form-label">Maksaja</label>
                {this.renderPayers()}
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
                <div className={`form-group ${validDate(this.state.payment.paymentDate) ? '' : 'has-error'}`}>
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

          <div className="modal-footer">
            <button className="btn btn-error b__delete-payment">Poista</button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                await savePayment(this.state.payment)
                this.props.stopEditing(true)
              }}
            >
              Tallenna
            </button>
          </div>
        </div>
      </div>
    )
  }
}
