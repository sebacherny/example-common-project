'use strict';

class InverterModal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        const TRANSLATED_STRINGS = {
            "inverterMake_header": { "en": "Inverter make" },
            "inverterMake_placeholder": { "en": "Make" },

            "inverterModel_header": { "en": "Inverter model" },
            "inverterModel_placeholder": { "en": "Model" },

            "inverterCapacity_header": { "en": "Inverter capacity" },

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
                            <label>{TRANSLATED_STRINGS["inverterMake_header"][this.props.pageLanguage]}</label>
                            <div className="form-group">
                                <input type="text" className="form-control" name="make" id="inverterMakeInput"
                                    value={this.props.inverterMake} onChange={(e) => { this.props.setInverterMake(e.target.value) }}
                                    placeholder={TRANSLATED_STRINGS["inverterMake_placeholder"][this.props.pageLanguage]} />
                            </div>

                            <label>{TRANSLATED_STRINGS["inverterModel_header"][this.props.pageLanguage]}</label>
                            <div className="form-group">
                                <input type="text" className="form-control" name="model" id="modelInput"
                                    value={this.props.inverterModel} onChange={(e) => { this.props.setInverterModel(e.target.value) }}
                                    placeholder={TRANSLATED_STRINGS["inverterModel_placeholder"][this.props.pageLanguage]} />
                            </div>

                            <label>{TRANSLATED_STRINGS["inverterCapacity_header"][this.props.pageLanguage]}</label>
                            <div className="form-group">
                                <input type="number" className="form-control" name="capacity" id="capacityInput"
                                    value={this.props.inverterCapacity} onChange={(e) => { this.props.setInverterCapacity(e.target.value) }}
                                    placeholder="" style={{ "maxWidth": "150px" }} />
                            </div>
                            <small className="form-text text-muted">{this.props.error}</small>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => { this.props.setShowModal(false) }} data-bs-dismiss="modal">
                                {TRANSLATED_STRINGS["close_btn"][this.props.pageLanguage]}
                            </button>
                            <button id="createInverterBtn" type="submit" className="btn btn-primary" onClick={this.props.onclickFnc}
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