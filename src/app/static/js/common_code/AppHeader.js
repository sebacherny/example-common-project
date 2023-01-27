'use strict';

class AppHeader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return <div style={{
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            width: "50%"
        }}>
            <img src="/static/images/logo.png" alt="" style={{
                display: "block",
                marginLeft: "auto",
                marginRight: "auto"
            }} />
            <h2 style={{
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "center",
                color: "#402E32"
            }}>Solar Energy Network</h2>
        </div>;
    }
}