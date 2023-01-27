'use strict';

class Step2SolarEdge extends React.Component {
  constructor(props) {
    super(props);
    // Bindings for form fields would go here,
    // and state would keep track of field input
  }

  render() {
    if (this.props.currentStep !== "siteid") {
      return null;
    }

    return (
      <div>
        <label>{this.props.siteID === "" ? "Enter " : "Confirm "} Site ID</label>
        <br />
        {this.props.siteIDmanualInput &&
          <input id="wizardSiteIdInput" type="number" min={0} onChange={(e) => {
            this.props.setNextBtnDisabled(e.target.value === "" || parseInt(e.target.value) < 0);
            this.props.setSiteID(e.target.value);
          }}></input>
        }
        {!this.props.siteIDmanualInput &&
          <label>{this.props.siteID}</label>
        }
        <br />

      </div>
    );
  }
}