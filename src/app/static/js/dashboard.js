'use strict';
const e = React.createElement;


function App() {

  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [datasetData, setDatasetData] = React.useState(null);
  const [userInfo, setUserInfo] = React.useState(null);
  const [graphType, setGraphType] = React.useState('bar');
  const [selectedTab, setSelectedTab] = React.useState('homeTab');
  // 'overviewTab', 'environment', 'governance', 'social', 'diversity'
  const [heatMapFilter, setHeatMapFilter] = React.useState('overviewTab');
  const [overviewIndustriesFilter, setOverviewIndustriesFilter] = React.useState('overviewTab');
  const [selectedYear, setSelectedYear] = React.useState(null);
  const [yearOptions, setYearOptions] = React.useState([]);
  const [selectedDiversityMetric, setSelectedDiversityMetric] = React.useState('');
  const [diversityMetricOptions, setDiversityMetricOptions] = React.useState([]);
  const [selectedTopCompaniesNumber, setSelectedTopCompaniesNumber] = React.useState(10);
  const [showInformationModal, setShowInformationModal] = React.useState(false);
  const [tabSelectedInformationModal, setTabSelectedInformationModal] = React.useState('table');

  const spreadsheetId = getSpreadsheetId();

  const getData = () => {
    add_loading(window.document.body);
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    get_user_data_api((data) => setUserInfo(data.data));
    get_spreadsheet_dashboard_api(spreadsheetId, (data) => {
      const selectedyearOption = data.data.year_options[0];
      createTopIndustriesSpendingGraph(data.data, 'overviewTab', 'overviewTab', selectedyearOption);
      drawESGdonut(data.data, selectedyearOption);
      setYearOptions(data.data.year_options);
      setSelectedYear(selectedyearOption);
      setDiversityMetricOptions(data.data['diversity'][selectedyearOption]['metric_options'])
      setSelectedDiversityMetric(data.data['diversity'][selectedyearOption]['metric_options'][0]);
      setDatasetData(data.data);
      remove_loading();
    });
  };

  const sendQuestion = () => {
    const text = document.querySelector("#question_textarea").value;
    if (!text) {
      alert("Message cannot be empty");
      return;
    }
    document.querySelector("#ask_question_btn").setAttribute("disabled", "true");
    ask_question_api(text, datasetData.id, () => {
      Swal.fire({
        title: 'Message sent!',
        text: "The admin will read your message and answer via email",
        icon: 'success',
        confirmButtonColor: "#434575",
      });
      document.querySelector("#question_textarea").value = "";
      document.querySelector("#ask_question_btn").removeAttribute("disabled");
    },
      () => {
        Swal.fire({
          title: 'There was an error',
          text: "Try again",
          icon: 'error',
          timer: 2000,
        });
        document.querySelector("#ask_question_btn").removeAttribute("disabled");
      },
    );
  };

  const constructVerticalBarGraph = (name, currentDatasetData) => {
    if (document.getElementById(name) != null && currentDatasetData != null && currentDatasetData[name] != null) {
      if (window.barGraphs == undefined) {
        window.barGraphs = {};
      }
      if (window.barGraphs[name] != undefined) {
        window.barGraphs[name].destroy();
      }
      window.barGraphs[name] = new Chart(name, {
        type: "bar",
        data: {
          labels: currentDatasetData[name]['x_values'],
          datasets: [
            {
              backgroundColor: currentDatasetData[name]['background_color'] || '#BA68C8',
              data: currentDatasetData[name]['y_values'],
              //label: currentDatasetData[name]['graph_label'] ||
              //  'Total = ' + addCommas(currentDatasetData[name]['total_y_sum']) + ' M',
            },
          ]
        },
        options: {
          scales: {
            yAxes: [{
              display: true,
              ticks: {
                beginAtZero: true,
                stepSize: 5,
              }
            }],
          },
          legend: { display: false },
          title: {
            display: false,
            // text: currentDatasetData[name]['title']
          }
        }
      });
    }
  }

  const createTopIndustriesSpendingGraph = (currentCollecionData, currentTab, categoryFilter, currentYear) => {
    setTimeout(() => {
      if (currentTab === 'overviewTab') {
        constructVerticalBarGraph('bar_graph_industry_total_usds', currentCollecionData[categoryFilter][currentYear]);
      } else if (currentTab === 'diversity') {
        constructVerticalBarGraph('top_industries',
          currentCollecionData[currentTab][currentYear]['metric_graphs'][selectedDiversityMetric]);
      }
    }, 100);
  }

  const changeOverviewIndustriesFilter = (newIndustriesFilter) => {
    createTopIndustriesSpendingGraph(datasetData, selectedTab, newIndustriesFilter, selectedYear);
    setOverviewIndustriesFilter(newIndustriesFilter);
  }

  const changeDiversityMetricFilter = (newMetric) => {
    constructVerticalBarGraph('top_industries',
      datasetData[selectedTab][selectedYear]['metric_graphs'][newMetric]);
    setSelectedDiversityMetric(newMetric);
  }

  const changeYearFilter = (newYear) => {
    if (selectedTab === 'diversity') {
      constructVerticalBarGraph('top_industries',
        datasetData[selectedTab][newYear]['metric_graphs'][selectedDiversityMetric]);
    }
    setSelectedYear(newYear);
  }

  const drawESGdonut = (currentData, currentYear) => {
    setTimeout(() => constructDonutGraph('donut_graph_esg_category', currentData['overviewTab'][currentYear]),
      100);
  }

  const constructHorizontalBarGraph = (name, currentDatasetData) => {
    if (document.getElementById(name) && currentDatasetData != null) {
      var options = {
        series: [{
          name: '',
          data: currentDatasetData[name]['y_values'].map((y, idx) => {
            return {
              x: currentDatasetData[name]['x_values'][idx],
              y: currentDatasetData[name]['y_values'][idx],
              fillColor: currentDatasetData[name]['background_color'],
            }
          }),
        }],
        chart: {
          type: 'bar',
          height: 350
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: true,
          }
        },
        dataLabels: {
          enabled: false
        },
        yaxis: {
          labels: {
            formatter: function (value) {
              if (value === '') {
                return '';
              }
              if (isNaN(value)) {
                return value;
              }
              return '$' + addCommas(value) + ' M';
            }
          }
        },
        //xaxis: {
        //  categories: currentDatasetData[name]['x_values'],
        //}
      };

      if (window.horizontalBarGraph != undefined) {
        window.horizontalBarGraph.destroy();
      }

      window.horizontalBarGraph = new ApexCharts(document.querySelector("#" + name), options);
      window.horizontalBarGraph.render();
      /*
      var data = [{
        type: 'bar',
        x: currentDatasetData[name]['y_values'],
        y: currentDatasetData[name]['x_values'].map(company => company.toString().split(' ').join('<br />')),
        orientation: 'h',
        marker: {
          color: currentDatasetData[name]['background_color'] || '#BA68C8',
          width: 1
        },
      }];

      Plotly.newPlot(name, data, { 'title': '' });
      */

    }
  }

  if (datasetData != null &&
    document.getElementById('bar_graph_esg_tab_top_5_companies') != null &&
    (selectedTab === 'environment' || selectedTab === 'governance' || selectedTab === 'social')
  ) {
    // constructVerticalBarGraph('bar_graph_esg_tab_top_5_companies', datasetData[selectedTab]);
    constructHorizontalBarGraph('bar_graph_esg_tab_top_5_companies', datasetData[selectedTab][selectedYear]);
  }


  const ask_for_graph_and_load = () => {
    var data = {};
    if (graphType == 'bar') {
      const barXfield = document.getElementById('select_barXfield').value;
      const barYfield = document.getElementById('select_barYfield').value;
      data = { graphType, barXfield, barYfield };
    } else {
      const donutCategory = document.getElementById('select_donutCategory').value;
      const donutValue = document.getElementById('select_donutValue').value;
      data = { graphType, donutCategory, donutValue };
    }
    do_get_custom_graph_api(spreadsheetId, data, (graphDict) => {
      let newDatasetData = datasetData;
      newDatasetData['custom_graph'] = graphDict.data;
      setDatasetData(newDatasetData);
      if (graphType == 'bar') {
        if (window.donutGraphs['custom_graph'] != undefined) {
          window.donutGraphs['custom_graph'].destroy();
        }
        constructVerticalBarGraph('custom_graph', newDatasetData);
      } else {
        if (window.barGraphs['custom_graph'] != undefined) {
          window.barGraphs['custom_graph'].destroy();
        }
        constructDonutGraph('custom_graph', newDatasetData);
      }
      document.getElementById('custom_graph').style.display = 'block';
    })
  }

  const changeBroadCategory = () => {
    if (selectedTab !== 'homeTab') {
      constructVerticalBarGraph('top_categories', datasetData[selectedTab][selectedYear]);
    }
  }
  if (datasetData != null) {
    changeBroadCategory();
  }

  const clickOnTabButton = (tabName) => {
    setSelectedTab(tabName);
    if (tabName === 'overviewTab') {
      createTopIndustriesSpendingGraph(datasetData, 'overviewTab', overviewIndustriesFilter, selectedYear);
      drawESGdonut(datasetData, selectedYear);
    } else if (tabName === 'diversity') {
      createTopIndustriesSpendingGraph(datasetData, 'diversity', null, selectedYear);
    }
    if (tabName === 'diversity') {
      const tabYearOptions = datasetData.year_options.filter(opt => opt !== 'ALL').map(yy => yy.toString());
      if (tabYearOptions.length > 0) {
        if (!tabYearOptions.includes(selectedYear)) {
          setSelectedYear(tabYearOptions[0]);
        }
        setYearOptions(tabYearOptions);
      }
    } else {
      setYearOptions(datasetData.year_options);
    }
  }
  const container = document.getElementById('regions_div');
  if (datasetData != null && container != null && container != undefined) {
    google.charts.load('current', {
      'packages': ['geochart'],
    });
    google.charts.setOnLoadCallback(drawRegionsMap);

    function drawRegionsMap() {
      let dataArray = [['State', 'Popularity']];
      var heatMapData = datasetData[heatMapFilter][selectedYear]['heat_map'];
      if (selectedTab === 'diversity') {
        if (datasetData['diversity'][selectedYear]['metric_graphs'][selectedDiversityMetric] != null) {
          heatMapData = datasetData['diversity'][selectedYear]['metric_graphs'][selectedDiversityMetric]['heat_map'];
        } else {
          heatMapData = { 'states': [], 'values': [], 'scale_colors': [] };
        }
      }
      for (var i = 0; i < heatMapData['states'].length; i++) {
        const state = heatMapData['states'][i];
        const value = heatMapData['values'][i];
        dataArray.push(['US-' + state, value]);
      }
      var data = google.visualization.arrayToDataTable(dataArray);

      var options = {
        'region': 'US',
        'colors': heatMapData['scale_colors'],
        'dataMode': 'markers',
        'resolution': 'provinces'
      };

      var chart = new google.visualization.GeoChart(container);

      chart.draw(data, options);
    }
  }

  React.useEffect(() => {
    getData();
  }, []);

  getLoggedInUsername((username) => { setLoggedInUsername(username) });
  const isAdminBool = userInfo && userInfo.is_admin ? true : false;

  window.addEventListener('keyup', (ev) => {
    doIfEscapePressed(ev, () => { setShowInformationModal(false); })
  }, false);

  if (selectedTab === 'diversity') {
    const overviewValues = datasetData[selectedTab][selectedYear]['metric_graphs'][selectedDiversityMetric] != null ?
      datasetData[selectedTab][selectedYear]['metric_graphs'][selectedDiversityMetric]['overview_values'] :
      [];
    if (overviewValues.length && selectedTopCompaniesNumber > overviewValues.length) {
      setSelectedTopCompaniesNumber(overviewValues.length);
    }
  }

  return (
    <div>
      <AppHeader />
      <UserHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true}
        is_admin={isAdminBool}
        pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
        tickets_count={userInfo != null ? userInfo.tickets_count : 0}
        is_client_admin={userInfo != null ? userInfo.is_client_admin : false}
      />
      <DatasetHeader
        datasetData={datasetData}
        is_admin={isAdminBool}
      />
      <InformationModal
        showModal={showInformationModal} setShowModal={setShowInformationModal}
        setTabSelected={setTabSelectedInformationModal} tabSelected={tabSelectedInformationModal}
        tableElement={
          <table style={{ border: 'solid 1px', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ border: 'solid 1px' }}>Key</th>
                <th style={{ border: 'solid 1px' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: 'solid 1px' }}>Key 1</td>
                <td style={{ border: 'solid 1px' }}>Value 1</td>
              </tr>
            </tbody>
          </table>
        }
      />
      <div className='container_div'>
        {datasetData != null &&
          <div>
            <div style={{ display: "flex", marginRight: '5px', marginBottom: '20px' }}>
              <button type="button"
                className={"btn " + (selectedTab == 'homeTab' ? 'tabSelected' : '')}
                id="homeTabBtn"
                style={{
                  marginRight: '20px',
                  color: 'black', borderColor: 'black', border: '3px solid'
                }}
                onClick={() => { clickOnTabButton('homeTab') }}>Home</button>
              <button type="button"
                className={"btn " + (selectedTab == 'overviewTab' ? 'tabSelected' : '')}
                id="overviewTabBtn"
                style={{
                  marginRight: '20px',
                  color: '#4C22B3', borderColor: '#4C22B3', border: '3px solid'
                }}
                onClick={() => { clickOnTabButton('overviewTab') }}>CSR Overview</button>
              <button type="button"
                className={"btn " + (selectedTab == 'environment' ? 'tabSelected' : '')}
                id="environmentBtn"
                style={{
                  marginRight: '20px',
                  color: '#3D7345', borderColor: '#3D7345', border: '3px solid'
                }}
                onClick={() => { clickOnTabButton('environment') }}>Environment</button>
              <button type="button"
                className={"btn " + (selectedTab == 'social' ? 'tabSelected' : '')}
                id="socialBtn"
                style={{
                  marginRight: '20px',
                  color: '#FFB43F', borderColor: '#FFB43F', border: '3px solid'
                }}
                onClick={() => { clickOnTabButton('social') }}>Social</button>
              <button type="button"
                className={"btn " + (selectedTab == 'governance' ? 'tabSelected' : '')}
                id="governanceBtn"
                style={{
                  marginRight: '20px',
                  color: '#0533FF', borderColor: '#0533FF', border: '3px solid'
                }}
                onClick={() => { clickOnTabButton('governance') }}>Governance</button>
              <button type="button"
                className={"btn " + (selectedTab == 'diversity' ? 'tabSelected' : '')}
                id="diversityBtn"
                style={{
                  marginRight: '20px',
                  color: '#FF4114', borderColor: '#FF4114', border: '3px solid'
                }}
                onClick={() => { clickOnTabButton('diversity') }}>Diversity Metrics</button>
            </div>
            {
              selectedTab === 'homeTab' ? null :
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ marginRight: '1em' }}>Period: </label>
                  <select value={selectedYear}
                    onChange={(e) => {
                      const selectedyearOption = e.target.value;
                      createTopIndustriesSpendingGraph(datasetData, 'overviewTab', overviewIndustriesFilter, selectedyearOption);
                      drawESGdonut(datasetData, selectedyearOption);
                      changeYearFilter(selectedyearOption);
                    }}>
                    {yearOptions.map((year, idx) => <option key={idx} value={year}>{year}</option>)}
                  </select>
                </div>
            }
            {datasetData != null && selectedTab === 'homeTab' &&
              <HomeTab
                datasetData={datasetData}
              />
            }
            {datasetData != null && selectedTab === 'overviewTab' &&
              <CsrOverviewTab
                datasetData={datasetData}
                selectedTab={selectedTab}
                selectedYear={selectedYear}
                heatMapFilter={heatMapFilter} setHeatMapFilter={setHeatMapFilter}
                overviewIndustriesFilter={overviewIndustriesFilter} changeOverviewIndustriesFilter={changeOverviewIndustriesFilter}
                showInformationModal={showInformationModal}
                setShowInformationModal={setShowInformationModal}
              />
            }
            {datasetData != null &&
              (selectedTab === 'environment' || selectedTab === 'governance' || selectedTab === 'social') &&
              <ESGTab
                datasetData={datasetData}
                selectedTab={selectedTab}
                selectedYear={selectedYear}
                showInformationModal={showInformationModal}
                setShowInformationModal={setShowInformationModal}
              />
            }
            {datasetData != null && selectedTab === 'diversity' &&
              <DiversityMetricsTab
                datasetDataForYear={datasetData[selectedTab][selectedYear]}
                selectedTab={selectedTab}
                selectedYear={selectedYear}
                selectedDiversityMetric={selectedDiversityMetric}
                setSelectedDiversityMetric={changeDiversityMetricFilter}
                diversityMetricOptions={diversityMetricOptions}
                setDiversityMetricOptions={setDiversityMetricOptions}
                selectedTopCompaniesNumber={selectedTopCompaniesNumber}
                setSelectedTopCompaniesNumber={setSelectedTopCompaniesNumber}
                showInformationModal={showInformationModal}
                setShowInformationModal={setShowInformationModal}
                companiesCount={datasetData['companies_count_by_year'][selectedYear]}
              />
            }
            {datasetData != null && false && // FALSE HERE TO AVOID SHOWING THIS
              <div style={{ border: 'solid 1px', marginTop: '5px' }} >
                <label style={{ marginLeft: '5px' }}>Type of graph:</label>
                <select style={{ marginLeft: '5px' }} value={graphType} onChange={(e) => setGraphType(e.target.value)}>
                  <option value="bar">Bar graph</option>
                  <option value="donut">Donut graph</option>
                </select>
                <br />
                {graphType == 'bar' &&
                  <div>
                    <label style={{ marginLeft: '5px' }}>X field for bar graph:</label>
                    <select style={{ marginLeft: '5px' }} id="select_barXfield">
                      {datasetData['all_fields'].map((field, idx) =>
                        <option key={idx} value={field}>{field}</option>
                      )}
                    </select>
                    <br />
                    <label style={{ marginLeft: '5px' }}>Y field for bar graph:</label>
                    <select style={{ marginLeft: '5px' }} id="select_barYfield">
                      {datasetData['all_fields'].map((field, idx) =>
                        <option key={idx} value={field}>{field}</option>
                      )}
                    </select>
                    <br />
                  </div>
                }
                {graphType == 'donut' &&
                  <div>
                    <label style={{ marginLeft: '5px' }}>Category for donut:</label>
                    <select style={{ marginLeft: '5px' }} id="select_donutCategory">
                      {datasetData['all_fields'].map((field, idx) =>
                        <option key={idx} value={field}>{field}</option>
                      )}
                    </select>
                    <br />
                    <label style={{ marginLeft: '5px' }}>Values to aggregate:</label>
                    <select style={{ marginLeft: '5px' }} id="select_donutValue">
                      {datasetData['all_fields'].map((field, idx) =>
                        <option key={idx} value={field}>{field}</option>
                      )}
                    </select>
                    <br />
                  </div>
                }
                <button style={{
                  backgroundColor: "#434575", borderColor: "#434575",
                  marginLeft: '5px'
                }}
                  className="btn btn-primary"
                  onClick={() => ask_for_graph_and_load()}>Get graph</button>
                <canvas id="custom_graph"
                  style={{
                    width: "100%", maxWidth: "700px",
                    display: 'none'
                  }}></canvas>
                <br />
              </div>
            }

            {!isAdminBool &&
              <div style={{ textAlign: "center", marginTop: '20px' }}>
                <label>Submit a Request</label>
                <br />
                <textarea id="question_textarea" style={{ width: "50%", height: "100px" }}></textarea>
                <br />
                <button id="ask_question_btn" style={{ backgroundColor: "#434575", borderColor: "#434575" }} className="btn btn-primary" onClick={() => { sendQuestion(); }}>Send question</button>
              </div>
            }
          </div>
        }
      </div>
    </div >
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
