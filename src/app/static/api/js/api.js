const login_api = async (username, password, success, fail) => {
  const response = await fetch(
    `/api/token/`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "username": username,
        "password": password,
      })
    }
  );
  const text = await response.text();
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)["detail"])
  }
};

const do_token_not_valid = async () => {
  await localStorage.removeItem("userToken");
  await localStorage.removeItem("loggedInUsername");
  console.log("Token not valid");
  window.location = "/login";
};

const getLoggedInUsername = async (funcCall) => {
  const loggedInUsername = await localStorage.getItem("loggedInUsername");
  funcCall(loggedInUsername);
};

const getPageLanguage = async (funcCall) => {
  const pageLanguage = "en"; // await localStorage.getItem("pageLanguage") || "en";
  funcCall(pageLanguage);
};

const setLocalStorageLanguage = async (lang) => {
  await localStorage.setItem("pageLanguage", lang);
}

const register_api = async (userInfo, success, fail) => {
  const response = await fetch(
    `/api/register/`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo)
    }
  );
  const text = await response.text();
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)["detail"])
  }
};

const validate_user_api = async (userInfo, success, fail) => {
  const response = await fetch(
    `/api/validate/`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo)
    }
  );
  const text = await response.text();
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)["detail"])
  }
};

const resend_email_api = async (email, success) => {
  const response = await fetch(
    `/api/send_mail/`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ "email": email })
    }
  );
  const text = await response.text();
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)["detail"])
  }
};



const ask_question_api = async (message, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/ask_question/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message })
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text));
  }
};

const do_create_rate_object_api = async (rate_object, success, fail, is_new) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/money_rates/`,
    {
      method: is_new ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(rate_object)
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 201 || response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)["errors"]);
  }
}

const get_all_users_admin_api = async (period, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/admin/dashboard/?period=${period}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};

const get_clients_info_admin_api = async (success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/admin/clients-info/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};

const get_database_info_admin_api = async (success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/admin/database-info/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};

const do_solar_edge_api_call = async (success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/admin/solar-edge/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};

const do_enphase_api_call = async (success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/admin/enphase/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};

const create_system_from_wizard_api = async (data, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/wizard/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 201) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)["data"]);
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)['errors']);
  }
};


const post_system_api = async (data, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 201) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)["data"]);
  } else {
    console.log("failed", text);
  }
};

const put_system_api = async (systemId, data, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/${systemId}/`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};


const post_solar_array_api = async (systemId, data, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/${systemId}/solar_array/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 201) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)["data"]);
  } else {
    console.log("failed", text);
    fail(JSON.parse(text));
  }
};

const put_solar_array_api = async (systemId, arrayId, data, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/${systemId}/solar_array/${arrayId}/`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)["data"]);
  } else {
    console.log("failed", text);
    fail(JSON.parse(text));
  }
};

const post_inverter_api = async (systemId, data, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/${systemId}/inverter/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 201) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)["data"]);
  } else {
    console.log("failed", text);
    fail(JSON.parse(text));
  }
};

const put_inverter_api = async (systemId, inverterId, data, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/${systemId}/inverter/${inverterId}/`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)["data"]);
  } else {
    console.log("failed", text);
    fail(JSON.parse(text));
  }
};


const get_dashboard_info_api = async (systemId, date_str, period, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/${systemId}/dashboard_info/?date_str=${date_str}&period=${period}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};

const get_solar_edge_client_api = async (systemAddress, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/solar_edge/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ address: systemAddress })
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text));
  }
};

const get_enphase_client_api = async (systemAddress, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/enphase/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ address: systemAddress })
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text));
  }
};

const get_solar_edge_client_inventory_api = async (siteID, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/solar_edge/inventory/${siteID}/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text));
  }
};

const get_enphase_client_inventory_api = async (siteID, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/enphase/inventory/${siteID}/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text));
  }
};



const get_solar_array_data = async (systemId, solarArrayId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/${systemId}/solar_array/${solarArrayId}/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)["data"]);
  } else {
    console.log("failed", text);
  }
};

const get_solar_arrays_api = async (systemId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/${systemId}/solar_array`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};

const get_inverters_api = async (systemId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/${systemId}/inverter`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};


const get_all_systems_api = async (success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};

const get_all_rates_api = async (success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/money_rates/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)["data"]);
  } else {
    console.log("failed", text);
  }
};


const get_system_info_api = async (systemId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/${systemId}/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};

const get_user_data_api = async (success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/user_info/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};

const delete_solar_array_api = async (systemId, arrayId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/${systemId}/solar_array/${arrayId}/`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  console.log(response.status);
  if (response.status === 410) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    Object.entries(JSON.parse(text)).forEach(([key, value]) => {
      fail(`${key}: ${value}`);
    });
  }
};

const delete_inverter_api = async (systemId, inverterId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/${systemId}/inverter/${inverterId}/`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  console.log(response.status);
  if (response.status === 410) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    Object.entries(JSON.parse(text)).forEach(([key, value]) => {
      fail(`${key}: ${value}`);
    });
  }
};


const delete_system_api = async (systemId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/systems/${systemId}/`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  console.log(response.status);
  if (response.status === 410) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    Object.entries(JSON.parse(text)).forEach(([key, value]) => {
      fail(`${key}: ${value}`);
    });
  }
};


function doIfEscapePressed(event, funcCall) {
  event = event || window.event;
  var key = event.which || event.key || event.keyCode;
  if (key === 27) { // escape
    funcCall();
  }
};