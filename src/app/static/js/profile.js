'use strict';
const e = React.createElement;


function App() {
  const [userData, setUserData] = React.useState(null);
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");

  const TRANSLATED_STRINGS = {
    "name_label": { "en": "Name", },
    "address_label": { "en": "Address" },

  };

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    get_user_data_api((data) => setUserData(data.data));
  };
  React.useEffect(() => {
    getData();
  }, []);

  getLoggedInUsername((username) => { setLoggedInUsername(username) });

  return (
    <div>
      <AppHeader />
      <UserHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true}
        is_admin={userData && userData.is_admin}
        pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
        tickets_count={userData != null ? userData.tickets_count : 0}
        is_client_admin={userData != null ? userData.is_client_admin : false}
        is_sports={userData && userData.is_sports}
      />
      {userData != null &&
        <div className='container_div'>
          <div style={{ padding: "1em" }}>
            <label>{TRANSLATED_STRINGS['name_label'][pageLanguage]}:</label>{'  '}
            <label>{userData.name}</label>
            <br />
          </div>
          <div style={{ padding: "1em" }}>
            <label>Email:</label>{'  '}
            <label>{userData.email}</label>
            <br />
          </div>
        </div>
      }
    </div>
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
