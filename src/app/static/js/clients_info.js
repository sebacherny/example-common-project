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

  const doSolarEdgeCall = () => {
    do_solar_edge_api_call(success);
  };

  const doEnphaseCall = () => {
    do_enphase_api_call(success);
  };

  const success = (data) => {
    setList(data.data);
  };

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    get_clients_info_admin_api(success, (text) => { console.log("Error: ", text) });
  };
  React.useEffect(() => {
    getData();
  }, []);

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
        <button onClick={() => { doSolarEdgeCall(); }} className="btn btn-default">Solar Edge API Call</button>
        <button onClick={() => { doEnphaseCall(); }} className="btn btn-default">Enphase API Call</button>
      </div>
      <div style={{
        maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
        padding: "1em"
      }} className="shadow">

        <table id="myTable" className="table table-hover caption-top" style={{ "textAlign": "center" }}>
          <thead className="table-light">
            <tr>
              <th>User id</th>
              <th>Account id</th>
              <th>Inverter brand</th>
              <th>Name</th>
              <th>Address</th>
              <th>Installation date</th>
            </tr>
          </thead>
          <tbody>
            {list.map((client) =>
              <tr key={client.id}>
                <td>{client.user_id}</td>
                <td>{client.account_id}</td>
                <td>{client.api_name}</td>
                <td>{client.name}</td>
                <td>{client.location_country}, {client.location_state}, {client.location_city}
                  , {client.location_address}, {client.location_zip_code}</td>
                <td>{client.installation_date}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
