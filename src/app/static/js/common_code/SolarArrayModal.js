'use strict';

class SolarArrayModal extends React.Component {
    constructor(props) {
        super(props);
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

        return <div style={{ background: "#00000060" }}
            className={"modal " + (this.props.showModal ? " show d-block" : " d-none")} tabIndex="-1" role="dialog">
            <div className="modal-dialog shadow">
                <form method="post">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{this.props.modalDescription}</h5>
                            <button type="button" className="btn-close" onClick={() => { this.props.setShowModal(false) }} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div>
                                <label>{TRANSLATED_STRINGS["inverterMakeAndModel_header"][this.props.pageLanguage]}</label>
                                <div className="form-group">
                                    <label>{this.props.selectedInverter}</label>
                                    <br />
                                </div>
                            </div>

                            <label>{TRANSLATED_STRINGS["panelMake_header"][this.props.pageLanguage]}</label>
                            <div className="form-group">
                                <input type="text" className="form-control" name="panelMake" id="panelMakeInput"
                                    value={this.props.panelMake} onChange={(e) => { this.props.setPanelMake(e.target.value) }}
                                    placeholder={TRANSLATED_STRINGS["panelMake_placeholder"][this.props.pageLanguage]} />
                            </div>
                            <label>{TRANSLATED_STRINGS["panelModel_header"][this.props.pageLanguage]}</label>
                            <div className="form-group">
                                <input type="text" className="form-control" name="panelModel" id="panelModelInput"
                                    value={this.props.panelModel} onChange={(e) => { this.props.setPanelModel(e.target.value) }}
                                    placeholder={TRANSLATED_STRINGS["panelModel_placeholder"][this.props.pageLanguage]} />
                            </div>

                            <label>{TRANSLATED_STRINGS["numberOfModules_header"][this.props.pageLanguage]}</label>
                            <div className="form-group">
                                <input type="number" min={1} className="form-control" name="numberOfModules" id="numberOfModulesInput"
                                    value={this.props.numberOfModules} onChange={(e) => { this.props.setNumberOfModules(e.target.value) }}
                                    placeholder="" style={{ "maxWidth": "150px" }} />
                            </div>

                            <label>{TRANSLATED_STRINGS["moduleCapacity_header"][this.props.pageLanguage]}</label>
                            <div className="form-group">
                                <input type="number" className="form-control" name="moduleCapacity" id="moduleCapacityInput"
                                    value={this.props.moduleCapacity} onChange={(e) => { this.props.setModuleCapacity(e.target.value) }}
                                    placeholder="" style={{ "maxWidth": "150px" }} />
                            </div>

                            <label>{TRANSLATED_STRINGS["azimuth_header"][this.props.pageLanguage]}</label>
                            <div className="form-group">
                                <input type="number" className="form-control" name="azimuth" id="azimuthInput"
                                    value={this.props.azimuth} onChange={(e) => { this.props.setAzimuth(e.target.value) }}
                                    placeholder="" style={{ "maxWidth": "150px" }} />
                            </div>

                            <label>{TRANSLATED_STRINGS["tiltAngle_header"][this.props.pageLanguage]}</label>
                            <div className="form-group">
                                <input type="number" className="form-control" name="tiltAngle" id="tiltAngleInput"
                                    value={this.props.tiltAngle} onChange={(e) => { this.props.setTiltAngle(e.target.value) }}
                                    placeholder="" style={{ "maxWidth": "150px" }} />
                            </div>

                            <label>{TRANSLATED_STRINGS["losses_header"][this.props.pageLanguage]}</label>
                            <div className="form-group">
                                <input type="number" className="form-control" name="losses" id="lossesInput"
                                    value={this.props.losses} onChange={(e) => { this.props.setLosses(e.target.value) }}
                                    placeholder="" style={{ "maxWidth": "150px" }} />
                            </div>

                            <label>{TRANSLATED_STRINGS["moduleType_header"][this.props.pageLanguage]}</label>
                            <div className="form-group">
                                <select value={this.props.moduleType} onChange={(e) => {
                                    this.props.setModuleType(e.target.value);
                                }}>
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
                                <select value={this.props.arrayType} onChange={(e) => {
                                    this.props.setArrayType(e.target.value);
                                }}>
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
                                <textarea type="text" className="form-control" name="note" id="noteInput"
                                    value={this.props.note} onChange={(e) => { this.props.setNote(e.target.value) }}
                                    placeholder={TRANSLATED_STRINGS["note_placeholder"][this.props.pageLanguage]} />
                            </div>
                            <small className="form-text text-muted">{this.props.error}</small>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => { this.props.setShowModal(false) }} data-bs-dismiss="modal">
                                {TRANSLATED_STRINGS["close_btn"][this.props.pageLanguage]}
                            </button>
                            <button id="createArrayBtn" type="submit" className="btn btn-primary" onClick={this.props.onclickFnc}
                                style={{ backgroundColor: "#402E32", borderColor: "#402E32" }}>
                                {this.props.btnText}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    }
}