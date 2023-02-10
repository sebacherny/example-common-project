'use strict';

class InformationModal extends React.Component {
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
                            <div style={{ display: "flex", marginBottom: '10px' }}>
                                <button type="button"
                                    className={"btn " + (this.props.tabSelected == 'table' ? 'tabSelected' : '')}
                                    style={{
                                        marginRight: '10px',
                                        color: 'black', borderColor: 'black', border: '3px solid'
                                    }}
                                    onClick={() => { this.props.setTabSelected('table') }}>Table</button>
                                <button type="button"
                                    className={"btn " + (this.props.tabSelected == 'text' ? 'tabSelected' : '')}
                                    style={{
                                        marginRight: '20px',
                                        color: 'black', borderColor: 'black', border: '3px solid'
                                    }}
                                    onClick={() => { this.props.setTabSelected('text') }}>Text</button>
                            </div>
                            {
                                this.props.tabSelected === 'table' ? this.props.tableElement : this.props.textElement
                            }
                            <br />
                            <br />
                        </div>
                    </div>
                </form>
            </div >
        </div >
    }
}