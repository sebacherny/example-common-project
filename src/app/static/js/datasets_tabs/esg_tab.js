'use strict';

class ESGTab extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        if (this.props.datasetData == null || this.props.selectedTab == null) {
            return <div></div>
        }

        return <div>

            <div style={{ display: 'flex' }}>
                <div style={{ border: 'solid 1px', marginTop: '5px', width: '70%' }} >
                    <div style={{ textAlign: "center", marginTop: '5px' }}>
                        <label>{this.props.datasetData[this.props.selectedTab][this.props.selectedYear]['top_categories']['title']}</label>
                        <div className="mytooltip">
                            <i style={{ marginLeft: '10px' }} className="fa fa-info">
                            </i>
                            <span className="mytooltiptext" >{this.props.datasetData[this.props.selectedTab][this.props.selectedYear]['top_categories']['tooltip']}</span>
                        </div>
                    </div>
                    <canvas id="top_categories"
                        style={{ width: "100%", maxWidth: "700px" }}></canvas>
                    <br />
                    <div style={{ textAlign: "center", marginTop: '5px' }}>
                        <label>
                            {this.props.datasetData[this.props.selectedTab][this.props.selectedYear]['bar_graph_esg_tab_top_5_companies']['title']}
                        </label>
                        <div className="mytooltip">
                            <i style={{ marginLeft: '10px' }} className="fa fa-info">
                            </i>
                            <span className="mytooltiptext" >{this.props.datasetData[this.props.selectedTab][this.props.selectedYear]['bar_graph_esg_tab_top_5_companies']['tooltip']}</span>
                        </div>
                    </div>
                    <div id="bar_graph_esg_tab_top_5_companies"
                        style={{
                            width: "100%",
                            textAlign: "center", marginTop: '5px'
                        }}></div>

                </div>
                <RightColumnValuesDisplay
                    title={(this.props.selectedTab === 'environment' ? 'Environmental' : this.props.selectedTab.charAt(0).toUpperCase() + this.props.selectedTab.substring(1)) + " Spending"}
                    headersToDownload={["Subcategory", "Value (usd)"]}
                    csvTitle={this.props.selectedTab + " Spending for period " + this.props.selectedYear}
                    showInformationModal={this.props.showInformationModal}
                    setShowInformationModal={this.props.setShowInformationModal}
                    textAndValueList={
                        [["Total:",
                            "$" + addCommas(this.props.datasetData[this.props.selectedTab][this.props.selectedYear]['overview_values']) + ' M',
                            true,
                        ]].concat(
                            this.props.datasetData[this.props.selectedTab][this.props.selectedYear]['csr_grouped_by_categories'].map(
                                (category, idx) => [category.description + ':', '$' + addCommas(category.value) + ' M'])
                        )
                    }
                    tooltip={this.props.datasetData[this.props.selectedTab][this.props.selectedYear]['overall_spending_tooltip']}
                />
            </div>
        </div >;
    }
}