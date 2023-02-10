'use strict';

class NewDatasetModal extends React.Component {
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
                            {
                                this.props.avoidName ?
                                    null :
                                    <div>
                                        <label>Name</label>
                                        <input type="text" className="form-control" name="datasetName" id="datasetNameInput"
                                            value={this.props.datasetName} onChange={(e) => { this.props.setDatasetName(e.target.value) }}
                                            placeholder="" style={{ "maxWidth": "150px" }} />
                                    </div>
                            }
                            <label style={{ marginTop: "2em" }} htmlFor="myfile">Select a file:</label>
                            <input className="btn btn-light" type="file" id="myfile" name="myfile"
                                accept=".csv,.xlsx"
                                onChange={() => this.props.setFileLoaded(true)} />
                            <br />
                            <small className="form-text text-muted">{this.props.error}</small>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => { this.props.setShowModal(false) }} data-bs-dismiss="modal">Close</button>
                            <button type="submit" disabled={(!this.props.avoidName && this.props.datasetName == '') || this.props.fileLoaded == false} className="btn btn-primary" onClick={this.props.saveNewDataset}
                                style={{ backgroundColor: "#434575", borderColor: "#434575" }}>
                                {this.props.btnText}
                            </button>
                        </div>
                    </div>
                </form>
            </div >
        </div >
    }
}