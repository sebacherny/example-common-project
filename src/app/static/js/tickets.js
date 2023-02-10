'use strict';
const e = React.createElement;


function App() {
  const [allTickets, setAllTickets] = React.useState([]);
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [userInfo, setUserInfo] = React.useState(null);

  const success = (data) => {
    setAllTickets(data.data);
  };

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    get_all_tickets_api(success, (text) => { console.log("Error: ", text) });
    get_user_data_api((data) => setUserInfo(data.data))
  };
  React.useEffect(() => {
    getData();
  }, []);

  const validateUser = (ticket_id, username) => {
    const new_role = document.getElementById('select_' + ticket_id + + '_role').value;
    Swal.fire({
      title: 'Are you sure?',
      text: "User will be validated",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FBB142',
      cancelButtonColor: '#434575',
      confirmButtonText: 'Yes, validate'
    }).then((result) => {
      if (result.isConfirmed) {
        validate_user_api(username, new_role, (data) => {
          Swal.fire({
            title: 'Validated!',
            text: data.message,
            icon: 'success',
            timer: 1000,
          });
          getData();
        });
      }
    });
  };

  const deleteTicket = (ticketId) => {
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
        delete_ticket_api(ticketId, () => {
          Swal.fire({
            title: 'Deleted!',
            text: "",
            icon: 'success',
            timer: 1000,
          });
          getData();
        });
      }
    });
  };

  return (
    <div>
      <AppHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true} />
      <UserHeader
        loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername}
        redirectWhenLoggedOut={true}
        viewName="tickets"
        pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
        is_admin={userInfo != null && userInfo.is_admin}
        tickets_count={userInfo != null ? userInfo.tickets_count : 0}
        is_client_admin={userInfo != null ? userInfo.is_client_admin : false}
      />
      <div className='container_div'>
        <h2>New Users</h2>
        <table className="table table-hover caption-top" style={{ "textAlign": "center" }}>
          <thead className="table-light">
            <tr>
              <th>Username</th>
              <th>Date created</th>
              <th>Company</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(allTickets.new_user_tickets || []).map((ticket) =>
              <tr key={ticket.id}>
                <td>{ticket.username}</td>
                <td>{ticket.date_created}</td>
                <td>{ticket.company}</td>
                <td>
                  <select id={'select_' + ticket.id + + '_role'} defaultValue={ticket.company_role}>
                    <option value='company_admin'>Company Admin</option>
                    <option value='company_contributor'>Company Contributor</option>
                  </select>
                </td>
                <td>
                  <a className="btn btn-hover" style={{ border: "solid 1px" }} onClick={() => { validateUser(ticket.id, ticket.username) }}>Validate</a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <br />

        <h2>Rows Pending Approvals</h2>
        <table className="table table-hover caption-top" style={{ "textAlign": "center" }}>
          <thead className="table-light">
            <tr>
              <th>User creator</th>
              <th>Date created</th>
              <th># Rows</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(allTickets.rows_pending_approval_tickets || []).map((ticket) =>
              <tr key={ticket.id}>
                <td>{ticket.username}</td>
                <td>{ticket.date_created}</td>
                <td>{ticket.rows_count}</td>
                <td>
                  <a className="btn btn-hover" style={{ border: "solid 1px" }} href={'/tickets/' + ticket.id}>See & Validate</a>
                  <a className="btn btn-hover" style={{ border: "solid 1px" }} onClick={() => { deleteTicket(ticket.id) }}>Delete</a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <br />

        <h2>Messages Received</h2>
        <table className="table table-hover caption-top" style={{ "textAlign": "center" }}>
          <thead className="table-light">
            <tr>
              <th>User creator</th>
              <th>Mail</th>
              <th>Date created</th>
              <th>Message</th>
              <th>Dataset</th>
            </tr>
          </thead>
          <tbody>
            {(allTickets.message_tickets || []).map((ticket) =>
              <tr key={ticket.id}>
                <td>{ticket.username}</td>
                <td>{ticket.user_email}</td>
                <td>{ticket.date_created}</td>
                <td style={{ whiteSpace: 'pre' }}>{ticket.message}</td>
                <td><a href={'/datasets/' + ticket.dataset_id}>{ticket.dataset_id}</a></td>
              </tr>
            )}
          </tbody>
        </table>
        <br />
      </div>
    </div >
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
