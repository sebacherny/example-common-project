'use strict';
const e = React.createElement;


function App() {
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [pages, setPages] = React.useState([]);
  const [page, setPage] = React.useState(0);
  let sortTableBy = null;
  let isReversedSort = false;

  const spreadsheetId = getSpreadsheetId();
  const pageSize = 50

  const success = (data) => {
    configureTable(data.data);
    const newPages = [];
    if (data.data.rows_count > pageSize) {
      for (let i = 0; i < Math.ceil(data.data.rows_count / pageSize); i++) {
        newPages.push({
          name: (i + 1).toString(),
          page: i,
        });
      }
      if (page > newPages.length - 1) {
        setPage(page - 1);
      }
    } else {
      setPage(0);
    }
    setPages(newPages);
  }

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    add_loading(window.document.body);
    get_spreadsheet_table_api(spreadsheetId, page, (data) => {
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
  }, [page]);

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

  const configureTable = (sheetInfo) => {
    let table = document.getElementById('myTable');
    let thead = document.getElementById('myTableThead');
    while (thead.children.length > 0) {
      thead.children[0].remove();
    }
    while (table.children.length > 1) {
      table.children[1].remove();
    }
    var header_tr = document.createElement('tr');
    for (var j = 0; j < sheetInfo['headers'].length; ++j) {
      const header = sheetInfo['headers'][j];
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
    for (var i = 0; i < sheetInfo['data'].length; ++i) {
      var row = document.createElement('tr');
      for (var j = 0; j < sheetInfo['headers'].length; ++j) {
        const header = sheetInfo['headers'][j];
        var td = document.createElement('td');
        const textValue = sheetInfo['data'][i][header];
        if (textValue.redirect_link == null) {
          td.innerHTML = textValue;
        } else {
          var a_link = document.createElement('a');
          a_link.text = textValue.value;
          const obj = sheetInfo['data'][i]
          a_link.href = 'javascript:void(0)';
          a_link.onclick = () => {
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
        is_admin={false} pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
      />
      <div className='container_div shadow'>
        <table id="myTable" className="table table-hover caption-top" style={{ "textAlign": "center" }}>
          <thead id="myTableThead" className="table-light">
          </thead>
        </table>
        {pages.length > 0 && <nav className="d-lg-flex justify-content-lg-end dataTables_paginate paging_simple_numbers">
          <ul className="pagination">
            <li className={"page-item " + (page === 0 ? "disabled" : "")}
              onClick={(e) => {
                e.preventDefault();
                setPage(Math.max(page - 1, 0));
              }}>
              <a className="page-link" href="#" aria-label="Previous">
                <span aria-hidden="true">«</span>
              </a>
            </li>
            {pages.map((el) => (
              <li key={"page" + el.page}
                onClick={(e) => { setPage(el.page); }} className={"page-item " + (page === el.page ? "active" : "")}>
                <a className="page-link" href="#">
                  {el.name}
                </a></li>))}
            <li className={"page-item " + (page === pages.length - 1 ? "disabled" : "")} onClick={(e) => {
              setPage(Math.min(page + 1, pages.length - 1));
            }}><a className="page-link" href="#" aria-label="Next"><span
              aria-hidden="true">»</span></a></li>
          </ul>
        </nav>}
      </div>
    </div >
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
