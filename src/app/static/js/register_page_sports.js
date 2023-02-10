'use strict';
const e = React.createElement;

function App() {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [registeredUser, setRegisteredUser] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [name, setName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [state, setState] = React.useState("");
  const [city, setCity] = React.useState("");
  const [zipCode, setZipCode] = React.useState("");

  const success = async (text) => {
    if (text.pending_validation) {
      setRegisteredUser(true);
    } else {
      await localStorage.setItem("userToken", text.access);
      await localStorage.setItem("loggedInUsername", text.username);
      window.location = "/sports-dashboard";
    }
  };

  const isValid = (mail) => {
    return mail.match(".+@.+\\\..+") != null;
  }

  const checkIsEmpty = () => {
    if (!username) {
      setMessage("* Username is required");
      return true;
    }
    if (!isValid(email)) {
      setMessage("* Email is invalid");
      return true;
    }
    if (!password) {
      setMessage("* Password is required");
      return true;
    }
    if (!name) {
      setMessage("* Name is required");
      return true;
    }
    if (!lastName) {
      setMessage("* Last name is required");
      return true;
    }
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

  const tryRegister = async (e) => {
    e.preventDefault();
    if (checkIsEmpty()) {
      return;
    }
    await register_sports_api({
      email, password, username, name, lastName, address,
      state, city, zipCode
    }, success, (text) => { setMessage(text) });
  };

  if (localStorage.getItem("userToken") != null) {
    window.location = window.location.origin + "/profile";
  }

  // In first div style: boxShadow: "5px 5px 20px #cccccccc",
  if (registeredUser) {
    return (
      <div>
        <AppHeader />
        <div style={{
          width: "400px", margin: "auto", marginTop: "200px",
          padding: "1em", color: "#ffffff"
        }}>
          <label>Congratulations! </label>
          <br></br>
          <label>Check that you received our email confirming your registration.
            When your account is verified we will send you another one for you to log in and start using our service.</label>
        </div>
      </div>
    )
  }
  return (
    <div>
      <AppHeader />
      <div style={{
        width: "400px", margin: "auto", marginTop: "200px",
        padding: "1em"
      }}>
        <form>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input autoFocus type="text" className="form-control" id="username" placeholder="username"
              onChange={(e) => { setUsername(e.target.value) }} value={username}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="text" className="form-control" id="email" placeholder="email"
              onChange={(e) => { setEmail(e.target.value) }} value={email}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" placeholder="password"
              onChange={(e) => { setPassword(e.target.value) }} value={password}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="name" className="form-control" id="name" placeholder="Name"
              onChange={(e) => { setName(e.target.value) }} value={name}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="last_name" className="form-label">Last Name</label>
            <input type="last_name" className="form-control" id="last_name" placeholder="Last name"
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
          <div style={{ margin: "1em", color: "#ffffff" }}>{message}</div>
          <div style={{ margin: "1em" }}>
            <button type="submit" style={{
              marginLeft: "inherit", marginTop: "inherit",
              backgroundColor: "#434575", borderColor: "#434575"
            }} className="btn btn-primary" onClick={tryRegister}>Register</button>
          </div>
          <div style={{ margin: "1em" }}>
            <label style={{ marginTop: "inherit" }}>
              Already have a user? <a id="login_btn" href="/sports/login">Login</a>
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

