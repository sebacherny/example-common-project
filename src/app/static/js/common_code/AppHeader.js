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
            width: "50%",
            marginTop: "3em",
            marginBottom: "3em"
        }}>
            <img src="/static/images/logo.png" alt="" style={{
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
                width: "30%",
                borderRadius: "2%"
            }} />
            <h2 style={{
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "center",
                color: "#402E32"
            }}></h2>
        </div>;
    }
}