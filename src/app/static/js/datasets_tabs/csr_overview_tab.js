'use strict';

class CsrOverviewTab extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        if (this.props.datasetData == null || this.props.selectedTab == null) {
            return <div></div>;
        }

        return <div style={{ height: '100%' }}>
            <div style={{ display: 'flex' }}>
                <div style={{ border: 'solid 1px', width: '70%' }}>
                    <select value={this.props.overviewIndustriesFilter}
                        onChange={(e) => this.props.changeOverviewIndustriesFilter(e.target.value)}>
                        <option value='overviewTab'>Total</option>
                        <option value='environment'>Environment</option>
                        <option value='social'>Social</option>
                        <option value='governance'>Governance</option>
                    </select>
                    <br />
                    <div style={{ textAlign: "center", marginTop: '5px' }}>
                        <label>{this.props.datasetData[this.props.overviewIndustriesFilter][this.props.selectedYear]['bar_graph_industry_total_usds']['title']}</label>
                        <div className="mytooltip">
                            <i style={{ marginLeft: '10px' }} className="fa fa-info">
                            </i>
                            <span className="mytooltiptext" >{this.props.datasetData[this.props.overviewIndustriesFilter][this.props.selectedYear]['bar_graph_industry_total_usds']['tooltip']}</span>
                        </div>
                        <br />
                        <label style={{ fontWeight: 'normal', fontSize: 'small' }}>
                            Total = {addCommas(this.props.datasetData[this.props.overviewIndustriesFilter][this.props.selectedYear]['bar_graph_industry_total_usds']['total_y_sum'].toFixed(2)) + ' M'}
                        </label>
                    </div>
                    <canvas id="bar_graph_industry_total_usds" style={{ height: '600px' }}></canvas>
                    <br />
                </div>
                <RightColumnValuesDisplay
                    title="Overall CSR Spending"
                    headersToDownload={["Category", "Value (usd)"]}
                    csvTitle={"Overall Spending for period " + this.props.selectedYear}
                    showInformationModal={this.props.showInformationModal}
                    setShowInformationModal={this.props.setShowInformationModal}
                    textAndValueList={[
                        ["Total:", '$' + addCommas(this.props.datasetData['overviewTab'][this.props.selectedYear]['overview_values']) + ' M', true],
                        ["Environment:", '$' + addCommas(this.props.datasetData['environment'][this.props.selectedYear]['overview_values']) + ' M', false],
                        ["Social:", '$' + addCommas(this.props.datasetData['social'][this.props.selectedYear]['overview_values']) + ' M', false],
                        ["Governance:", '$' + addCommas(this.props.datasetData['governance'][this.props.selectedYear]['overview_values']) + ' M', false],
                    ]}
                    tooltip={"Overall spending based on data from " + this.props.datasetData['companies_count_by_year'][this.props.selectedYear] + " companies"}
                />
            </div>
            <div style={{ display: 'flex' }}>
                <div style={{ textAlign: "center", marginTop: '5px', width: '50%' }}>
                    <div>
                        <label>Heat map for percentual CSR spending</label>
                        <div className="mytooltip">
                            <i style={{ marginLeft: '10px' }} className="fa fa-info">
                            </i>
                            <span className="mytooltiptext" >Heat map of CSR spending by company headquarter location. Based on data from {this.props.datasetData['companies_count_by_year'][this.props.selectedYear]} companies</span>
                        </div>
                    </div>
                    <select value={this.props.heatMapFilter}
                        onChange={(e) => this.props.setHeatMapFilter(e.target.value)}>
                        <option value='overviewTab'>Total</option>
                        <option value='environment'>Environment</option>
                        <option value='social'>Social</option>
                        <option value='governance'>Governance</option>
                    </select>
                    <div id="regions_div" style={{}}></div>
                </div>
                <div style={{
                    textAlign: "center", border: 'solid 1px', marginTop: '5px',
                    width: '50%'
                }}>
                    <label>{this.props.datasetData['overviewTab'][this.props.selectedYear]['donut_graph_esg_category']['title']}</label>
                    <div className="mytooltip">
                        <i style={{ marginLeft: '10px' }} className="fa fa-info">
                        </i>
                        <span className="mytooltiptext" >{this.props.datasetData["overviewTab"][this.props.selectedYear]['donut_graph_esg_category']['tooltip']}</span>
                    </div>
                    <canvas id="donut_graph_esg_category" style={{}}></canvas>
                    <br />
                </div>
            </div>
        </div >;
    }
}