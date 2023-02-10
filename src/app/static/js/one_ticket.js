'use strict';
const e = React.createElement;


function App() {
  const [allRows, setAllRows] = React.useState([]);
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [userInfo, setUserInfo] = React.useState(null);

  const success = (data) => {
    setAllRows(data.data.rows);
  };

  const ticketId = getTicketId();

  const getData = () => {
    add_loading(window.document.body);
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    get_user_data_api((data) => setUserInfo(data.data))
    get_one_ticket_api(ticketId, (data) => {
      success(data);
      remove_loading();
    }, (text) => { console.log("Error: ", text) });
  };
  React.useEffect(() => {
    getData();
  }, []);

  const deleteRow = (ticketId, rowId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FBB142',
      cancelButtonColor: '#434575',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        delete_pending_row_api(ticketId, rowId, () => {
          Swal.fire({
            title: 'Deleted!',
            text: "",
            icon: 'success',
            timer: 1000,
          });
          if (allRows.length === 1) {
            window.location.href = '/tickets';
          } else {
            getData();
          }
        });
      }
    });
  };

  const approveRows = (ticket_id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Rows will be permanently added to Dataset",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FBB142',
      cancelButtonColor: '#434575',
      confirmButtonText: 'Yes, validate'
    }).then((result) => {
      if (result.isConfirmed) {
        approve_pending_rows_ticket_api(ticket_id, (data) => {
          Swal.fire({
            title: 'Approved!',
            text: data.message,
            icon: 'success',
            timer: 500,
          });
          setTimeout(() => {
            window.location.href = '/tickets';
          }, 500);
        });
      }
    });
  };

  const approveOneRow = (ticket_id, row_id) => {
    approve_one_pending_row_ticket_api(ticket_id, row_id, (data) => {
      Swal.fire({
        title: 'Approved!',
        text: data.message,
        icon: 'success',
        timer: 500,
      });
      if (allRows.length === 1) {
        window.location.href = '/tickets';
      } else {
        getData();
      }
    });
  }

  const isAdminBool = userInfo != null && userInfo.is_admin ? true : false;

  return (
    <div>
      <AppHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true} />
      <UserHeader
        loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername}
        redirectWhenLoggedOut={true}
        viewName="oneTicket"
        pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
        is_admin={isAdminBool}
        tickets_count={userInfo != null ? userInfo.tickets_count : 0}
        is_client_admin={userInfo != null ? userInfo.is_client_admin : false}
      />
      <div className='container_div'>
        <a className="btn btn-hover btn-success"
          style={{ marginRight: "0.5em", border: "solid 1px" }}
          onClick={() => { approveRows(ticketId) }}>Validate All</a>
        <br />
        <br />
        <h2>Pending rows in ticket {ticketId}</h2>
        <table className="table table-hover caption-top" style={{ "textAlign": "center" }}>
          <thead className="table-light">
            <tr>
              <th>Company</th>
              <th>ESG</th>
              <th>Industry</th>
              <th>ESG subcategory</th>
              <th>CSR</th>
              <th>Ratio</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allRows.map((row) =>
              <tr key={row.id}>
                <td>{row.company}</td>
                <td>{row.ESG_spending_category}</td>
                <td>{row.industry_category_description}</td>
                <td>{row.ESG_subcategory_description}</td>
                <td>{row.csr}</td>
                <td>{row.ratio}</td>
                <td>
                  <a className="btn btn-hover btn-success" style={{ marginRight: "0.5em", border: "solid 1px" }} onClick={() => { approveOneRow(ticketId, row.id) }}>Validate</a>
                  <a className="btn btn-hover btn-danger" style={{ border: "solid 1px" }} onClick={() => { deleteRow(ticketId, row.id) }}>Delete</a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <br />
      </div>
    </div>
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
