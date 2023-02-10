'use strict';
const e = React.createElement;


function App() {
  const [allDatasets, setAllDatasets] = React.useState([]);
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [showModal, setShowModal] = React.useState(false);
  const [modalDescription, setModalDescription] = React.useState("");
  const [spreadsheetId, setSpreadsheetId] = React.useState(null);
  const [error, setError] = React.useState("");
  const [datasetName, setDatasetName] = React.useState("");
  const [fileLoaded, setFileLoaded] = React.useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = React.useState(false);
  const [sharedWithEmails, setSharedWithEmails] = React.useState([]);
  const [newEmailToShare, setNewEmailToShare] = React.useState('');
  const [userInfo, setUserInfo] = React.useState(null);

  const success = (data) => {
    setAllDatasets(data.data);
  };

  const getData = () => {
    add_loading(window.document.body);
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    get_user_data_api((data) => setUserInfo(data.data))
    get_all_datasets_api((data) => {
      success(data);
      remove_loading();
    }, (text) => { console.log("Error: ", text) });
  };

  React.useEffect(() => {
    getData();
  }, []);

  if (userInfo && userInfo.is_sports) {
    window.location.href = '/sports-dashboard';
    return <div></div>;
  } else if (userInfo && !userInfo.is_admin && !userInfo.is_client_admin) {
    window.location.href = '/add-data';
    return <div></div>;
  }

  const store_rows_from_json = (json_object) => {
    const body_json = { spreadsheetName: datasetName, data: json_object };
    if (spreadsheetId != null) {
      add_rows_to_spreadsheet_api(spreadsheetId, body_json, (data) => {
        alert("Added " + data.added_rows + " rows!");
        document.getElementById('myfile').value = null;
        setFileLoaded(false);
        getData();
        remove_loading();
        setShowModal(false);
      }, (errors_data) => {
        remove_loading();
        if (errors_data.show_errors) {
          alert(errors_data['errors'][0]);
        } else {
          alert("Error processing file.");
        }
      });
    } else {
      do_process_csv_file_content(body_json, (data) => {
        alert("Stored " + data.data.rows_count + " rows!");
        document.getElementById('myfile').value = null;
        setFileLoaded(false);
        getData();
        remove_loading();
        setShowModal(false);
      }, (errors_data) => {
        remove_loading();
        if (errors_data.show_errors) {
          alert(errors_data['errors'][0]);
        } else {
          alert("Error processing file.");
        }
      });
    }
  }

  const saveNewDataset = (e) => {
    e.preventDefault();
    setError("");
    if (!datasetName) {
      setError("Dataset name is required");
      return;
    }
    add_loading(window.document.body);
    const file_input = document.getElementById('myfile');
    const file = file_input.files[0];
    const filename = file.name;
    const extension = filename.substring(filename.lastIndexOf(".")).toUpperCase();
    if (extension == '.CSV') {
      //Here calling another method to read CSV file into json
      csvFileToJSON(file, (jsonData) => store_rows_from_json(jsonData));
    } else if (extension === '.XLSX') {
      xlsxFileToJSON(file, (jsonData) => store_rows_from_json(jsonData));
    } else {
      alert('Extensions allowed are xlsx and csv.');
      remove_loading();
    }
  };

  const newDataset = () => {
    setModalDescription("New dataset");
    setSpreadsheetId(null);
    setDatasetName("");
    setError("");
    setShowModal(true);
    const itemInput = document.getElementById("datasetNameInput");
    setTimeout(() => { itemInput && itemInput.focus() }, 1);
  };

  const downloadCSVTemplate = () => {
    const headers = ['company ticker', 'year', 'company', 'cofileinitals', 'ESG spending numerical category',
      'csr spending amount(in millions of USD)', 'csr spending description', 'pledge', 'overmultipleyears',
      'rationumbersreported', 'rationumbersreportedinUS', 'RationumbersreportedGlobal', 'state',
      'Number of employees', 'company revenue', 'Company market value', 'Industry numerical sub-category',
      'Industry sub-category description', 'Industry category', 'Industry category category description',
      'ESG spending category', 'ESG spending category description', 'Company region'];
    const headersRow = headers.join(',')
    const blob = new Blob([headersRow], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'template_headers.csv');
    a.click()
  }

  const addRowsToDataset = (spreadsheet) => {
    setModalDescription("Add entries to dataset");
    setSpreadsheetId(spreadsheet.id);
    setDatasetName(spreadsheet.name);
    setError("");
    setShowModal(true);
    const itemInput = document.getElementById("datasetNameInput");
    setTimeout(() => { itemInput && itemInput.focus() }, 1);
  };

  const displaySharedModal = (spreadsheet) => {
    setModalDescription("Permissions for spreadsheet: " + spreadsheet.name);
    setSpreadsheetId(spreadsheet.id);
    setSharedWithEmails(spreadsheet.shared_with_emails);
    setError("");
    setShowPermissionsModal(true);
  }

  window.addEventListener('keyup', (ev) => {
    doIfEscapePressed(ev, () => { setShowModal(false); })
  }, false);

  const deleteDataset = (datasetId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FBB142',
      cancelButtonColor: '#434575',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        delete_dataset_api(datasetId, () => {
          Swal.fire({
            title: 'Deleted!',
            text: "",
            icon: 'success',
            timer: 1000,
          });
          getData();
        });
      }
    });
  };

  const removeRelation = (datasetId, userId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FBB142',
      cancelButtonColor: '#434575',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        unshare_spreadsheet_api(userId, datasetId, () => {
          Swal.fire({
            title: 'Deleted!',
            text: "",
            icon: 'success',
            timer: 1000,
          });
          getData();
          let newSharedWithEmails = [...sharedWithEmails].filter(x => x.id != userId);
          setSharedWithEmails(newSharedWithEmails);
        });
      }
    });
  }

  const addRelation = (datasetId, email) => {
    setError('');
    share_spreadsheet_api(email, datasetId, (newRelation) => {
      getData();
      let newSharedWithEmails = [...sharedWithEmails];
      console.log(newSharedWithEmails)
      if (newRelation.addedUser) {
        newSharedWithEmails.push(newRelation.addedUser);
      }
      setSharedWithEmails(newSharedWithEmails);
    }, (detail) => setError(detail));
  }

  const isAdminBool = userInfo != null && userInfo.is_admin ? true : false;
  if (isAdminBool && newEmailToShare === '' && userInfo.existingMails.length) {
    setNewEmailToShare(userInfo.existingMails[0]);
  }

  return (
    <div>
      <NewDatasetModal showModal={showModal} setShowModal={setShowModal}
        modalDescription={modalDescription} saveNewDataset={saveNewDataset}
        datasetName={datasetName} setDatasetName={setDatasetName}
        btnText={spreadsheetId === null ? "Create" : "Add rows"}
        error={error} setError={setError}
        fileLoaded={fileLoaded} setFileLoaded={setFileLoaded}
      />
      <ShareDatasetModal showModal={showPermissionsModal} setShowModal={setShowPermissionsModal}
        modalDescription={modalDescription}
        removeRelation={removeRelation} addRelation={addRelation}
        sharedWithEmails={sharedWithEmails}
        error={error} setError={setError}
        spreadsheetId={spreadsheetId}
        newEmailToShare={newEmailToShare} setNewEmailToShare={setNewEmailToShare}
        existingMails={isAdminBool ? userInfo.existingMails : []}
      />
      <AppHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true} />
      <UserHeader
        loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername}
        redirectWhenLoggedOut={true}
        viewName="datasets"
        pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
        is_admin={isAdminBool}
        tickets_count={userInfo != null ? userInfo.tickets_count : 0}
        is_client_admin={userInfo != null ? userInfo.is_client_admin : false}
      />
      <div className='container_div'>
        {userInfo && userInfo.is_admin ?
          <div>
            <button className="btn btn-primary" onClick={newDataset}
              style={{ marginBottom: "1em", backgroundColor: "#434575", borderColor: "#434575" }}>New dataset</button>
            <button className="btn btn-primary" onClick={downloadCSVTemplate} style={{ float: "right", marginBottom: "1em", marginLeft: "1em", backgroundColor: "#434575", borderColor: "#434575" }}>Download CSV Template</button>
          </div> : null
        }
        {userInfo && (userInfo.is_admin || userInfo.is_client_admin) ?
          <div>
            <h2>My Datasets</h2>
            <table className="table table-hover caption-top" style={{ "textAlign": "center" }}>
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Rows count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(allDatasets.my_sheets || []).map((row) =>
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.rows_count}</td>
                    <td>
                      <a className="btn btn-hover" style={{ marginRight: "0.5em", border: "solid 1px" }} href={"/datasets/" + row.id}>View dashboard</a>
                      {userInfo.is_admin ?
                        [

                          <a key={1} className="btn btn-hover" style={{ marginRight: "0.5em", border: "solid 1px" }} onClick={() => { addRowsToDataset(row) }}>Add entries</a>,
                          <a key={2} className="btn btn-hover" style={{ marginRight: "0.5em", border: "solid 1px" }} onClick={() => { displaySharedModal(row) }}>Share with...</a>,
                          <a key={3} className="btn btn-hover"
                            style={{ border: "solid 1px", display: isAdminBool ? 'inline-block' : 'none' }}
                            onClick={() => { downloadCsv(row.id, row.name) }}>Download csv</a>,
                          <a key={4} className="btn btn-hover" style={{ border: "solid 1px" }} onClick={() => { deleteDataset(row.id) }}>Delete</a>,
                        ]
                        : null
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <br />
          </div> : null
        }
      </div>
    </div>
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
