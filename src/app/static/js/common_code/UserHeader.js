'use strict';

class UserHeader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        const logout = async (e) => {
            await localStorage.removeItem("userToken");
            await localStorage.removeItem("loggedInUsername");
            this.props.setLoggedInUsername(null);
            if (this.props.redirectWhenLoggedOut) {
                window.location = this.props.is_sports ? "/sports/login" : "/login";
            }
        };
        if (this.props.loggedInUsername == null) {
            return <div style={{
                display: "flex", flexDirection: "row"
            }} className="shadow container_div">
                <a className="btn btn-light" style={{ marginLeft: "auto" }} href={window.location.origin + "/login"}>Login</a>
            </div>
        }
        return <div className='container_div' style={{
            display: "flex", flexDirection: "row",
        }}>
            {
                !this.props.is_sports && (this.props.is_admin || this.props.is_client_admin) ?
                    <a className={"btn btn-secondary "}
                        style={{ backgroundColor: "#434575", borderColor: "#434575" }}
                        href="/datasets">My Datasets</a> :
                    null
            }
            {!this.props.is_sports && this.props.is_admin &&
                <a className={"btn btn-secondary "}
                    style={{ backgroundColor: "#434575", borderColor: "#434575", marginLeft: '10px' }}
                    href="/tickets">Tickets ({this.props.tickets_count})</a>
            }
            {
                this.props.is_sports ?
                    <a key={1} href='/sports-dashboard'
                        style={{ borderColor: "#434575" }}
                        className="btn btn-default">See Sports Dashboard</a>
                    : null
            }
            {
                this.props.is_sports && this.props.is_admin && window.location.href.includes('sports-dashboard') ?
                    <button key={2} onClick={this.props.newPeopleSpreadsheet}
                        style={{ borderColor: "#434575" }}
                        className="btn btn-default">Upload New Information</button> :
                    null
            }
            {
                this.props.is_sports ?
                    null :
                    <a className={"btn btn-secondary "}
                        style={{ backgroundColor: "#434575", borderColor: "#434575", marginLeft: '10px' }}
                        href="/add-data">Add my company's data</a>
            }
            <div style={{ marginLeft: "auto" }} >
                <a className={"btn btn-secondary " + (this.props.viewName === "profile" ? "active" : "")}
                    href="/profile" style={{ marginRight: "0.5em", backgroundColor: "#434575", borderColor: "#434575" }}>
                    {this.props.loggedInUsername}
                </a>
                <a className="btn btn-hover" style={{ marginLeft: "auto", border: "solid 1px" }} onClick={logout}>Logout</a>
            </div>
        </div>;
    }
}