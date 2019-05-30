import React from 'react'
import './paymentDetailView.less'

export default class PaymentDetailView extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {}
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
          <div className="modal-body b__payment-detail-content">
            <div class="form-group">
              <label class="form-label">Tyyppi</label>
              <select class="form-select">
                <option>Sähkö</option>
                <option>Lemmikit</option>
              </select>
              <label class="form-label">Maksaja</label>
              <select class="form-select">
                <option>Johanna Nummila</option>
                <option>Perttu Auramo</option>
              </select>
              <label class="form-label">Hinta</label>
              <input class="form-input" type="text" placeholder="Hinta euroina" />
              <label class="form-label">Päivä</label>
              <input class="form-input" type="text" placeholder="PP.KK.VVVV" />
              <label class="form-label">Lisätiedot</label>
              <textarea class="form-input" placeholder="Kuvaus" rows="3" />
            </div>
          </div>
          <div className="modal-footer">
            <button class="btn btn-error b__delete-payment">Poista</button>
            <button class="btn btn-primary">Tallenna</button>
          </div>
        </div>
      </div>
    )
  }
}
