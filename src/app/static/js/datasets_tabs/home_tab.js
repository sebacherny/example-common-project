'use strict';

class HomeTab extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return <div style={{ height: '100%' }}>
            <div>
                <h4 style={{ textDecoration: 'underline' }}>Center Forward Corporate CSR Spending Database Dashboard</h4>
                <label className="label_home_tab">
                    This dashboard is based on a database of U.S. Fortune 500 firms.
                    It provides data regarding annual corporate spending in the areas of Corporate
                    social responsibility (CSR), specifically in the categories of environmental,
                    social, and governance (ESG) spending.
                    The data was collected from publicly available corporate CSR and ESG reports voluntarily
                    released by the companies as well as a survey administered to company officials.
                    Currently, annual history for most items is available from 2020-2021 but data for
                    some items may go back further. Below is a comprehensive list of data categories,
                    subcategories, and subcategory descriptions.
                    Each dollar value reported on areas related to ESG were recorded and categorized
                    according to the categories below. The data contains only reported annual spending,
                    so any pledges or multi-year spending is not reported. All spending data was
                    recorded in millions of USD.
                </label>
                <br />
                <br />
                {
                    this.props.datasetData['all_subcategories_information'].map((infoMap, idx) =>
                        <div key={idx} className='esg_div_home_tab'>
                            {infoMap['title'] === 'Diversity Metrics' ?
                                <label style={{ textAlign: 'left', fontWeight: 'normal' }}>
                                    We also collected data regarding the level of diversity reported by companies.
                                    Below is the list of the diversity metrics we collected.
                                </label>
                                :
                                null
                            }
                            <h5 style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{infoMap['title']}</h5>
                            <table className="table table-hover caption-top">
                                {idx === 0 ?
                                    <thead>
                                        <tr>
                                            <th>Sub-Category</th>
                                            <th>Sub-Category Description</th>
                                        </tr>
                                    </thead>
                                    : null}
                                <tbody>
                                    {infoMap['subcategories'].map((subcategory, subcategoryIdx) =>
                                        <tr key={subcategoryIdx}>
                                            <td>{subcategory['name']}</td>
                                            {
                                                infoMap['title'] === 'Diversity Metrics' ?
                                                    null
                                                    :
                                                    <td>{subcategory['description']}</td>
                                            }
                                        </tr>
                                    )
                                    }
                                </tbody>
                            </table>
                            <br />
                            <br />
                        </div>
                    )
                }
                <div>
                    <label style={{ fontWeight: 'normal' }}>
                        Currently, the data covers {this.props.datasetData['companies_count_by_year'][2020]} firms in 2020
                        and {this.props.datasetData['companies_count_by_year'][2021]} firms in 2021.
                        Survey questions asked company officials to report company annual spending in each
                        of the categories as well as the diversity metrics.
                    </label>
                </div>
            </div>
        </div>;
    }
}