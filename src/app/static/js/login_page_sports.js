'use strict';
const e = React.createElement;

function App() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState("");

  const success = async (text) => {
    await localStorage.setItem("userToken", text.access);
    await localStorage.setItem("loggedInUsername", text.username);
    window.location = "/datasets";
  };

  const resendEmail = () => {
    resend_email_api(username, () => {
      alert("Email sent. Check spam");
    });
  }

  const checkIsEmpty = () => {
    if (!username) {
      setMessage("* Username is required");
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
    e.preventDefault();
    if (checkIsEmpty()) {
      return;
    }
    await login_sports_api(username, password, success, (text) => {
      if (text === "Inactive user") {
        setMessage("User is inactive. You should wait for an email confirming your validation.");
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
            <label htmlFor="username" className="form-label">Username</label>
            <input autoFocus type="text" className="form-control" id="username" placeholder="username"
              onChange={(e) => { setUsername(e.target.value) }} value={username}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" placeholder="password"
              onChange={(e) => { setPassword(e.target.value) }} value={password}
              style={{ width: "60%" }} />
          </div>
          <div style={{ margin: "1em", color: "#ffffff" }}>{message}</div>
          <div style={{ margin: "1em" }}>
            <button type="submit" style={{ marginTop: "inherit", backgroundColor: "#434575", borderColor: "#434575" }} className="btn btn-primary" onClick={tryLogin}>Login</button>
          </div>
          <div style={{ margin: "1em" }}>
            <label style={{ marginTop: "inherit" }}>
              Don't have a user yet? <a id="register_btn" href="/sports/register">Register</a>
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

