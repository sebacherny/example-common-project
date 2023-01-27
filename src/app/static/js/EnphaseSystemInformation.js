'use strict';

class EnphaseSystemInformation extends React.Component {
  constructor(props) {
    super(props);
    // Bindings for form fields would go here,
    // and state would keep track of field input
  }

  render() {
    if (this.props.systemData === null || this.props.systemData.api_name !== "Enphase") {
      return null;
    }

    const TRANSLATED_STRINGS = {
      "azimuth_header": { "en": "Azimuth" },
      "moduleCapacity_header": { "en": "Module Capacity" },
      "numberOfModules_header": { "en": "# Modules" },
      "tiltAngle_header": { "en": "Tilt Angle" },
      "losses_header": { "en": "losses" },
      "arrayType_header": { "en": "Array type" },
      "moduleType_header": { "en": "Module type" },
      "note_header": { "en": "Note" },

    };
    const pageLanguage = "en";

    return (
      <div>
        {this.props.arraysList.map((array, array_idx) =>
          <div key={array.id} style={{
            maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
            padding: "1em"
          }} className="shadow">
            <div style={{ display: "flex", flexDirection: "row", marginBottom: "5px" }}>
            </div>
            <div key={array.id} className="" style={{ padding: "1em", width: "50%" }}>
              <div className="insideDivPadding">
                <h2>Array {array_idx + 1}: {array.panel_make} - {array.panel_model}</h2>
              </div>
              <div className="insideDivPadding">
                <label>{TRANSLATED_STRINGS["moduleCapacity_header"][pageLanguage]}:</label>{'  '}
                <label>{array.module_capacity}</label>
              </div>
              <div className="insideDivPadding">
                <label>{TRANSLATED_STRINGS["numberOfModules_header"][pageLanguage]}:</label>{'  '}
                <label>{array.number_of_modules}</label>
              </div>
              <div className="insideDivPadding">
                <label>{TRANSLATED_STRINGS["azimuth_header"][pageLanguage]}:</label>{'  '}
                <label>{array.azimuth}</label>
              </div>
              <div className="insideDivPadding">
                <label>{TRANSLATED_STRINGS["tiltAngle_header"][pageLanguage]}:</label>{'  '}
                <label>{array.tilt_angle}</label>
              </div>
              <div className="insideDivPadding">
                <label>{TRANSLATED_STRINGS["losses_header"][pageLanguage]}:</label>{'  '}
                <label>{array.losses}</label>
              </div>
              <div className="insideDivPadding">
                <label>{TRANSLATED_STRINGS["arrayType_header"][pageLanguage]}:</label>{'  '}
                <label>{array.array_type}</label>
              </div>
              <div className="insideDivPadding">
                <label>{TRANSLATED_STRINGS["moduleType_header"][pageLanguage]}:</label>{'  '}
                <label>{array.module_type}</label>
              </div>
              <div className="insideDivPadding">
                <label>{TRANSLATED_STRINGS["note_header"][pageLanguage]}:</label>{'  '}
                <br />
                <label style={{ whiteSpace: "pre-wrap" }}>{array.note}</label>
              </div>
            </div>
            <div className="flex-2-cols">
              {this.props.invertersList.map((inverter, inverter_idx) =>
                inverter.array === array.id ?
                  <div key={inverter.id} className="" style={{ padding: "1em", width: "50%" }}>
                    <div className="insideDivPadding">
                      <h2>Microinverter</h2>
                    </div>
                    <div className="insideDivPadding">
                      <label>Make:</label>{'  '}
                      <label>{inverter.make}</label>
                    </div>
                    <div className="insideDivPadding">
                      <label>Model:</label>{'  '}
                      <label>{inverter.model}</label>
                    </div>
                    <div className="insideDivPadding">
                      <label>Part number:</label>{'  '}
                      <label>{inverter.part_number}</label>
                    </div>
                    <div className="insideDivPadding">
                      <label>Serial number:</label>{'  '}
                      <label>{inverter.serial_number}</label>
                    </div>
                    <div className="insideDivPadding">
                      <label>Sku:</label>{'  '}
                      <label>{inverter.sku}</label>
                    </div>
                  </div> : <div style={{ display: 'none' }} key={inverter.id}></div>
              )}
            </div>
          </div>
        )
        }
      </div >
    );
  }
}