'use strict';

class Step1SolarEdge extends React.Component {
  constructor(props) {
    super(props);
    // Bindings for form fields would go here,
    // and state would keep track of field input
  }

  render() {

    if (this.props.currentStep !== "location") {
      return null;
    }

    return (
      <div>
        <label>Where is the system installed?</label>
        <br />
        <label style={{ marginTop: "1em" }}>Street address</label>
        <input type="text" className="form-control" name="systemLocationAddress" id="wizardSystemLocationAddressInput"
          value={this.props.systemLocationAddress} onChange={(e) => { this.props.setSystemLocationAddress(e.target.value) }}
          placeholder="" style={{ "maxWidth": "150px" }} />
        <br />
        <label style={{ marginTop: "1em" }}>City</label>
        <input type="text" className="form-control" name="city" id="cityInput"
          value={this.props.systemLocationCity} onChange={(e) => { this.props.setSystemLocationCity(e.target.value) }}
          placeholder="" style={{ "maxWidth": "150px" }} />
        <br />
        <label style={{ marginTop: "1em" }}>State</label>
        <input type="text" className="form-control" name="systemLocationState" id="systemLocationStateInput"
          value={this.props.systemLocationState} onChange={(e) => { this.props.setSystemLocationState(e.target.value) }}
          placeholder="" style={{ "maxWidth": "150px" }} />
        <br />
        <label style={{ marginTop: "1em" }}>Zip code</label>
        <input type="text" className="form-control" name="systemLocationZipCode" id="systemLocationZipCodeInput"
          value={this.props.systemLocationZipCode} onChange={(e) => { this.props.setSystemLocationZipCode(e.target.value) }}
          placeholder="" style={{ "maxWidth": "150px" }} />
        <br />
        <button type="button">Add Utility Info</button>
      </div>
    );
  }
}