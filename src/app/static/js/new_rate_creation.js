'use strict';
const e = React.createElement;


function App() {
  const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [userInfo, setUserInfo] = React.useState(null);
  const [utilityName, setUtilityName] = React.useState("");
  const [rateName, setRateName] = React.useState("");
  const [currentPeriodIndex, setCurrentPeriodIndex] = React.useState(0);
  const [periods, setPeriods] = React.useState([]);
  const [ratesArray, setRatesArray] = React.useState([]);
  const [isException, setIsException] = React.useState(false);

  const getEmptyPeriod = () => {
    var emptyPeriod = {
      'month_to': 'null', 'month_from': 'null',
      'hourly_rate': {}
    }
    for (var i = 0; i < 24; i++) {
      emptyPeriod['hourly_rate'][i] = '';
    }
    return emptyPeriod;
  }

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    get_user_data_api((data) => setUserInfo(data.data));
    get_all_rates_api((rates) => {
      setRatesArray(rates);
      if (sessionStorage.getItem('preselectedUtilityName') != null) {
        const currentUtilityName = sessionStorage.getItem('preselectedUtilityName');
        setUtilityName(currentUtilityName);
        const currentRateName = sessionStorage.getItem('preselectedRateName');
        setRateName(currentRateName);
        const rate_info = rates.filter(r => r.utility_name === currentUtilityName && r.rate_name === currentRateName);
        if (rate_info.length === 1) {
          populate_values_from_info(rate_info[0]);
        }
        sessionStorage.removeItem('preselectedUtilityName')
        sessionStorage.removeItem('preselectedRateName')
      }
    }
      , (text) => { console.log("Error: ", text) });
  };
  React.useEffect(() => {
    getData();
  }, []);

  const loadPeriodValues = (period) => {
    document.getElementById("select_month_from").value = period['month_from'];
    document.getElementById("select_month_to").value = period['month_to'];
    document.getElementById("txt_is_exception").checked = period['is_exception'];
    for (var i = 0; i < 24; i++) {
      document.getElementById("txt" + i.toString()).value = period['hourly_rate'][i];
    }
  };

  const savePeriod = () => {
    let period = {};
    period['month_from'] = document.getElementById("select_month_from").value;
    period['month_to'] = document.getElementById("select_month_to").value;
    period['is_exception'] = document.getElementById("txt_is_exception").checked;
    period['hourly_rate'] = {};
    for (var i = 0; i < 24; i++) {
      period['hourly_rate'][i] = document.getElementById("txt" + i.toString()).value;
    }
    let newPeriods = periods;
    newPeriods[currentPeriodIndex] = period;
    setPeriods(newPeriods);
    return newPeriods;
  };

  const previousPeriod = () => {
    savePeriod();
    if (currentPeriodIndex > 0) {
      loadPeriodValues(periods[currentPeriodIndex - 1]);
      setCurrentPeriodIndex(currentPeriodIndex - 1);
    }
  };

  const nextPeriod = () => {
    savePeriod();
    if (currentPeriodIndex < periods.length - 1) {
      loadPeriodValues(periods[currentPeriodIndex + 1]);
      setCurrentPeriodIndex(currentPeriodIndex + 1);
    } else {
      let newPeriods = [...periods];
      const emptyPeriod = getEmptyPeriod();
      newPeriods.push(emptyPeriod);
      setPeriods(newPeriods);
      setCurrentPeriodIndex(currentPeriodIndex + 1);
      loadPeriodValues(emptyPeriod);
    }
  };

  const saveRate = () => {
    document.getElementById('errors_div').innerHTML = '';
    const allPeriods = savePeriod().filter(period => period['month_to'] !== 'null' && period['month_from'] !== 'null');
    var currentUtilityName = utilityName;
    if (utilityName === '*add_new*') {
      currentUtilityName = document.getElementById('new_utility_txt').value;
    }
    var currentRateName = rateName;
    if (rateName === '*add_new*') {
      currentRateName = document.getElementById('new_rate_txt').value;
    }
    let completeInfo = { utilityName: currentUtilityName, rateName: currentRateName, information: allPeriods };
    do_create_rate_object_api(completeInfo, () => {
      refreshRatesArray();
      alert("Saved!");
      setUtilityName(currentUtilityName);
      setRateName(currentRateName);
    }, (errors) => {
      console.log(errors);
      for (const error of errors) {
        document.getElementById('errors_div').append(document.createTextNode('* ' + error));
        document.getElementById('errors_div').append(document.createElement('br'));
      }
    }, (rateName === '*add_new*'));

  };

  const uniqueUtilityNames = [...new Set(ratesArray.map((rate, idx) => rate.utility_name))];
  var uniqueRateNames = [];
  if (utilityName != null) {
    uniqueRateNames = [...new Set(ratesArray.filter((rate, idx) => rate.utility_name === utilityName).map((rate, idx) => rate.rate_name))];
  }

  const refreshRatesArray = () => {
    get_all_rates_api((rates) => setRatesArray(rates), (text) => { console.log("Error: ", text) });
  };

  const clean_periods = () => {
    populate_values_from_info({ 'information': [getEmptyPeriod()] });
  }

  const populate_values_from_info = (rate_info) => {
    setPeriods(rate_info['information']);
    loadPeriodValues(rate_info['information'][0]);
    setCurrentPeriodIndex(0);
  }

  const populate_values = (currentRateName) => {
    const rate_info = ratesArray.filter(r => r.utility_name === utilityName && r.rate_name === currentRateName);
    if (rate_info.length === 1) {
      populate_values_from_info(rate_info[0]);
    }
  }

  return (
    <div>
      <AppHeader />
      <UserHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true}
        is_admin={userInfo && userInfo.is_admin} pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
      />
      <div style={{
        maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
        padding: "1em"
      }} className="shadow">
        <label>Utility Name: </label>
        <select value={utilityName} onChange={e => {
          setUtilityName(e.target.value);
          setRateName('');
          clean_periods();
        }
        }>
          <option value=''></option>
          <option value='*add_new*'>- Add new utility</option>
          {uniqueUtilityNames.map((name, idx) => <option key={idx} value={name}>
            {name}
          </option>
          )}
        </select>
        {utilityName === '*add_new*' && <input type="text" id="new_utility_txt"></input>}
        <br />
        <label>Rate Name</label>
        <select value={rateName} onChange={e => {
          setRateName(e.target.value);
          if (e.target.value !== '' && e.target.value !== '*add_new*') {
            populate_values(e.target.value);
          } else {
            clean_periods();
          }
        }}>
          <option value=''></option>
          <option value='*add_new*'>- Add new rate</option>
          {uniqueRateNames.map((rateName, idx) => <option key={idx} value={rateName}>
            {rateName}
          </option>
          )}
        </select>
        {rateName === '*add_new*' && <input type="text" id="new_rate_txt"></input>}
      </div>
      <div style={{
        maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
        padding: "1em"
      }} className="shadow">
        <div>
          <div>
            <label>Period {currentPeriodIndex + 1}</label>
          </div>
          <div style={{ display: "flex" }}>
            <button type="button" onClick={() => { previousPeriod() }}>{"<"}</button>
            <div>
              <label>From</label>
              <select id="select_month_from">
                <option value="null">Month</option>
                {MONTHS.map((month, idx) => <option key={idx} value={idx}>
                  {month}
                </option>)}
              </select>
              <br />
              <label>To</label>
              <select id="select_month_to">
                <option value="null">Month</option>
                {MONTHS.map((month, idx) => <option key={idx} value={idx}>
                  {month}
                </option>)}
              </select>
            </div>
            <button type="button" onClick={() => { nextPeriod() }}>{">"}</button>
            <br />
          </div>
        </div>
        <br />
        <div>
          <input type="checkbox" id="txt_is_exception" />
          <label>Only weekend</label>
        </div>
        <br />
        <div style={{ display: "flex" }}>
          <div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>12 AM: </label>
              <input type="number" step="any" className="form-control" id="txt0" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>1 AM: </label>
              <input type="number" step="any" className="form-control" id="txt1" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>2 AM: </label>
              <input type="number" step="any" className="form-control" id="txt2" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>3 AM: </label>
              <input type="number" step="any" className="form-control" id="txt3" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>4 AM: </label>
              <input type="number" step="any" className="form-control" id="txt4" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>5 AM: </label>
              <input type="number" step="any" className="form-control" id="txt5" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>6 AM: </label>
              <input type="number" step="any" className="form-control" id="txt6" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>7 AM: </label>
              <input type="number" step="any" className="form-control" id="txt7" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>8 AM: </label>
              <input type="number" step="any" className="form-control" id="txt8" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>9 AM: </label>
              <input type="number" step="any" className="form-control" id="txt9" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>10 AM: </label>
              <input type="number" step="any" className="form-control" id="txt10" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>11 AM: </label>
              <input type="number" step="any" className="form-control" id="txt11" style={{ width: "100px" }} />
            </div>
          </div>
          <div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>12 PM: </label>
              <input type="number" step="any" className="form-control" id="txt12" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>1 PM: </label>
              <input type="number" step="any" className="form-control" id="txt13" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>2 PM: </label>
              <input type="number" step="any" className="form-control" id="txt14" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>3 PM: </label>
              <input type="number" step="any" className="form-control" id="txt15" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>4 PM: </label>
              <input type="number" step="any" className="form-control" id="txt16" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>5 PM: </label>
              <input type="number" step="any" className="form-control" id="txt17" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>6 PM: </label>
              <input type="number" step="any" className="form-control" id="txt18" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>7 PM: </label>
              <input type="number" step="any" className="form-control" id="txt19" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>8 PM: </label>
              <input type="number" step="any" className="form-control" id="txt20" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>9 PM: </label>
              <input type="number" step="any" className="form-control" id="txt21" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>10 PM: </label>
              <input type="number" step="any" className="form-control" id="txt22" style={{ width: "100px" }} />
            </div>
            <div className="form-group" style={{ display: "flex" }}>
              <label>11 PM: </label>
              <input type="number" step="any" className="form-control" id="txt23" style={{ width: "100px" }} />
            </div>
          </div>
        </div>
        <div id="errors_div" style={{ margin: "1em", color: "#FBB142", whiteSpace: "pre-wrap" }}></div>
        <button disabled={utilityName === "" || rateName === ""} onClick={() => { saveRate(); }} style={{ backgroundColor: "#FBB142", color: "#402E32" }}>Save</button>
      </div>
    </div>
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
