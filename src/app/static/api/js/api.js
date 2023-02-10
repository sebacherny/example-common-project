const login_sports_api = async (username, password, success, fail) => {
  return common_login_api(true, username, password, success, fail);
}

const login_api = async (username, password, success, fail) => {
  return common_login_api(false, username, password, success, fail);
}

const common_login_api = async (is_sports, username, password, success, fail) => {
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
        "is_sports": is_sports,
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


const register_sports_api = async (userInfo, success, fail) => {
  return common_register_api(`/api/sports/register/`, userInfo, success, fail);
};

const register_api = async (userInfo, success, fail) => {
  return common_register_api(`/api/register/`, userInfo, success, fail)
};

const common_register_api = async (url, userInfo, success, fail) => {
  const response = await fetch(
    url,
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

const validate_user_api = async (username, company_role, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/validate/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ username, company_role })
    }
  );
  const text = await response.text();
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)['data']);
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)["detail"])
  }
};

const approve_pending_rows_ticket_api = async (ticketId, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/ticket/${ticketId}/approve-rows/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  const text = await response.text();
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)['data']);
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)["detail"])
  }
};


const approve_one_pending_row_ticket_api = async (ticketId, rowId, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/tickets/${ticketId}/rows/${rowId}/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  const text = await response.text();
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)['data']);
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


const do_process_csv_file_content = async (json_content, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/store_sheet_rows/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(json_content)
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 201) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text));
  }
};


const add_rows_to_spreadsheet_api = async (spreadsheetId, data_json, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/datasets/${spreadsheetId}/`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data_json)
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



const get_all_datasets_api = async (success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/datasets/`,
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

const get_data_from_linkedin_api = async (success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/linkedin_scrapper/`,
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

const get_one_ticket_api = async (ticket_id, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/tickets/${ticket_id}/`,
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


const get_all_tickets_api = async (success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/tickets/`,
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


const get_form_data_api = async (success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/form_data/`,
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

const get_spreadsheet_dashboard_api = async (spreadsheetId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/datasets/${spreadsheetId}/`,
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

const do_get_custom_graph_api = async (spreadsheetId, graphData, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/datasets/${spreadsheetId}/custom-graph/?` + new URLSearchParams(graphData),
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


const get_spreadsheet_table_api = async (spreadsheetId, page, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/datasets/${spreadsheetId}/view-table?page_no=${page}`,
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

const get_dataset_rows_as_list_api = async (spreadsheetId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/datasets/${spreadsheetId}/rows-as-list`,
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
    success(JSON.parse(text)['data']);
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

const delete_dataset_api = async (spreadsheetId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/datasets/${spreadsheetId}/`,
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

const delete_ticket_api = async (ticketId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/tickets/${ticketId}/`,
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


const delete_pending_row_api = async (ticketId, rowId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/tickets/${ticketId}/rows/${rowId}/`,
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

const ask_question_api = async (message, datasetId, success, fail) => {
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
      body: JSON.stringify({ message, datasetId })
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

const store_rows_from_form_api = async (inputInfo, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/form/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(inputInfo)
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

const create_sports_students_dataset_api = async (jsonData, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/students-dataset/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ jsonData })
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

const get_sports_students_dataset_api = async (success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/students-dataset/`,
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



// SHARING

const share_spreadsheet_api = async (email, spreadsheetId, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/datasets/${spreadsheetId}/share/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        "email": email,
      })
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)['data']);
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)['detail']);
  }
};

const unshare_spreadsheet_api = async (userId, spreadsheetId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/datasets/${spreadsheetId}/user/${userId}/unshare/`,
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
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    Object.entries(JSON.parse(text)).forEach(([key, value]) => {
      fail(`${key}: ${value}`);
    });
  }
};