'use strict';

class StepNewArrayEnphase extends React.Component {
  constructor(props) {
    super(props);
    // Bindings for form fields would go here,
    // and state would keep track of field input
  }

  render() {

    const TRANSLATED_STRINGS = {
      "inverterMakeAndModel_header": { "en": "Inverter" },
      "inverterMakeAndModel_placeholder": { "en": "Make - model" },

      "panelMake_header": { "en": "Panel make" },
      "panelMake_placeholder": { "en": "Make" },

      "panelModel_header": { "en": "Panel model" },
      "panelModel_placeholder": { "en": "Model" },

      "numberOfModules_header": { "en": "Number of panels" },
      "arrayType_header": { "en": "Array type" },
      "moduleType_header": { "en": "Module type" },
      "losses_header": { "en": "Losses" },
      "moduleCapacity_header": { "en": "Module capacity" },

      "azimuth_header": { "en": "Azimuth" },
      "azimuth_placeholder": { "en": "example: ..." },

      "tiltAngle_header": { "en": "Tilt angle" },
      "tiltAngle_placeholder": { "en": "..." },

      "note_header": { "en": "Note" },
      "note_placeholder": { "en": "" },
      "close_btn": { "en": "Close" },
    };


    const shouldAvoid = this.props.currentStep !== "newarray" || this.props.inverterBrand !== "Enphase";

    return (
      <div style={{ display: shouldAvoid ? "none" : "block" }}>
        {this.props.arrays.length > 0 &&
          <div>
            <button type="button" onClick={() => { this.props.previousArray() }}>{"<"}</button>
            <label>Array {this.props.arrayIndex + 1}</label>
            <button type="button" onClick={() => { this.props.nextArray() }}>{">"}</button>
            <br />
            {this.props.arrays[this.props.arrayIndex]['inverter_indexes'] != null &&
              <label>Microinverters list {this.props.arrays[this.props.arrayIndex]['inverter_indexes'].map(x => x + 1).join(', ')}</label>
            }
            <button type="button" onClick={() => { this.props.deleteArray() }}>Delete</button>
          </div>
        }
        {
          this.props.inverters.length > 0 &&
          <div>
            <button type="button" onClick={() => { this.props.previousInverter() }}>{"<"}</button>
            <label>Inverter {this.props.inverterIndex + 1} - {this.props.inverters[this.props.inverterIndex]['SN']}</label>
            <button type="button" onClick={() => { this.props.nextInverter() }}>{">"}</button>
            <br />
            <label>In array: </label>
            <label>{this.props.inverters[this.props.inverterIndex]['assigned_arrays'].map(x => x + 1).join(', ')}</label>
            {this.props.inverters[this.props.inverterIndex]['assigned_arrays'].length === 0 &&
              <button type="button" onClick={() => { this.props.addToInverter() }}>Add to array {this.props.arrayIndex + 1}</button>
            }
            {this.props.inverters[this.props.inverterIndex]['assigned_arrays'].length === 1 &&
              <button type="button" onClick={() => { this.props.removeFromInverter() }}>Remove from array {this.props.inverters[this.props.inverterIndex]['assigned_arrays'][0] + 1}</button>
            }
          </div>
        }
        <div>
          <label>{TRANSLATED_STRINGS["panelMake_header"][this.props.pageLanguage]}</label>
          <div className="form-group">
            <input type="text" className="form-control" name="panelMake" id="wizardPanelMakeInput"
              placeholder={TRANSLATED_STRINGS["panelMake_placeholder"][this.props.pageLanguage]} />
          </div>
          <label>{TRANSLATED_STRINGS["panelModel_header"][this.props.pageLanguage]}</label>
          <div className="form-group">
            <input type="text" className="form-control" name="panelModel" id="wizardPanelModelInput"
              placeholder={TRANSLATED_STRINGS["panelModel_placeholder"][this.props.pageLanguage]} />
          </div>

          <label>{TRANSLATED_STRINGS["numberOfModules_header"][this.props.pageLanguage]}</label>
          <div className="form-group">
            <input type="number" min={1} className="form-control" name="numberOfModules" id="wizardNumberOfModulesInput"
              defaultValue={0}
              placeholder="" style={{ "maxWidth": "150px" }} />
          </div>

          <label>{TRANSLATED_STRINGS["moduleCapacity_header"][this.props.pageLanguage]}</label>
          <div className="form-group">
            <input type="number" className="form-control" name="moduleCapacity" id="wizardModuleCapacityInput"
              defaultValue={0}
              placeholder="" style={{ "maxWidth": "150px" }} />
          </div>

          <label>{TRANSLATED_STRINGS["azimuth_header"][this.props.pageLanguage]}</label>
          <div className="form-group">
            <input type="number" className="form-control" name="azimuth" id="wizardAzimuthInput"
              defaultValue={0}
              placeholder="" style={{ "maxWidth": "150px" }} />
          </div>

          <label>{TRANSLATED_STRINGS["tiltAngle_header"][this.props.pageLanguage]}</label>
          <div className="form-group">
            <input type="number" className="form-control" name="tiltAngle" id="wizardTiltAngleInput"
              defaultValue={0}
              placeholder="" style={{ "maxWidth": "150px" }} />
          </div>

          <label>{TRANSLATED_STRINGS["losses_header"][this.props.pageLanguage]}</label>
          <div className="form-group">
            <input type="number" className="form-control" name="losses" id="wizardLossesInput"
              defaultValue={14}
              placeholder="" style={{ "maxWidth": "150px" }} />
          </div>

          <label>{TRANSLATED_STRINGS["moduleType_header"][this.props.pageLanguage]}</label>
          <div className="form-group">
            <select id="wizardModuleType">
              <option value={0}>
                0 (Standard)
              </option>
              <option value={1}>
                1 (Premium)
              </option>
              <option value={2}>
                2 (Thin film)
              </option>
            </select>
          </div>

          <label>{TRANSLATED_STRINGS["arrayType_header"][this.props.pageLanguage]}</label>
          <div className="form-group">
            <select id="wizardArrayType">
              <option value={0}>
                0 (Fixed - Open Rack)
              </option>
              <option value={1}>
                1 (Fixed - Roof Mounted)
              </option>
            </select>
          </div>


          <label>{TRANSLATED_STRINGS["note_header"][this.props.pageLanguage]}</label>
          <div className="form-group">
            <textarea type="text" className="form-control" name="note" id="wizardNoteInput"
              placeholder={TRANSLATED_STRINGS["note_placeholder"][this.props.pageLanguage]} />
          </div>
          <small className="form-text text-muted">{this.props.error}</small>
        </div>
      </div>
    );
  }
}