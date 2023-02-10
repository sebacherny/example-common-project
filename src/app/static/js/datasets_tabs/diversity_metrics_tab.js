'use strict';

class DiversityMetricsTab extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        if (this.props.datasetDataForYear == null || this.props.selectedTab == null) {
            return <div></div>;
        }

        const overviewValues = this.props.datasetDataForYear['metric_graphs'][this.props.selectedDiversityMetric] != null ?
            this.props.datasetDataForYear['metric_graphs'][this.props.selectedDiversityMetric]['overview_values'] :
            [];

        return <div style={{ height: '100%', display: 'flex' }}>
            <div style={{ border: 'solid 1px', width: '70%', height: '100%' }}>
                <div style={{ width: '100%', height: '100%' }}>
                    <select value={this.props.selectedDiversityMetric}
                        onChange={(e) => this.props.setSelectedDiversityMetric(e.target.value)}>
                        {this.props.diversityMetricOptions.map((metric, idx) =>
                            <option
                                key={idx} value={metric}>
                                {metric}
                            </option>
                        )}
                    </select>
                    <br />
                    <div style={{ textAlign: "center", marginTop: '5px' }}>
                        <label>
                            {this.props.datasetDataForYear['metric_graphs'][this.props.selectedDiversityMetric] != null ?
                                this.props.datasetDataForYear['metric_graphs'][this.props.selectedDiversityMetric]['top_industries']['title'] :
                                '-No data for ' + this.props.selectedDiversityMetric + '-'}
                        </label>
                        <div className="mytooltip">
                            <i style={{ marginLeft: '10px' }} className="fa fa-info">
                            </i>
                            <span className="mytooltiptext" >Top industries based on data from {this.props.companiesCount} companies</span>
                        </div>
                        <br />
                        <label style={{ fontWeight: 'normal', fontSize: 'small' }}>
                            {this.props.datasetDataForYear['metric_graphs'][this.props.selectedDiversityMetric] != null ?
                                this.props.datasetDataForYear['metric_graphs'][this.props.selectedDiversityMetric]['top_industries']['graph_label'] :
                                ''
                            }
                        </label>
                    </div>
                    <div style={{ display: this.props.datasetDataForYear['metric_graphs'][this.props.selectedDiversityMetric] != null ? 'block' : 'none' }}>
                        <canvas id="top_industries" style={{ height: '600px' }}></canvas>
                    </div>
                    <br />
                </div>
                <div style={{
                    textAlign: "center", marginTop: '5px', width: '100%',
                    display: this.props.datasetDataForYear['metric_graphs'][this.props.selectedDiversityMetric] != null ? 'block' : 'none'
                }}>
                    <label>Heat map of {this.props.selectedDiversityMetric}</label>
                    <div className="mytooltip">
                        <i style={{ marginLeft: '10px' }} className="fa fa-info">
                        </i>
                        <span className="mytooltiptext" >Heat map by company headquarter location based on data from {this.props.companiesCount} companies</span>
                    </div>
                    <div id="regions_div" style={{}}></div>
                </div>
            </div>
            <RightColumnValuesDisplay
                title=""
                allowSelect={true}
                headersToDownload={["Company", this.props.selectedDiversityMetric]}
                csvTitle={"Top " + this.props.selectedTopCompaniesNumber + " Companies for metric " + this.props.selectedDiversityMetric + " for period " + this.props.selectedYear}
                showInformationModal={this.props.showInformationModal}
                setShowInformationModal={this.props.setShowInformationModal}
                selectedTopCompaniesNumber={this.props.selectedTopCompaniesNumber}
                setSelectedTopCompaniesNumber={this.props.setSelectedTopCompaniesNumber}
                textAndValueList={overviewValues.slice(0, this.props.selectedTopCompaniesNumber).map((value_and_company, idx) => [value_and_company[1] + ':', value_and_company[0] + '%'])}
                maxNumberForSelect={overviewValues.length}
                tooltip={'Top companies based on data from ' +
                    this.props.companiesCount +
                    ' companies'}
            />
        </div >;
    }
}