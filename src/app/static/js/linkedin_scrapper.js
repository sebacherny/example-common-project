'use strict';
const e = React.createElement;


function App() {
  const [allUsers, setAllUsers] = React.useState([]);
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [newEmailToShare, setNewEmailToShare] = React.useState('');
  const [userInfo, setUserInfo] = React.useState(null);

  const success = (data) => {
    console.log(data);
    setAllUsers(data.data);
  };

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    get_user_data_api((data) => setUserInfo(data.data));
  };
  React.useEffect(() => {
    getData();
  }, []);


  const getDataFromLinkedin = (data) => {
    add_loading(window.document.body);
    get_data_from_linkedin_api(() => {
      alert('Finished!');
      success(data);
      remove_loading();
    })
  }

  const isAdminBool = userInfo != null && userInfo.is_admin ? true : false;
  if (isAdminBool && newEmailToShare === '' && userInfo.existingMails.length) {
    setNewEmailToShare(userInfo.existingMails[0]);
  }

  return (
    <div>
      <AppHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true} />
      <UserHeader
        loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername}
        redirectWhenLoggedOut={true}
        viewName="scrapper"
        pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
        is_admin={isAdminBool}
        tickets_count={userInfo != null ? userInfo.tickets_count : 0}
      />
      <div className='container_div'>
        <div>
          <button className="btn btn-primary" onClick={getDataFromLinkedin} style={{ float: "right", marginBottom: "1em", marginLeft: "1em", backgroundColor: "#434575", borderColor: "#434575" }}>Get data</button>
        </div>
        <h2>Profiles</h2>
        <table className="table table-hover caption-top" style={{ "textAlign": "center" }}>
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Location</th>
              <th>Mail</th>
              <th>Education</th>
            </tr>
          </thead>
          <tbody>
            {(allUsers || []).map((row) =>
              <tr key={row.id}>
                <td>{row.personal_info.name}</td>
                <td>{row.personal_info.role}</td>
                <td>{row.personal_info.location}</td>
                <td>{row.personal_info.mail}</td>
                <td>
                  {row.education[0]}
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
