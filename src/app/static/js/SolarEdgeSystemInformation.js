'use strict';

class SolarEdgeSystemInformation extends React.Component {
  constructor(props) {
    super(props);
    // Bindings for form fields would go here,
    // and state would keep track of field input
  }

  render() {
    if (this.props.systemData === null || this.props.systemData.api_name !== "SolarEdge") {
      return null;
    }

    const pageLanguage = "en";

    return (
      <div>
        {this.props.invertersList.map((inverter, inverter_idx) =>
          <div key={inverter.id} style={{
            maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
            padding: "1em"
          }} className="shadow">
            <div style={{ display: "flex", flexDirection: "row", marginBottom: "5px" }}>
            </div>
            <div key={inverter.id} className="" style={{ padding: "1em", width: "50%" }}>
              <div className="insideDivPadding">
                <h2>Inverter {inverter_idx + 1}: {inverter.make} - {inverter.model}</h2>
              </div>
              <div className="insideDivPadding">
                <label>Serial number:</label>{'  '}
                <label>{inverter.serial_number}</label>
              </div>
              <div className="insideDivPadding">
                <label>Connected optimizers:</label>{'  '}
                <label>{inverter.connected_optimizers}</label>
              </div>
            </div>
            <div className="flex-2-cols">
              {this.props.arraysList.map((row, idx) =>
                row.inverter === inverter.id ?
                  <div key={row.id} className="" style={{ padding: "1em", width: "50%" }}>
                    <div className="insideDivPadding">
                      <h2>Array</h2>
                    </div>
                    <div className="insideDivPadding">
                      <label>Solar Panel Make:</label>{'  '}
                      <label>{row.panel_make}</label>
                    </div>
                    <div className="insideDivPadding">
                      <label>Solar Panel Model:</label>{'  '}
                      <label>{row.panel_model}</label>
                    </div>
                    <div className="insideDivPadding">
                      <label>Module Capacity:</label>{'  '}
                      <label>{row.module_capacity}</label>
                    </div>
                    <div className="insideDivPadding">
                      <label># Modules:</label>{'  '}
                      <label>{row.number_of_modules}</label>
                    </div>
                    <div className="insideDivPadding">
                      <label>Azimuth:</label>{'  '}
                      <label>{row.azimuth}</label>
                    </div>
                    <div className="insideDivPadding">
                      <label>Tilt Angle:</label>{'  '}
                      <label>{row.tilt_angle}</label>
                    </div>
                    <div className="insideDivPadding">
                      <label>losses:</label>{'  '}
                      <label>{row.losses}</label>
                    </div>
                    <div className="insideDivPadding">
                      <label>Array type:</label>{'  '}
                      <label>{row.array_type}</label>
                    </div>
                    <div className="insideDivPadding">
                      <label>Module type:</label>{'  '}
                      <label>{row.module_type}</label>
                    </div>
                    <div className="insideDivPadding">
                      <label>Note:</label>{'  '}
                      <br />
                      <label style={{ whiteSpace: "pre-wrap" }}>{row.note}</label>
                    </div>
                  </div> : <div style={{ display: 'none' }} key={row.id}></div>
              )}
            </div>
          </div>
        )
        }
      </div >
    );
  }
}