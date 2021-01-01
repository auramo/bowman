import React from 'react'
import axios from 'axios'
import './paymentDetailView.less'

const fetchChoiceData = async () => {
  const {
    data: { paymentTypes }
  } = await axios.get('/api/paymentTypes')
  return { paymentTypes }
}

const fetchPayment = async (paymentId) => {
  const {
    data: { payment }
  } = await axios.get(`/api/payment?paymentId=${paymentId}`)
  console.log(payment)
  return { payment }
}

const createNewPayment = () => ({
  description: '',
  amountCents: null,
  paymentTypeId: null,
  payerId: null,
  paymentDate: null
})


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
        value={this.state.selectedPaymentType}
        onChange={evt => this.setState({ selectedPaymentType: evt.target.value })}
      >
        <option value={null}>Valitse</option>
        {this.state.paymentTypes.map(paymentType => (
          <option value={paymentType.id}>{paymentType.description}</option>
        ))}
      </select>
    )
  }

  async componentDidMount() {
    const { paymentTypes } = await fetchChoiceData()
    console.log({ paymentTypes })
    this.setState({ paymentTypes })
    if (this.props.paymentId) {
      const { payment } = await fetchPayment(this.props.paymentId)
      this.setState({payment})
    }
  }

  render() {
    return (
      <div className={'modal active'}>
        <a href="#close" className="modal-overlay" onClick={this.props.closeDetailView} />
        <div className="modal-container b__payment-detail-container">
          <div className="modal-header">
            <a href="#close" className="btn btn-clear float-right" onClick={this.props.closeDetailView} />
            <div className="b__payment-detail-header">
              <div className="b__payment-detail-logo">
                <img src="img/big-euro-coin-on-hand-svgrepo-com.svg" />
              </div>
              <div className="modal-title h5 b__payment-detail-heading">Maksun tiedot</div>
            </div>
          </div>

          {this.state.paymentTypes /* TODO check for all necessary state here (extract) */ ? (
            <div className="modal-body b__payment-detail-content">
              <div className="form-group">
                <label className="form-label">Tyyppi</label>
                {this.renderPaymentTypes()}
                <label className="form-label">Maksaja</label>
                <select className="form-select">
                  <option>Johanna Nummila</option>
                  <option>Perttu Auramo</option>
                </select>
                <label className="form-label">Hinta</label>
                <input className="form-input" type="text" placeholder="Hinta euroina" />
                <label className="form-label">Päivä</label>
                <input className="form-input" type="text" placeholder="PP.KK.VVVV" />
                <label className="form-label">Lisätiedot</label>
                <textarea className="form-input" 
                  placeholder="Kuvaus" 
                  rows="3" 
                  value={this.state.payment.description}
                  onChange={newVal => this.state.payment.description = newVal} />
              </div>
            </div>
          ) : (
            <div className="loading loading-lg" />
          )}

          <div className="modal-footer">
            <button className="btn btn-error b__delete-payment">Poista</button>
            <button className="btn btn-primary">Tallenna</button>
          </div>
        </div>
      </div>
    )
  }
}
