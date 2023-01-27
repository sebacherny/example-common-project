'use strict';
const e = React.createElement;


function App() {
  const [list, setList] = React.useState([]);
  const [uniqueUsers, setUniqueUsers] = React.useState([]);
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [selectedUser, setSelectedUser] = React.useState("-");
  const [sortTableBy, setSortTableBy] = React.useState(null);
  const [isReversedSort, setIsReversedSort] = React.useState(false);
  const [period, setPeriod] = React.useState("ac_day");

  const success = (data) => {
    setList(data.data);
    setUniqueUsers(new Set(data.data.map((system) => system.username)));
  };

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    add_loading(window.document.body);
    get_all_users_admin_api(period, (data) => {
      success(data);
      remove_loading();
    }, (text) => {
      console.log("Error: ", text);
      alert("Error: " + text);
      remove_loading();
    });
  };
  React.useEffect(() => {
    getData();
  }, []);

  const sortTable = (column_idx, isReverseBool) => {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("myTable");
    switching = true;
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("td")[column_idx];
        y = rows[i + 1].getElementsByTagName("td")[column_idx];
        var firstContent = x.textContent.toLowerCase();
        var secondContent = y.textContent.toLowerCase();
        if (column_idx > 2) {
          firstContent = parseFloat(firstContent);
          secondContent = parseFloat(secondContent);
        }
        if ((isReverseBool === false && firstContent > secondContent) || (isReverseBool === true && firstContent < secondContent)) {
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

  const doHeaderClick = (column_idx) => {
    var newReversedSort;
    if (sortTableBy === column_idx) {
      sortTable(column_idx, !isReversedSort);
      newReversedSort = !isReversedSort;
    } else {
      sortTable(column_idx, false);
      newReversedSort = false;
    }
    setIsReversedSort(newReversedSort);
    const headerElem = document.getElementById("myTable").rows[0].getElementsByTagName("th")[column_idx];
    if (newReversedSort) {
      if (headerElem.innerHTML.includes("&lt;")) {
        headerElem.innerHTML = headerElem.innerHTML.replace("&lt;", ">");
      } else {
        headerElem.innerHTML += " >";
      }
    } else {
      if (headerElem.innerHTML.includes("&gt;")) {
        headerElem.innerHTML = headerElem.innerHTML.replace("&gt;", "<");
      } else {
        headerElem.innerHTML += " <";
      }
    }
    if (sortTableBy !== column_idx && sortTableBy != null) {
      const previousHeaderElem = document.getElementById("myTable").rows[0].getElementsByTagName("th")[sortTableBy];
      previousHeaderElem.innerHTML = previousHeaderElem.innerHTML.substr(0, previousHeaderElem.innerHTML.length - 4);
    }
    setSortTableBy(column_idx);
  }

  return (
    <div>
      <AppHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true} />
      <UserHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true}
        is_admin={true} pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
      />
      <div style={{
        maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
        padding: "1em"
      }} className="shadow">
        <div style={{ textAlign: "center" }}>
          <div>
            <label>Period</label>
            <select value={period} onChange={(e) => {
              setPeriod(e.target.value);
              get_all_users_admin_api(e.target.value, success, (text) => { console.log("Error: ", text) });
            }}>
              <option value="ac_day">Day</option>
              <option value="ac_month">Month</option>
              <option value="ac_year">Year</option>
            </select>
          </div>
        </div>
        <div>
          <label>User</label>{'  '}
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="-">-</option>
            {Array.from(uniqueUsers).map((user) =>
              <option key={user} value={user}>{user}</option>
            )}
          </select>
        </div>
        <table id="myTable" className="table table-hover caption-top" style={{ "textAlign": "center" }}>
          <thead className="table-light">
            <tr>
              <th className="table_header" onClick={() => { doHeaderClick(0); }}>Username (id)</th>
              <th className="table_header" onClick={() => { doHeaderClick(1); }}>System name</th>
              <th className="table_header" onClick={() => { doHeaderClick(2); }}>System Location</th>
              <th className="table_header" onClick={() => { doHeaderClick(3); }}># Arrays</th>
              <th>AEP (kWh)</th>
              <th>MEP (kWh)</th>
              <th className="table_header" onClick={() => { doHeaderClick(6); }}>Difference (kWh)</th>
              <th className="table_header" onClick={() => { doHeaderClick(7); }}>Loss (%)</th>
            </tr>
          </thead>
          <tbody>
            {list.map((system) =>
              <tr key={system.id} style={{ display: selectedUser === "-" || selectedUser == system.username ? "" : "none" }}>
                <td>{system.username} ({system.user})</td>
                <td><a href={"/admin-dashboard/system/" + system.id}>{system.name}</a></td>
                <td>{system.location}</td>
                <td>{system.arrays_count}</td>
                <td>{system.actual_production[period].toFixed(1)}</td>
                <td>{system.expected_production[period].toFixed(1)}</td>
                <td>{(system.expected_production[period] - system.actual_production[period]).toFixed(1)}</td>
                <td>{system.actual_production[period] === 0 ? "-" : ((system.expected_production[period] - system.actual_production[period]) * 100.0 / system.actual_production[period]).toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div >
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
