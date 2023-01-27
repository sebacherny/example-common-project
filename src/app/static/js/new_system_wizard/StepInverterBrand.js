'use strict';

class StepInverterBrand extends React.Component {
    constructor(props) {
        super(props);
        // Bindings for form fields would go here,
        // and state would keep track of field input
    }

    render() {
        if (this.props.currentStep !== "brand") {
            return null;
        }

        return (
            <div>
                <div>
                    <label>Name your system</label>
                    <input placeholder="house, office, ..."
                        value={this.props.systemName} onChange={(e) => { this.props.setSystemName(e.target.value) }}
                        id="wizardInverterBrandInput"
                    ></input>
                </div>
                <br />
                <label>Select your inverter manufacturer</label>
                <br />
                <div>
                    <button type="button"
                        className={"btn btn-outline-secondary " + (this.props.inverterBrand === "Enphase" ? "active" : "")}
                        id="btnEnphase" onClick={() => {
                            this.props.setInverterBrand("Enphase");
                        }}>Enphase</button>
                    <button type="button"
                        className={"btn btn-outline-secondary " + (this.props.inverterBrand === "SolarEdge" ? "active" : "")}
                        id="btnSolarEdge" onClick={() => {
                            this.props.setInverterBrand("SolarEdge");
                        }}>SolarEdge</button>
                </div>
                <br />
            </div >
        );
    }
}