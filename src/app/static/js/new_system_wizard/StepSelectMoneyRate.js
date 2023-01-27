'use strict';

class StepMoneyRate extends React.Component {
  constructor(props) {
    super(props);
    // Bindings for form fields would go here,
    // and state would keep track of field input
  }

  render() {
    if (this.props.currentStep !== "moneyrate") {
      return null;
    }

    const uniqueUtilityNames = [...new Set(this.props.ratesArray.map((rate, idx) => rate.utility_name))];
    var uniqueRateNames = [];
    if (this.props.selectedUtilityName != null) {
      uniqueRateNames = [...new Set(this.props.ratesArray.filter((rate, idx) => rate.utility_name === this.props.selectedUtilityName).map((rate, idx) => rate.rate_name))];
    }

    const refreshRatesArray = () => {
      get_all_rates_api((rates) => this.props.setRatesArray(rates), (text) => { console.log("Error: ", text) });
    };

    return (
      <div>
        <label>Utility Name</label>
        <select value={this.props.selectedUtilityName} onChange={e => {
          this.props.setSelectedUtilityName(e.target.value);
          this.props.setSelectedUtilityRate('');
        }
        }>
          <option value=''></option>
          {uniqueUtilityNames.map((name, idx) => <option key={idx} value={name}>
            {name}
          </option>
          )}
        </select>
        <br />
        <label>Rate Name</label>
        <select value={this.props.selectedUtilityRate} onChange={e => this.props.setSelectedUtilityRate(e.target.value)}>
          <option value=''></option>
          {uniqueRateNames.map((rateName, idx) => <option key={idx} value={rateName}>
            {rateName}
          </option>
          )}
        </select>
        <br />
        <a href="/rate-creation" className="btn" target="_blank">Create Rate</a>
        <br />
        <button type="button" className="btn" onClick={() => { refreshRatesArray(); }}>Refresh</button>
      </div >
    );
  }
}