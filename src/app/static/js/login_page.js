'use strict';
const e = React.createElement;

function App() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [userInactive, setUserInactive] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const success = async (text) => {
    await localStorage.setItem("userToken", text.access);
    await localStorage.setItem("loggedInUsername", text.username);
    if (text.is_admin) {
      window.location = "/admin-dashboard";
    } else {
      if (text.first_system) {
        window.location = "/systems/" + text.first_system.toString() + "/dashboard";
      } else {
        window.location = "/systems";
      }
    }
  };

  const resendEmail = () => {
    resend_email_api(email, () => {
      alert("Email sent. Check spam");
    });
  }

  const checkIsEmpty = () => {
    if (!email) {
      setMessage("* Email is required");
      return true;
    }
    if (!password) {
      setMessage("* Password is required");
      return true;
    }
    return false;
  }

  const tryLogin = async (e) => {
    setMessage("");
    setUserInactive(false);
    e.preventDefault();
    if (checkIsEmpty()) {
      return;
    }
    await login_api(email, password, success, (text) => {
      if (text === "Inactive user") {
        setMessage("User is inactive. You should have received an email.");
        setUserInactive(true);
      } else {
        setMessage("* " + text);
      }
    });
  };

  if (localStorage.getItem("userToken") != null) {
    window.location = window.location.origin + "/profile";
  }

  // In first div style: boxShadow: "5px 5px 20px #cccccccc",
  return (
    <div>
      <AppHeader />
      <div style={{
        width: "400px", margin: "auto", marginTop: "200px",
        padding: "1em"
      }}>
        <form>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input autoFocus type="text" className="form-control" id="email" placeholder="example@123.com"
              onChange={(e) => { setEmail(e.target.value) }} value={email}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" placeholder="password"
              onChange={(e) => { setPassword(e.target.value) }} value={password}
              style={{ width: "60%" }} />
          </div>
          <div style={{ margin: "1em", color: "#FBB142" }}>{message}</div>
          {
            userInactive && <div style={{ margin: "1em", color: "#FBB142" }}>
              To have an email resent, click <button type="button" className="btn btn-default" onClick={() => resendEmail()}>here</button>
            </div>
          }
          <div style={{ margin: "1em" }}>
            <button type="submit" style={{ marginTop: "inherit", backgroundColor: "#402E32", borderColor: "#402E32" }} className="btn btn-primary" onClick={tryLogin}>Login</button>
          </div>
          <div style={{ margin: "1em" }}>
            <label style={{ marginTop: "inherit" }}>
              Don't have a user yet? <a id="register_btn" href="/register">Register</a>
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

