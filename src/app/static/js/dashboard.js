'use strict';
const e = React.createElement;


function App() {

  var yesterday = new Date(new Date() - 24 * 3600 * 1000);
  var date_str = yesterday.getFullYear() + "-";
  if (yesterday.getMonth() + 1 < 10) {
    date_str += "0";
  }
  date_str += (yesterday.getMonth() + 1) + "-";
  if (yesterday.getDate() < 10) {
    date_str += "0";
  }
  date_str += yesterday.getDate();
  const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const [dashboardInfo, setDashboardInfo] = React.useState(null);
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [systemData, setSystemData] = React.useState(null);
  const [period, setPeriod] = React.useState("ac_day");
  const [userInfo, setUserInfo] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState(date_str);
  const [selectedMonth, setSelectedMonth] = React.useState(yesterday.getMonth());

  const systemId = getSystemId();

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    get_dashboard_info_api(systemId, selectedDate, period, (data) => { setDashboardInfo(data.data); });
    get_system_info_api(systemId, (data) => setSystemData(data.data));
    get_user_data_api((data) => setUserInfo(data.data))
  };

  const sendQuestion = () => {
    const text = document.querySelector("#question_textarea").value;
    if (!text) {
      alert("Email text cannot be empty");
      return;
    }
    document.querySelector("#ask_question_btn").setAttribute("disabled", "true");
    ask_question_api(text, () => {
      Swal.fire({
        title: 'Message sent!',
        text: "The admin will read your message and answer via email",
        icon: 'success',
        confirmButtonColor: "#402E32",
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

  const isValidDate = (date_str) => {
    const y = parseInt(date_str.substr(0, 4));
    const m = parseInt(date_str.substr(5, 2));
    const d = parseInt(date_str.substr(8, 2));
    return y > 2000 && m <= 12 && m >= 1 && d >= 1 && d <= 31;
  }

  const changedDate = (date_value) => {
    if (!isValidDate(date_value)) {
      setSelectedDate(date_value);
      return;
    }
    add_loading(window.document.body);
    get_dashboard_info_api(systemId, date_value, period, (data) => {
      setDashboardInfo(data.data);
      setSelectedDate(date_value);
      setTimeout(remove_loading, 500);
    });
  };

  const changedPeriod = (newPeriod) => {
    add_loading(window.document.body);
    get_dashboard_info_api(systemId, selectedDate, newPeriod, (data) => {
      setDashboardInfo(data.data);
      setPeriod(newPeriod);
      setTimeout(remove_loading, 500);
    });
  };

  const constructEnergyGraph = () => {
    if (document.getElementById('energyChart') && dashboardInfo != null) {
      if (window.energyChartObj != undefined) {
        window.energyChartObj.destroy();
      }
      if (!isValidDate(selectedDate)) {
        return;
      }
      var xValues = []
      var mepValues = [];
      var aepValues = [];
      for (var i = 0;
        i < Math.max(dashboardInfo.expected_production.values.length, dashboardInfo.actual_production.values.length);
        i++) {
        if (period === "ac_year") {
          xValues.push(MONTHS[i]);
        } else {
          xValues.push(i + 1);
        }
        if (i < dashboardInfo.expected_production.values.length) {
          mepValues.push((dashboardInfo.expected_production.values[i] / 1000).toFixed(1));
        } else {
          mepValues.push(0);
        }
        if (i < dashboardInfo.actual_production.values.length) {
          aepValues.push(dashboardInfo.actual_production.values[i].toFixed(1));
        } else {
          aepValues.push(0);
        }
      }
      // var barColors = ["red", "green"];
      var mepColor = "#402E32";
      var aepColor = "#FBB142";

      var pretty_title = "Production for ";
      if (period === "ac_month") {
        pretty_title += MONTHS[parseInt(selectedDate.substr(5, 2)) - 1] + " " + selectedDate.substr(0, 4);
      } else if (period == "ac_day") {
        pretty_title += selectedDate;
      } else {
        pretty_title += selectedDate.substr(0, 4);
      }

      window.energyChartObj = new Chart("energyChart", {
        type: "bar",
        data: {
          labels: xValues,
          datasets: [
            {
              backgroundColor: mepColor,
              data: mepValues,
              label: 'Model',
            },
            {
              backgroundColor: aepColor,
              data: aepValues,
              label: 'Real',
            },
          ]
        },
        options: {
          scales: {
            yAxes: [{
              display: true,
              ticks: {
                beginAtZero: true,
              }
            }],
          },
          legend: { display: true },
          title: {
            display: true,
            text: pretty_title
          }
        }
      });
    }
  }

  const constructMoneyGraph = () => {
    if (document.getElementById('moneyChart') && dashboardInfo != null) {
      if (window.moneyChartObj != undefined) {
        window.moneyChartObj.destroy();
      }
      if (!isValidDate(selectedDate)) {
        return;
      }
      var xValues = []
      var vepValues = [];
      for (var i = 0;
        i < dashboardInfo.value_of_energy_produced.length;
        i++) {
        if (period === "ac_year") {
          xValues.push(MONTHS[i]);
        } else if (period === "ac_month") {
          const dayNumString = (i + 1).toString();
          const currentDayDate = selectedDate.substr(0, 8) + (dayNumString.length === 1 ? "0" : "") + dayNumString;
          const utc_weekday = new Date((new Date(currentDayDate)).valueOf() + (new Date().getTimezoneOffset() * 60 * 1000)).getDay();
          if (utc_weekday === 0 || utc_weekday === 6) {
            xValues.push(dayNumString + " (S) ");
          } else {
            xValues.push(dayNumString);
          }
        } else {
          xValues.push(i + 1);
        }
        vepValues.push((dashboardInfo.value_of_energy_produced[i] / 1).toFixed(1));
      }
      // var barColors = ["red", "green"];
      var vepColor = "#FBB142";

      var pretty_title = "Earnings for ";
      if (period === "ac_month") {
        pretty_title += MONTHS[parseInt(selectedDate.substr(5, 2)) - 1] + " " + selectedDate.substr(0, 4);
      } else if (period == "ac_day") {
        pretty_title += selectedDate;
      } else {
        pretty_title += selectedDate.substr(0, 4);
      }

      window.moneyChartObj = new Chart("moneyChart", {
        type: "bar",
        data: {
          labels: xValues,
          datasets: [
            {
              backgroundColor: vepColor,
              data: vepValues,
              label: '$',
            }
          ]
        },
        options: {
          scales: {
            yAxes: [{
              display: true,
              ticks: {
                beginAtZero: true,
              }
            }],
          },
          legend: { display: true },
          title: {
            display: true,
            text: pretty_title
          }
        }
      });
    }
  }

  constructEnergyGraph();
  constructMoneyGraph();

  React.useEffect(() => {
    getData();
  }, []);

  getLoggedInUsername((username) => { setLoggedInUsername(username) });

  return (
    <div>
      <AppHeader />
      <UserHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true}
        is_admin={userInfo && userInfo.is_admin} pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
      />
      <SystemHeader systemData={systemData} is_dashboard_view={true} />
      <div style={{
        maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
        padding: "1em"
      }} className="shadow">
        {dashboardInfo != null &&
          <div>
            <div style={{ textAlign: "center" }}>
              <select value={period} onChange={(e) => changedPeriod(e.target.value)}>
                <option value="ac_day">Day</option>
                <option value="ac_month">Month</option>
                <option value="ac_year">Year</option>
              </select>
              <input type="date" id="start" name="trip-start"
                value={selectedDate} onChange={(e) => changedDate(e.target.value)}></input>
              <select style={{ display: 'none' }} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                <option value={0}>January</option>
                <option value={1}>February</option>
                <option value={2}>March</option>
                <option value={3}>April</option>
                <option value={4}>May</option>
                <option value={5}>June</option>
                <option value={6}>July</option>
                <option value={7}>August</option>
                <option value={8}>September</option>
                <option value={9}>October</option>
                <option value={10}>November</option>
                <option value={11}>December</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "row", marginBottom: "5px" }}>

              <div style={{ padding: "1em", textAlign: "center" }}>
                <label>Energy Produced</label>
                <div className="square-box">
                  <span className="square-content">{(dashboardInfo.actual_production.values.reduce((partialSum, a) => partialSum + a, 0)).toFixed(2)} {dashboardInfo.actual_production.unit}</span>
                </div>
              </div>
              <div style={{ padding: "1em", textAlign: "center" }}>
                <label>Expected Production</label>
                <div className="square-box">
                  <span className="square-content">{(dashboardInfo.expected_production.values.reduce((partialSum, a) => partialSum + a, 0) / 1000).toFixed(2)} {dashboardInfo.expected_production.unit}</span>
                </div>
              </div>
              <div style={{ padding: "1em", textAlign: "center" }}>
                <label>Value of energy produced</label>
                <div className="square-box">
                  <span className="square-content">{dashboardInfo.value_of_energy_produced.reduce((partialSum, a) => partialSum + a, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <canvas id="energyChart" style={{ width: "100%", maxWidth: "700px" }}></canvas>
            <br />
            <canvas id="moneyChart" style={{ width: "100%", maxWidth: "700px" }}></canvas>
            {userInfo && userInfo.is_admin === false &&
              <div style={{ textAlign: "center" }}>
                <label>Ask a question</label>
                <br />
                <textarea id="question_textarea" style={{ width: "50%", height: "100px" }}></textarea>
                <br />
                <button id="ask_question_btn" style={{ backgroundColor: "#402E32", borderColor: "#402E32" }} className="btn btn-primary" onClick={() => { sendQuestion(); }}>Send question</button>
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
