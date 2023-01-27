'use strict';
const e = React.createElement;

function App() {
  const [name, setName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [accountBalance, setAccountBalance] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [state, setState] = React.useState("");
  const [city, setCity] = React.useState("");
  const [zipCode, setZipCode] = React.useState("");
  const [role, setRole] = React.useState("owner");
  const [paymentType, setPaymentType] = React.useState("credit");
  const [message, setMessage] = React.useState("");

  const success = async (text) => {
    await localStorage.setItem("userToken", text.access);
    await localStorage.setItem("loggedInUsername", text.username);
    if (text.is_admin) {
      window.location = "/admin-dashboard";
    } else {
      window.location = "/systems";
    }
  };

  const checkIsEmpty = () => {
    if (!address) {
      setMessage("* Address is required");
      return true;
    }
    if (!state) {
      setMessage("* State is required");
      return true;
    }
    return false;
  }

  const username = getUsername();

  const tryUserValidation = async (e) => {
    e.preventDefault();
    if (checkIsEmpty()) {
      return;
    }
    await validate_user_api({
      username, name, lastName, accountBalance, paymentType,
      address, state, city, zipCode, role
    }, success, (text) => { setMessage(text) });
  };

  if (localStorage.getItem("userToken") != null) {
    window.location = window.location.origin + "/profile";
  }

  return (
    <div >
      <AppHeader />
      <div style={{
        width: "400px", margin: "auto", marginTop: "200px",
        padding: "1em"
      }}>

        <form>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="name" className="form-control" id="name" placeholder=""
              onChange={(e) => { setName(e.target.value) }} value={name}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="last_name" className="form-label">Last Name</label>
            <input type="last_name" className="form-control" id="last_name" placeholder=""
              onChange={(e) => { setLastName(e.target.value) }} value={lastName}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="address" className="form-label">Address</label>
            <input type="text" className="form-control" id="address" placeholder="Address"
              onChange={(e) => { setAddress(e.target.value) }} value={address}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="state" className="form-label">State</label>
            <input type="text" className="form-control" id="state" placeholder="State"
              onChange={(e) => { setState(e.target.value) }} value={state}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="city" className="form-label">City</label>
            <input type="text" className="form-control" id="city" placeholder="City"
              onChange={(e) => { setCity(e.target.value) }} value={city}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="zip_code" className="form-label">Zip code</label>
            <input type="text" className="form-control" id="zip_code" placeholder="Zip"
              onChange={(e) => { setZipCode(e.target.value) }} value={zipCode}
              style={{ width: "60%" }} />
          </div>
          <div style={{ margin: "1em", color: "#FBB142" }}>{message}</div>
          <div className="mb-3">
            <label htmlFor="role" className="form-label">Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}
              style={{ width: "30%" }}>
              <option value="owner">Owner</option>
              <option value="technician">Technician</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="account_balance" className="form-label">Account balance</label>
            <input type="text" className="form-control" id="account_balance" placeholder=""
              onChange={(e) => { setAccountBalance(e.target.value) }} value={accountBalance}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="payment_type" className="form-label">Payment type</label>
            <select id="payment_type" value={paymentType} onChange={(e) => setPaymentType(e.target.value)}
              style={{ width: "30%" }}>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>
          <div style={{ margin: "1em" }}>
            <button type="submit" style={{
              marginLeft: "inherit", marginTop: "inherit",
              backgroundColor: "#402E32", borderColor: "#402E32"
            }} className="btn btn-primary" onClick={tryUserValidation}>Validate</button>
          </div>
          <div style={{ margin: "1em" }}>
            <label style={{ marginTop: "inherit" }}>
              Already have a user? <a id="login_btn" href="/login">Login</a>
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);

