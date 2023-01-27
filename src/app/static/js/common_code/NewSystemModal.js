'use strict';

class NewSystemModal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

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
                            <label>Name</label>
                            <input type="text" className="form-control" name="systemName" id="systemNameInput"
                                value={this.props.systemName} onChange={(e) => { this.props.setSystemName(e.target.value) }}
                                placeholder="" style={{ "maxWidth": "150px" }} />
                            <label>Manufacturer</label>
                            <select value={this.props.apiName} onChange={(e) => this.props.setApiName(e.target.value)}>
                                <option value="SolarEdge">Solar Edge</option>
                                <option value="Enphase">Enphase</option>
                            </select>
                            <label style={{ marginTop: "1em" }}>Location (address)</label>
                            <input type="text" className="form-control" name="systemLocationAddress" id="systemLocationAddressInput"
                                value={this.props.systemLocationAddress} onChange={(e) => { this.props.setSystemLocationAddress(e.target.value) }}
                                placeholder="" style={{ "maxWidth": "150px" }} />
                            <label style={{ marginTop: "1em" }}>System ID</label>
                            <button type="button" onClick={() => { this.props.getClientInfo(); }}>Get with address</button>
                            <input type="text" className="form-control" name="systemId" id="systemIdInput"
                                value={this.props.systemId} disabled={true}
                                placeholder="" style={{ "maxWidth": "150px" }} />
                            <small className="form-text text-muted">{this.props.error}</small>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => { this.props.setShowModal(false) }} data-bs-dismiss="modal">Close</button>
                            <button type="submit" disabled={this.props.systemId === ""} className="btn btn-primary" onClick={this.props.saveNewSystem}
                                style={{ backgroundColor: "#402E32", borderColor: "#402E32" }}>
                                {this.props.btnText}
                            </button>
                        </div>
                    </div>
                </form>
            </div >
        </div >
    }
}