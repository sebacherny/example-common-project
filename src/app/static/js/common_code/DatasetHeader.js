'use strict';

class DatasetHeader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        if (this.props.datasetData == null) {
            return <div></div>;
        }

        const downloadCsvFromHeader = () => {
            if (this.props.is_admin) {
                downloadCsv(this.props.datasetData.id, this.props.datasetData.name);
            }
        }

        return <div className='container_div' style={{
            display: "flex", flexDirection: "row",
        }}>
            <div>
                <label>Rows: {this.props.datasetData.rows_count}</label>
                <br />
                <label>Last updated: {this.props.datasetData.last_updated}</label>
                <br />
                <a className="btn btn-primary" href={'/datasets/' + this.props.datasetData.id + '/view-rows'}
                    style={{ display: "none", marginTop: "1em", marginBottom: "1em", backgroundColor: "#434575", borderColor: "#434575" }}>View rows</a>
                <br style={{ display: "none" }} />
                <button className="btn btn-primary" onClick={downloadCsvFromHeader}
                    style={{
                        marginTop: "1em", marginBottom: "1em",
                        backgroundColor: "#434575", borderColor: "#434575",
                        display: this.props.is_admin ? 'block' : 'none'
                    }}
                >Download csv</button>
            </div>
        </div>;
    }
}