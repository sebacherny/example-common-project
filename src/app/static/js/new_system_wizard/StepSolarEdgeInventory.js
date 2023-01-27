'use strict';

class Step3SolarEdge extends React.Component {
  constructor(props) {
    super(props);
    // Bindings for form fields would go here,
    // and state would keep track of field input
  }

  render() {
    if (this.props.currentStep !== "SEinventory" && this.props.currentStep !== "ENinventory") {
      return null;
    }
    if (this.props.siteInventory == null) {
      this.props.getSiteInventory();
      return null;
    }
    let inverters = "";
    let connectedOptimizersOrGateways = "";
    for (const inverter of this.props.siteInventory["inverters"]) {
      inverters += inverter["name"] + "(" + inverter["model"] + ")" + "\n";
      if (this.props.inverterBrand === "SolarEdge") {
        connectedOptimizersOrGateways += inverter["connectedOptimizers"] + "\n";
      }
    }
    if (this.props.inverterBrand === "Enphase") {
      for (const gateway of this.props.siteInventory["gateways"]) {
        connectedOptimizersOrGateways += gateway["name"] + "\n";
      }
    }

    return (
      <div>
        <label>Confirm system inventory</label>
        <br />
        <div>
          <div>
            <label>Inverters</label>
            <textarea defaultValue={inverters} />
          </div>
        </div>
        <div>
          <label>{this.props.inverterBrand === "Enphase" ? "Gateways" : "Optimizers"}</label>
          <textarea defaultValue={connectedOptimizersOrGateways} />
        </div>
        <br />
      </div>
    );
  }
}