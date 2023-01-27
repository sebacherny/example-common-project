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
                window.location = "/login";
            }
        };
        if (this.props.loggedInUsername == null) {
            return <div style={{
                display: "flex", flexDirection: "row",
                maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
                padding: "1em"
            }} className="shadow">
                <a className="btn btn-light" style={{ marginLeft: "auto" }} href={window.location.origin + "/login"}>Login</a>
            </div>
        }
        return <div style={{
            display: "flex", flexDirection: "row",
            maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
            padding: "1em"
        }} className="shadow">
            {this.props.is_admin &&
                [
                    <a key="1" className={"btn btn-secondary "}
                        style={{ backgroundColor: "#402E32", borderColor: "#402E32" }}
                        href="/admin-dashboard">Admin dashboard</a>,
                    <a key="2" className={"btn btn-secondary "}
                        style={{ backgroundColor: "#402E32", borderColor: "#402E32" }}
                        href="/clients-info">Clients info</a>,
                    <a key="3" className={"btn btn-secondary "}
                        style={{ backgroundColor: "#402E32", borderColor: "#402E32" }}
                        href="/see-database">Check database</a>
                ]

            }
            {!this.props.is_admin &&
                <a className={"btn btn-secondary "}
                    style={{ backgroundColor: "#402E32", borderColor: "#402E32" }}
                    href="/systems">My systems</a>
            }
            <div style={{ marginLeft: "auto" }} >
                <a className={"btn btn-secondary " + (this.props.viewName === "profile" ? "active" : "")}
                    href="/profile" style={{ marginRight: "0.5em", backgroundColor: "#402E32", borderColor: "#402E32" }}>
                    {this.props.loggedInUsername}
                </a>
                <a className="btn btn-hover" style={{ marginLeft: "auto", border: "solid 1px" }} onClick={logout}>Logout</a>
            </div>
        </div>;
    }
}