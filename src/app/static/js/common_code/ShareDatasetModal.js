'use strict';

class ShareDatasetModal extends React.Component {
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
                            <label style={{ marginTop: "2em" }} htmlFor="myfile">
                                {this.props.sharedWithEmails.length === 0 ? 'Not shared yet' : 'Emails:'}
                            </label>
                            {this.props.sharedWithEmails.map((user, idx) =>
                                <div key={idx}>
                                    <label>{user.email}</label>
                                    <button type="button" className="btn btn-secondary"
                                        style={{ backgroundColor: "#434575", borderColor: "#434575" }}
                                        onClick={() => { this.props.removeRelation(this.props.spreadsheetId, user.id) }}>X</button>
                                </div>
                            )}
                            <br />
                            <br />
                            -------------------------------------------
                            <div style={{ display: 'flex' }}>
                                <label>Mail: </label>
                                {
                                    this.props.existingMails.length > 0 ?
                                        <select value={this.props.newEmailToShare}
                                            onChange={(e) => {
                                                this.props.setNewEmailToShare(e.target.value)
                                            }}>
                                            {this.props.existingMails.map((mail, idx) => <option key={idx} value={mail}>{mail}</option>)}
                                        </select>
                                        :
                                        <input type="text" className="form-control" name="datasetName" id="datasetNameInput"
                                            value={this.props.newEmailToShare}
                                            onChange={(e) => { this.props.setNewEmailToShare(e.target.value) }}
                                            onKeyPress={(event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    document.getElementById("shareSheetBtn").click();
                                                }
                                            }}
                                            placeholder="" style={{ "maxWidth": "150px" }} />
                                }

                                <button type="button" id="shareSheetBtn"
                                    className="btn btn-secondary"
                                    style={{ backgroundColor: "#434575", borderColor: "#434575" }}
                                    onClick={() => { this.props.addRelation(this.props.spreadsheetId, this.props.newEmailToShare) }}>Share</button>
                            </div>
                            <small className="form-text text-muted">{this.props.error}</small>
                        </div>
                    </div>
                </form>
            </div >
        </div >
    }
}