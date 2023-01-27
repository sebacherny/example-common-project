'use strict';
const e = React.createElement;


function App() {
  const [databaseInfo, setDatabaseInfo] = React.useState([]);
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  let selectedTable = "-";
  let sortTableBy = null;
  let isReversedSort = false;

  const success = (data) => {
    setDatabaseInfo(data.data);
  };

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    add_loading(window.document.body);
    get_database_info_admin_api((data) => {
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
        if (parseFloat(firstContent).toString() === firstContent) {
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
    isReversedSort = newReversedSort;
    const headerElem = document.getElementById("myTableThead").children[0].children[column_idx];
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
      const previousHeaderElem = document.getElementById("myTableThead").children[0].children[sortTableBy];
      previousHeaderElem.innerHTML = previousHeaderElem.innerHTML.substr(0, previousHeaderElem.innerHTML.length - 4);
    }
  }

  const configureTable = (databaseTable) => {
    let table = document.getElementById('myTable');
    let thead = document.getElementById('myTableThead');
    while (thead.children.length > 0) {
      thead.children[0].remove();
    }
    while (table.children.length > 1) {
      table.children[1].remove();
    }
    var header_tr = document.createElement('tr');
    for (var j = 0; j < databaseInfo[databaseTable]['headers'].length; ++j) {
      const header = databaseInfo[databaseTable]['headers'][j];
      var th = document.createElement('th');
      th.classList.add('table_header');
      const idx = j;
      th.onclick = () => {
        doHeaderClick(idx);
        sortTableBy = idx;
      };
      //th.appendChild(document.createTextNode(header));
      th.innerHTML = header;
      header_tr.appendChild(th);
    }
    thead.appendChild(header_tr);
    for (var i = 0; i < databaseInfo[databaseTable]['data'].length; ++i) {
      var row = document.createElement('tr');
      for (var j = 0; j < databaseInfo[databaseTable]['headers'].length; ++j) {
        const header = databaseInfo[databaseTable]['headers'][j];
        var td = document.createElement('td');
        const textValue = databaseInfo[databaseTable]['data'][i][header];
        if (textValue.redirect_link == null) {
          td.innerHTML = textValue;
        } else {
          var a_link = document.createElement('a');
          a_link.text = textValue.value;
          const obj = databaseInfo[databaseTable]['data'][i]
          a_link.href = 'javascript:void(0)';
          a_link.onclick = () => {
            if (databaseTable === 'rates') {
              sessionStorage.setItem('preselectedUtilityName', obj['utility_name'].value);
              sessionStorage.setItem('preselectedRateName', obj['rate_name'].value);
            }
            window.open(textValue.redirect_link);
          }
          td.appendChild(a_link);
        }
        row.appendChild(td);
        //row.cells[j].appendChild(document.createTextNode(textValue));
      }
      table.appendChild(row);
    }
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
        <div>
          <label>Tables</label>{'  '}
          <select id="tablesSelect" defaultValue={selectedTable} onChange={(e) => {
            //setSelectedTable(e.target.value);
            selectedTable = e.target.value;
            document.getElementById("tablesSelect").value = selectedTable;
            configureTable(selectedTable);
          }}>
            <option value="-">-</option>
            {Object.keys(databaseInfo).map((table) =>
              <option key={table} value={table}>{table}</option>
            )}
          </select>
        </div>
        <table id="myTable" className="table table-hover caption-top" style={{ "textAlign": "center" }}>
          <thead id="myTableThead" className="table-light">
          </thead>
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
