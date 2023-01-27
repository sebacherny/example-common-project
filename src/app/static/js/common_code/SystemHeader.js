'use strict';

class SystemHeader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        if (this.props.systemData == null) {
            return <div></div>;
        }

        return <div style={{
            display: "flex", flexDirection: "row",
            maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
            padding: "1em"
        }} className="shadow">
            <div>
                <label>System Location: {this.props.systemData.location_string}</label>
                <br />
                <label>System Name: {this.props.systemData.name}</label>
                <br />
                <label>System ID: {this.props.systemData.monitor_id}</label>
                <br />
                <label>Installation date: {this.props.systemData.installation_date}</label>
                <br />
                <label>Status: {this.props.systemData.status}</label>
                <br />
            </div>
            {!this.props.is_admin &&
                <div style={{ marginLeft: "auto", display: "grid" }}>
                    <a style={{ border: "solid 1px" }} className={"btn btn-hover " + (this.props.is_system_view ? "btn-hover-active" : "")} href={"/systems/" + this.props.systemData.id + "/"}>View/Add arrays</a>
                    <a style={{ border: "solid 1px" }} className={"btn btn-hover " + (this.props.is_dashboard_view ? "btn-hover-active" : "")} href={"/systems/" + this.props.systemData.id + "/dashboard"}>
                        Dashboard
                    </a>
                </div>
            }
        </div>;
    }
}