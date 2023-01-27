'use strict';

class TeamModal extends React.Component {
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
                            <h5 className="modal-title">Modal description</h5>
                            <button type="button" className="btn-close" onClick={() => { this.props.setShowModal(false) }} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <label>Jugadorx 1</label>
                            <div className="form-group">
                                <input type="text" className="form-control" name="jugadorx1" id="jugadorx1Input"
                                    value={this.props.player1} onChange={(e) => { this.props.setPlayer1(e.target.value) }}
                                    placeholder="Nombre" />
                            </div>
                            <label style={{ marginTop: "1em" }}>Jugadorx 2</label>
                            <div className="form-group">
                                <input type="text" className="form-control" name="jugadorx2" id="jugadorx2Input"
                                    value={this.props.player2} onChange={(e) => { this.props.setPlayer2(e.target.value) }}
                                    placeholder="Nombre" />
                            </div>
                            <small className="form-text text-muted">{this.props.error}</small>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => { this.props.setShowModal(false) }} data-bs-dismiss="modal">Cerrar</button>
                            <button type="submit" className="btn btn-primary" onClick={this.props.saveTeam}>Guardar</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    }
}