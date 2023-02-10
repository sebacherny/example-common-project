'use strict';

class RightColumnValuesDisplay extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        const downloadSpreadsheetFromValues = (textAndValueList) => {
            const headers = this.props.headersToDownload;
            var rows = [];
            for (const textAndValue of textAndValueList) {
                rows.push([textAndValue[0], textAndValue[1]]);
            }
            downloadCsvFromHeadersAndRows(headers, rows, this.props.csvTitle + '.csv');
        }

        return <div style={{ width: '29%', marginLeft: '1%' }}>
            <div style={{ textAlign: 'center' }}>
                {
                    this.props.allowSelect ?
                        <label>Top
                            <select value={this.props.selectedTopCompaniesNumber}
                                onChange={(e) => this.props.setSelectedTopCompaniesNumber(e.target.value)}>
                                {[...Array(this.props.maxNumberForSelect).keys()].map(idx => (idx + 1 > 2 || this.props.maxNumberForSelect < 3) ? <option key={idx} value={idx + 1}>{idx + 1}</option> : null)}
                            </select>
                            Companies
                        </label> : <label>{this.props.title}</label>
                }
                <button onClick={() => downloadSpreadsheetFromValues(this.props.textAndValueList)} className="btn"><i className="fa fa-download"></i></button>
                <div className="mytooltip">
                    <i style={{ marginLeft: '10px' }} className="fa fa-info">
                    </i>
                    <span className="mytooltiptext" >{this.props.tooltip}</span>
                </div>
            </div>
            <br />
            {this.props.textAndValueList.map((textAndValue, idx) =>
                <div key={idx}>
                    <div style={{ display: 'flex' }}>
                        <div>
                            <label style={textAndValue[2] === true ? {} : { fontWeight: 'normal' }}>{textAndValue[0]}</label>
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: 'auto', marginRight: '0px' }}>
                            <label style={textAndValue[2] ? {} : { fontWeight: 'normal' }}>{textAndValue[1]}</label>
                        </div>
                    </div>
                    <br />
                </div>
            )}
        </div>;
    }
}