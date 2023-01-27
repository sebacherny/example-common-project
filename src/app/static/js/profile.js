'use strict';
const e = React.createElement;


function App() {
  const [userData, setUserData] = React.useState(null);
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");

  const TRANSLATED_STRINGS = {
    "name_label": { "en": "Name", },
    "address_label": { "en": "Address" },
    "payment_type_label": { "en": "Payment type" },
    "account_balance_label": { "en": "Account balance" }

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
        is_admin={userData && userData.is_admin} pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
      />
      {userData != null &&
        <div style={{
          maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
          padding: "1em"
        }} className="shadow">
          <div style={{ padding: "1em" }}>
            <label>{TRANSLATED_STRINGS['name_label'][pageLanguage]}:</label>{'  '}
            <label>{userData.name}</label>
            <br />
          </div>
          <div style={{ padding: "1em" }}>
            <label>{TRANSLATED_STRINGS['address_label'][pageLanguage]}:</label>{'  '}
            <label>{userData.address}</label>
            <br />
          </div>
          <div style={{ padding: "1em" }}>
            <label>{TRANSLATED_STRINGS['payment_type_label'][pageLanguage]}:</label>{'  '}
            <label>{userData.payment_type}</label>
            <br />
          </div>
          <div style={{ padding: "1em" }}>
            <label>{TRANSLATED_STRINGS['account_balance_label'][pageLanguage]}:</label>{'  '}
            <label>{userData.account_balance}</label>
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
