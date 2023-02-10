'use strict';
const e = React.createElement;


function App() {

  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [peopleInfo, setPeopleInfo] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [userInfo, setUserInfo] = React.useState(null);
  const [fileLoaded, setFileLoaded] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [industryTypeFiltered, setIndustryTypeFiltered] = React.useState(null);
  const [collegesFiltered, setCollegesFiltered] = React.useState([]);
  const [statesFiltered, setStatesFiltered] = React.useState([]);
  const [yearsFiltered, setYearsFiltered] = React.useState([]);

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    get_user_data_api((data) => setUserInfo(data.data));
    get_sports_students_dataset_api((data) => {
      setPeopleInfo(data.rows);
      displayAllGraphs(data.rows);
    });
  };

  const container = document.getElementById('regions_div');
  const STATE_TO_ABBREVIATION = {
    'Alabama': 'AL',
    'Kentucky': 'KY',
    'Ohio': 'OH',
    'Alaska': 'AK',
    'Louisiana': 'LA',
    'Oklahoma': 'OK',
    'Arizona': 'AZ',
    'Maine': 'ME',
    'Oregon': 'OR',
    'Arkansas': 'AR',
    'Maryland': 'MD',
    'Pennsylvania': 'PA',
    'American Samoa': 'AS',
    'Massachusetts': 'MA',
    'Puerto Rico': 'PR',
    'California': 'CA',
    'Michigan': 'MI',
    'Rhode Island': 'RI',
    'Colorado': 'CO',
    'Minnesota': 'MN',
    'South Carolina': 'SC',
    'Connecticut': 'CT',
    'Mississippi': 'MS',
    'South Dakota': 'SD',
    'Delaware': 'DE',
    'Missouri': 'MO',
    'Tennessee': 'TN',
    'District of Columbia': 'DC',
    'Montana': 'MT',
    'Texas': 'TX',
    'Florida': 'FL',
    'Nebraska': 'NE',
    'Trust Territories': 'TT',
    'Georgia': 'GA',
    'Nevada': 'NV',
    'Utah': 'UT',
    'Guam': 'GU',
    'New Hampshire': 'NH',
    'Vermont': 'VT',
    'Hawaii': 'HI',
    'New Jersey': 'NJ',
    'Virginia': 'VA',
    'Idaho': 'ID',
    'New Mexico': 'NM',
    'Virgin Islands': 'VI',
    'Illinois': 'IL',
    'New York': 'NY',
    'Washington': 'WA',
    'Indiana': 'IN',
    'North Carolina': 'NC',
    'West Virginia': 'WV',
    'Iowa': 'IA',
    'North Dakota': 'ND',
    'Wisconsin': 'WI',
    'Kansas': 'KS',
    'Northern Mariana Islands': 'MP',
    'Wyoming': 'WY',
  };
  if (peopleInfo != null && container != null && container != undefined) {
    google.charts.load('current', {
      'packages': ['geochart'],
    });
    google.charts.setOnLoadCallback(drawRegionsMap);

    function drawRegionsMap() {
      let dataArray = [['State', 'Popularity']];
      var heatMapData = { 'states': [], 'values': [], 'scale_colors': [] };
      var stateToCount = {}
      for (const row of peopleInfo) {
        const state = getStateFromRow(row);
        if (!stateToCount.hasOwnProperty(state)) {
          stateToCount[state] = 0
        }
        stateToCount[state] += 1;
      }
      for (const state of Object.keys(stateToCount)) {
        if (state.length && STATE_TO_ABBREVIATION.hasOwnProperty(state)) {
          const value = stateToCount[state];
          dataArray.push(['US-' + STATE_TO_ABBREVIATION[state], value]);
        }
      }
      var data = google.visualization.arrayToDataTable(dataArray);

      var options = {
        'region': 'US',
        // 'colors': heatMapData['scale_colors'],
        'dataMode': 'markers',
        'resolution': 'provinces'
      };

      var chart = new google.visualization.GeoChart(container);

      chart.draw(data, options);
      document.heatmap = chart;

      document.getElementById("regions_div").onclick = function (evt) {
        var activePoints = chart.getSelection()[0]
        if (activePoints) {
          const stateClicked = dataArray[activePoints['row'] + 1][0].substring(3);
          console.log(stateClicked);
          window.choices_state.removeActiveItems()
          for (const k of Object.keys(STATE_TO_ABBREVIATION)) {
            if (STATE_TO_ABBREVIATION[k] === stateClicked) {
              window.choices_state.setChoiceByValue(k);
            }
          }
          selectStateChange();
        }
      }
    }
  }

  React.useEffect(() => {
    getData();
  }, []);

  getLoggedInUsername((username) => { setLoggedInUsername(username) });
  const isAdminBool = userInfo && userInfo.is_admin ? true : false;

  window.addEventListener('keyup', (ev) => {
    doIfEscapePressed(ev, () => { setShowModal(false); })
  }, false);

  const newPeopleSpreadsheet = () => {
    setError("");
    setShowModal(true);
  };

  var ALL_COLORS = ['#7FFFD4', '#5F9EA0', '#008B8B', '#006400',
    '#BDB76B', '#8FBC8F', '#F0E68C'];
  var GREY_COLOR = '#aaaaaa';
  for (var i = 0; i < 0; i++) {
    const a = parseInt(Math.random() * 150);
    const b = parseInt(Math.random() * 150);
    const c = parseInt(Math.random() * 150);
    ALL_COLORS.push('#' +
      a.toString(16) +
      b.toString(16) +
      c.toString(16));
  }

  const getMajorFromRow = (row) => {
    return row['What did they Study?'] || row['Major'] || row['major'];
  }

  const getIndustryTypeFromRow = (row) => {
    return row['Industry Type'] || row['industry_type'];
  }

  const getNameFromRow = (row) => {
    return row['First Name'] || row['first_name'];
  }

  const getSurnameFromRow = (row) => {
    return row['Last Name'] || row['last_name'];
  }

  const getGraduationYearFromRow = (row) => {
    return row['Year Graduated'] || row['graduation_year'];
  }

  const getTitleFromRow = (row) => {
    return row['Current Title'] || row['title'];
  }

  const getEmployerFromRow = (row) => {
    return row['Current Employer'] || row['employer'];
  }

  const getCollegeFromRow = (row) => {
    return row['What College (Smeal Bellisario etc.)'] || row['College'] || row['college'];
  }

  const getStateFromRow = (row) => {
    return row['State'] || row['state'];
  }

  const getLinkedinFromRow = (row) => {
    return row['LinkedIn Page Link'] || row['linkedin_page'];
  }

  const displayAllGraphs = (jsonData) => {
    displayIndustryTyperDonut(jsonData);
  }

  const displayIndustryTyperDonut = (jsonData) => {
    var industry_type_donut_graph = {};
    for (const row of jsonData) {
      const industry_type = getIndustryTypeFromRow(row);
      if (industry_type) {
        if (!industry_type_donut_graph.hasOwnProperty(industry_type)) {
          industry_type_donut_graph[industry_type] = 0;
        }
        industry_type_donut_graph[industry_type] += 1;
      }
    }
    var x_values = [];
    var y_values = [];
    var colors = [];
    for (const industry_type of Object.keys(industry_type_donut_graph)) {
      x_values.push(industry_type);
      y_values.push(industry_type_donut_graph[industry_type]);
      colors.push(ALL_COLORS[colors.length % ALL_COLORS.length]);
    }
    createIndustryTypeDonutAndConfigureClick(x_values, y_values, colors);
  }

  const createIndustryTypeDonutAndConfigureClick = (x_values, y_values, colors) => {
    constructDonutGraph('industry_type_donut_graph', {
      industry_type_donut_graph: {
        x_values,
        y_values,
        colors
      }
    },
      false);
    // var ctx = document.getElementById("industry_type_donut_graph").getContext("2d");
    var chart = window.donutGraphs["industry_type_donut_graph"];

    document.getElementById("industry_type_donut_graph").onclick = function (evt) {
      var activePoints = chart.getElementsAtEvent(evt);
      if (activePoints.length > 0) {
        var clickedElementindex = activePoints[0]["_index"];
        var label = chart.data.labels[clickedElementindex];
        var value = chart.data.datasets[0].data[clickedElementindex];
        setIndustryTypeFiltered(label);
        var newColors = chart.data.datasets[0].backgroundColor;
        newColors[clickedElementindex] = ALL_COLORS[clickedElementindex % ALL_COLORS.length];
        for (var i = 0; i < chart.data.datasets[0].backgroundColor.length; i++) {
          if (i !== clickedElementindex) {
            newColors[i] = GREY_COLOR;
          }
        }
        createIndustryTypeDonutAndConfigureClick(
          chart.data.labels,
          chart.data.datasets[0].data,
          newColors
        );

        /* other stuff that requires slice's label and value */
      }
    }
  }

  const sortTable = (column_idx, isReverseBool) => {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("myTable");
    switching = true;
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("td")[column_idx].textContent.toLowerCase();
        y = rows[i + 1].getElementsByTagName("td")[column_idx].textContent.toLowerCase();
        var firstContent = x;
        var secondContent = y;
        if (parseFloat(firstContent).toString() === firstContent) {
          firstContent = parseFloat(firstContent);
          secondContent = parseFloat(secondContent);
        }
        if ((isReverseBool === false && firstContent > secondContent) ||
          (isReverseBool === true && firstContent < secondContent) ||
          (y === '' && x !== '')) {
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }

  const actionAfterUpload = (jsonData) => {
    add_loading(window.document.body);
    setPeopleInfo(jsonData);
    displayAllGraphs(jsonData);
    create_sports_students_dataset_api(jsonData, (data) => {
      alert("Added " + data.rows_added + " rows!");
      document.getElementById('myfile').value = null;
      setFileLoaded(false);
      getData();
      remove_loading();
      setShowModal(false);
    }, (errors_data) => {
      remove_loading();
      if (errors_data.show_errors) {
        alert(errors_data['errors'][0]);
      } else {
        alert("Error processing file.");
      }
    });
  }

  const saveNewDataset = (e) => {
    e.preventDefault();
    setError("");
    add_loading(window.document.body);
    const file_input = document.getElementById('myfile');
    const file = file_input.files[0];
    const filename = file.name;
    const extension = filename.substring(filename.lastIndexOf(".")).toUpperCase();
    if (extension == '.CSV') {
      //Here calling another method to read CSV file into json
      csvFileToJSON(file, (jsonData) => {
        actionAfterUpload(jsonData);
      });
      setShowModal(false);
    } else if (extension === '.XLSX') {
      xlsxFileToJSON(file, (jsonData) => {
        actionAfterUpload(jsonData);
      });
      setShowModal(false);
    } else {
      alert('Extensions allowed are xlsx and csv.');
    }
    remove_loading();
  };
  console.log(peopleInfo);

  const rowPassesFilters = (row) => {
    if (getNameFromRow(row).length === 0) {
      return false;
    }
    if (industryTypeFiltered != null && getIndustryTypeFromRow(row) != industryTypeFiltered) {
      return false;
    }
    if (statesFiltered.length > 0 && !statesFiltered.includes(getStateFromRow(row))) {
      return false;
    }
    if (collegesFiltered.length > 0 && !collegesFiltered.includes(getCollegeFromRow(row))) {
      return false;
    }
    if (yearsFiltered.length > 0 && !yearsFiltered.includes(parseInt(getGraduationYearFromRow(row)))) {
      return false;
    }
    return true;
  }

  const getSortedUniqueColleges = () => {
    if (peopleInfo == null) {
      return [];
    }
    var colleges = new Set();
    for (const row of peopleInfo) {
      colleges.add(getCollegeFromRow(row));
    }
    return Array.from(colleges).sort();
  }

  const getSortedUniqueStates = () => {
    if (peopleInfo == null) {
      return [];
    }
    var states = new Set();
    for (const row of peopleInfo) {
      states.add(getStateFromRow(row));
    }
    return Array.from(states).sort();
  }

  const getSortedUniqueYears = () => {
    if (peopleInfo == null) {
      return [];
    }
    var years = new Set();
    for (const row of peopleInfo) {
      if (getGraduationYearFromRow(row)) {
        years.add(parseInt(getGraduationYearFromRow(row)));
      }
    }
    return Array.from(years).sort();
  }

  if (peopleInfo != null) {
    if (window.loadedMultiselect == null) {
      window.loadedMultiselect = true;
      setTimeout(
        () => {
          window.choices_college = new Choices('#choices-college', {
            removeItemButton: true,
            maxItemCount: null,
            searchResultLimit: null,
            renderChoiceLimit: null
          });
          window.choices_years = new Choices('#choices-years', {
            removeItemButton: true,
            maxItemCount: null,
            searchResultLimit: null,
            renderChoiceLimit: null
          });
          window.choices_state = new Choices('#choices-state', {
            removeItemButton: true,
            maxItemCount: null,
            searchResultLimit: null,
            renderChoiceLimit: null
          });
        }, 500
      );
    }
  }

  const selectCollegeChange = () => {
    setCollegesFiltered($('#choices-college').val());
  }

  const selectStateChange = () => {
    setStatesFiltered($('#choices-state').val());
  }

  const selectGraduationYearChange = () => {
    setYearsFiltered($('#choices-years').val().map(x => parseInt(x)));
  }

  const resetFilters = () => {
    var chart = window.donutGraphs["industry_type_donut_graph"];
    var newColors = chart.data.datasets[0].backgroundColor;
    for (var i = 0; i < chart.data.datasets[0].backgroundColor.length; i++) {
      newColors[i] = ALL_COLORS[i % ALL_COLORS.length];
    }
    createIndustryTypeDonutAndConfigureClick(
      chart.data.labels,
      chart.data.datasets[0].data,
      newColors
    );
    setIndustryTypeFiltered(null);
    setCollegesFiltered([]);
    setStatesFiltered([]);
    setYearsFiltered([]);
    window.choices_state.removeActiveItems();
    window.choices_years.removeActiveItems();
    window.choices_college.removeActiveItems();
  }

  return (
    <div>
      <AppHeader />
      <UserHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true}
        is_admin={isAdminBool}
        pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
        tickets_count={userInfo != null ? userInfo.tickets_count : 0}
        is_client_admin={userInfo != null ? userInfo.is_client_admin : false}
        is_sports={userInfo && userInfo.is_sports}
        newPeopleSpreadsheet={newPeopleSpreadsheet}
      />
      <NewDatasetModal showModal={showModal} setShowModal={setShowModal}
        modalDescription={"New dataset (will replace previous information)"} saveNewDataset={saveNewDataset}
        datasetName="" setDatasetName={null}
        avoidName={true}
        btnText="Upload"
        error={error} setError={setError}
        fileLoaded={fileLoaded} setFileLoaded={setFileLoaded}
      />
      <div style={{
        maxWidth: "1000px", margin: "auto", marginTop: "1em", marginBottom: "1em",
        padding: "1em", border: "1px solid", borderRadius: "1pxF"
      }}>
        <div style={{ display: peopleInfo === null ? 'none' : 'block' }}>
          <div className="row d-flex justify-content-center mt-100"
            style={{ width: '30%' }}>
            <button className="btn btn-light" onClick={resetFilters}>Reset all filters</button>
          </div>
          <div style={{ display: 'flex', marginBottom: '20px' }}>
            <div className="row d-flex justify-content-center mt-100"
              style={{ width: '30%', marginRight: '3%' }}>
              <div className="col-md-6"
                style={{ width: '100%' }}>
                <select id="choices-college"
                  placeholder="Select colleges to filter" multiple
                  onChange={() => selectCollegeChange()}
                  style={{ width: '100%' }}>
                  {
                    (getSortedUniqueColleges() || []).map((college, idx) =>
                      <option key={idx} value={college}>
                        {college || '(Empty)'}
                      </option>)
                  }
                </select>
              </div>
            </div>
            <div className="row d-flex justify-content-center mt-100"
              style={{ width: '30%', marginRight: '3%' }}>
              <div className="col-md-6"
                style={{ width: '100%' }}>
                <select id="choices-state"
                  placeholder="Select state to filter" multiple
                  onChange={() => selectStateChange()}
                  style={{ width: '100%' }}>
                  {
                    (getSortedUniqueStates() || []).map((state, idx) =>
                      <option key={idx} value={state}>
                        {state}
                      </option>)
                  }
                </select>
              </div>
            </div>
            <div className="row d-flex justify-content-center mt-100"
              style={{ width: '30%' }}>
              <div className="col-md-6"
                style={{ width: '100%' }}>
                <select id="choices-years"
                  placeholder="Select Graduation Year" multiple
                  onChange={() => selectGraduationYearChange()}
                  style={{ width: '100%' }}>
                  {
                    (getSortedUniqueYears() || []).map((state, idx) =>
                      <option key={idx} value={state}>
                        {state}
                      </option>)
                  }
                </select>
              </div>
            </div>
          </div>

          <br />

          <div style={{ display: 'flex' }}>
            <div style={{ width: '50%', textAlign: 'center' }}>
              <label>Industry Type</label>
            </div>
            <div style={{ width: '50%', textAlign: 'center' }}>
              <label>Map</label>
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', width: '50%', height: '300px', maxHeight: '300px' }} id='div_industry_type_donut_graph'>
              <canvas style={{ alignSelf: 'center', height: '300px', maxHeight: '300px' }} id="industry_type_donut_graph"></canvas>
            </div>
            <div style={{ width: '50%', height: '300px', maxHeight: '300px' }} id="regions_div"></div>
          </div>
          <div style={{ marginTop: '20px', height: '500px', overflowY: 'hidden' }}>
            <div style={{ overflowY: 'scroll', height: 'inherit' }}>
              <table id="myTable" style={{}} className="table table-hover caption-top">
                <thead className="table-dark"
                  style={{ position: 'sticky', top: 0 }}>
                  <tr>
                    <th className="table_header" onClick={() => sortTable(0, false)}>Name</th>
                    <th className="table_header" onClick={() => sortTable(1, false)}>Employer</th>
                    <th className="table_header" onClick={() => sortTable(2, false)}>Title</th>
                    <th className="table_header" onClick={() => sortTable(3, false)}>Graduation Year</th>
                    <th className="table_header" onClick={() => sortTable(4, false)}>Major</th>
                    <th className="table_header" onClick={() => sortTable(5, false)}>College</th>
                    <th className="table_header" onClick={() => sortTable(6, false)}>State</th>
                    <th className="table_header" onClick={() => sortTable(7, false)}>Industry Type</th>
                    <th className="table_header" onClick={() => sortTable(8, false)}>Linkedin</th>
                  </tr>
                </thead>
                <tbody className=".table-striped">
                  {(peopleInfo || []).filter(row => rowPassesFilters(row)).map((row, idx) => <tr key={idx}>
                    <td>{getNameFromRow(row)} {getSurnameFromRow(row)}</td>
                    <td>{getEmployerFromRow(row)}</td>
                    <td>{getTitleFromRow(row)}</td>
                    <td>{getGraduationYearFromRow(row)}</td>
                    <td>{getMajorFromRow(row)}</td>
                    <td>{getCollegeFromRow(row)}</td>
                    <td>{getStateFromRow(row)}</td>
                    <td>{getIndustryTypeFromRow(row)}</td>
                    <td><a target="_blank" href={getLinkedinFromRow(row)}>{getLinkedinFromRow(row)}</a></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
