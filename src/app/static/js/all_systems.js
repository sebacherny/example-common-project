'use strict';
const e = React.createElement;


function App() {
  const [list, setList] = React.useState([]);
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [showModal, setShowModal] = React.useState(false);
  const [showWizard, setShowWizard] = React.useState(false);
  const [modalDescription, setModalDescription] = React.useState("");
  const [itemId, setItemId] = React.useState(null);
  const [error, setError] = React.useState("");
  const [systemName, setSystemName] = React.useState("");
  const [systemLocationAddress, setSystemLocationAddress] = React.useState("");
  const [systemLocationCity, setSystemLocationCity] = React.useState("");
  const [systemLocationState, setSystemLocationState] = React.useState("");
  const [systemLocationZipCode, setSystemLocationZipCode] = React.useState("");
  const [systemLocationLongitude, setSystemLocationLongitude] = React.useState("");
  const [systemLocationLatitude, setSystemLocationLatitude] = React.useState("");
  const [siteID, setSiteID] = React.useState("");
  const [apiName, setApiName] = React.useState("SolarEdge");
  const [inverterBrand, setInverterBrand] = React.useState("SolarEdge");
  const [panelMake, setPanelMake] = React.useState("");
  const [panelModel, setPanelModel] = React.useState("");
  const [moduleCapacity, setModuleCapacity] = React.useState(0);
  const [numberOfModules, setNumberOfModules] = React.useState(0);
  const [arrayType, setArrayType] = React.useState(0);
  const [moduleType, setModuleType] = React.useState(0);
  const [azimuth, setAzimuth] = React.useState(0);
  const [tiltAngle, setTiltAngle] = React.useState(0);
  const [losses, setLosses] = React.useState(14);
  const [note, setNote] = React.useState("");
  const [selectedInverter, setSelectedInverter] = React.useState(null);
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(false);
  const [siteInventory, setSiteInventory] = React.useState(null);
  const [numberOfArrays, setNumberOfArrays] = React.useState(1);
  const [arrays, setArrays] = React.useState([]);
  const [siteIDmanualInput, setSiteIDmanualInput] = React.useState(false);
  const [ratesArray, setRatesArray] = React.useState([]);
  const [selectedUtilityName, setSelectedUtilityName] = React.useState('');
  const [selectedUtilityRate, setSelectedUtilityRate] = React.useState('');

  const success = (data) => {
    setList(data.data);
  };

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    get_all_systems_api(success, (text) => { console.log("Error: ", text) });
    get_all_rates_api((rates) => setRatesArray(rates), (text) => { console.log("Error: ", text) });
  };
  React.useEffect(() => {
    getData();
  }, []);

  const saveNewSystem = (e) => {
    e.preventDefault();
    setError("");
    if (!systemName) {
      setError("System name is required");
      return;
    }
    if (!systemLocationAddress) {
      setError("System location is required");
      return;
    }
    if (systemLocationLongitude && parseFloat(systemLocationLongitude).toString() !== systemLocationLongitude) {
      setError("Longitude must be a valid decimal value");
      return;
    }
    if (systemLocationLatitude && parseFloat(systemLocationLatitude).toString() !== systemLocationLatitude) {
      setError("Latitude must be a valid decimal value");
      return;
    }
    add_loading(window.document.body);
    if (itemId == null) {
      post_system_api({
        systemName, siteID,
        systemLocationAddress, systemLocationLongitude, systemLocationLatitude, apiName,
      }, () => {
        getData();
        remove_loading();
      });
    } else {
      put_system_api(itemId, {
        systemName, siteID,
        systemLocationAddress, systemLocationLongitude, systemLocationLatitude, apiName
      }, () => {
        getData();
        remove_loading();
      })
    }
    setShowModal(false);
  };

  const newSystemWizard = () => {
    setShowWizard(true);
    setTimeout(() => {
      const itemInput = document.getElementById("wizardInverterBrandInput");
      if (itemInput) {
        itemInput.focus();
      }
    }, 100);
  }

  const newSystem = () => {
    setModalDescription("New system");
    setItemId(null);
    setSystemName("");
    setSystemLocationAddress("");
    setSystemLocationLongitude("");
    setSystemLocationLatitude("");
    setSiteID("");
    setError("");
    setShowModal(true);
    const itemInput = document.getElementById("systemNameInput");
    setTimeout(() => { itemInput && itemInput.focus() }, 1);
  };

  const editSystem = (system) => {
    setModalDescription("Edit system");
    setItemId(system.id);
    setSystemName(system.name);
    setSystemLocationAddress(system.location_address);
    //setSystemLocationLongitude(system.location_longitude.toString() || "");
    //setSystemLocationLatitude(system.location_latitude.toString() || "");
    setSiteID("");
    setError("");
    setShowModal(true);
  };

  window.addEventListener('keyup', (ev) => {
    doIfEscapePressed(ev, () => { setShowModal(false); })
  }, false);

  const deleteSystem = (systemId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FBB142',
      cancelButtonColor: '#402E32',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        delete_system_api(systemId, () => {
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

  const getClientInfo = () => {
    setError("");
    setSiteID("");
    if (apiName === "SolarEdge") {
      get_solar_edge_client_api(systemLocationAddress, (data) => {
        setSiteID(data.data.user_id);
        setSiteIDmanualInput(false);
        // setSystemLocationAddress(data.data.location_address);
      }, () => {
        setSiteID("");
        setSiteIDmanualInput(true);
        setNextBtnDisabled(true);
        setError('That address does not correspond to any system. Please insert your ID manually');
      });
    }
    if (apiName === "Enphase") {
      get_enphase_client_api(systemLocationAddress, (data) => {
        setSiteID(data.data.user_id);
        setSiteIDmanualInput(false);
        setNextBtnDisabled(true);
        // setSystemLocationAddress(data.data.location_address);
      }, () => {
        setSiteID("");
        setSiteIDmanualInput(true);
      });
    }
  };

  const loadArrayValues = (arrayOrNull) => {
    if (arrayOrNull == null) {
      setPanelMake("");
      setPanelModel("");
      setModuleCapacity(0);
      setNumberOfModules(0);
      setAzimuth(0);
      setTiltAngle(0);
      setNote("");
      setArrayType(0);
      setModuleType(0);
      setLosses(14);
    } else {
      setPanelMake(arrayOrNull.panelMake);
      setPanelModel(arrayOrNull.panelModel);
      setModuleCapacity(arrayOrNull.moduleCapacity);
      setNumberOfModules(arrayOrNull.numberOfModules);
      setAzimuth(arrayOrNull.azimuth);
      setTiltAngle(arrayOrNull.tiltAngle);
      setNote(arrayOrNull.note);
      setArrayType(arrayOrNull.arrayType);
      setModuleType(arrayOrNull.moduleType);
      setLosses(arrayOrNull.losses);
    }
  }


  return (
    <div>
      <NewSystemModal showModal={showModal} setShowModal={setShowModal}
        modalDescription={modalDescription} saveNewSystem={saveNewSystem}
        systemName={systemName} setSystemName={setSystemName}
        systemLocationAddress={systemLocationAddress} setSystemLocationAddress={setSystemLocationAddress}
        systemLocationLongitude={systemLocationLongitude} setSystemLocationLongitude={setSystemLocationLongitude}
        systemLocationLatitude={systemLocationLatitude} setSystemLocationLatitude={setSystemLocationLatitude}
        siteID={siteID} setSiteID={setSiteID}
        btnText={itemId === null ? "Create" : "Edit"}
        error={error} setError={setError}
        apiName={apiName} setApiName={setApiName}
        getClientInfo={getClientInfo} />
      <NewSystemWizardModal showWizard={showWizard} setShowWizard={setShowWizard}
        modalDescription={modalDescription}
        saveNewSystem={saveNewSystem}
        systemName={systemName} setSystemName={setSystemName}
        systemLocationAddress={systemLocationAddress} setSystemLocationAddress={setSystemLocationAddress}
        systemLocationLongitude={systemLocationLongitude} setSystemLocationLongitude={setSystemLocationLongitude}
        systemLocationLatitude={systemLocationLatitude} setSystemLocationLatitude={setSystemLocationLatitude}
        systemLocationCity={systemLocationCity} setSystemLocationCity={setSystemLocationCity}
        systemLocationState={systemLocationState} setSystemLocationState={setSystemLocationState}
        systemLocationZipCode={systemLocationZipCode} setSystemLocationZipCode={setSystemLocationZipCode}
        siteID={siteID} setSiteID={setSiteID}
        btnText={itemId === null ? "Create" : "Edit"}
        error={error} setError={setError}
        inverterBrand={inverterBrand} setInverterBrand={setInverterBrand}
        getClientInfo={getClientInfo}
        siteIDmanualInput={siteIDmanualInput} setSiteIDmanualInput={setSiteIDmanualInput}
        loadArrayValues={loadArrayValues}
        doAfterSave={getData}
        siteInventory={siteInventory} setSiteInventory={setSiteInventory}
        panelMake={panelMake} setPanelMake={setPanelMake}
        panelModel={panelModel} setPanelModel={setPanelModel}
        moduleCapacity={moduleCapacity} setModuleCapacity={setModuleCapacity}
        numberOfModules={numberOfModules} setNumberOfModules={setNumberOfModules}
        azimuth={azimuth} setAzimuth={setAzimuth}
        tiltAngle={tiltAngle} setTiltAngle={setTiltAngle}
        losses={losses} setLosses={setLosses}
        note={note} setNote={setNote}
        arrayType={arrayType} setArrayType={setArrayType}
        moduleType={moduleType} setModuleType={setModuleType}
        selectedInverter={selectedInverter} setSelectedInverter={setSelectedInverter}
        pageLanguage={pageLanguage}
        nextBtnDisabled={nextBtnDisabled} setNextBtnDisabled={setNextBtnDisabled}
        numberOfArrays={numberOfArrays} setNumberOfArrays={setNumberOfArrays}
        arrays={arrays} setArrays={setArrays}
        ratesArray={ratesArray} setRatesArray={setRatesArray}
        selectedUtilityName={selectedUtilityName} setSelectedUtilityName={setSelectedUtilityName}
        selectedUtilityRate={selectedUtilityRate} setSelectedUtilityRate={setSelectedUtilityRate}
      />
      <AppHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true} />
      <UserHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true}
        viewName="systems" pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
      />
      <div style={{
        maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
        padding: "1em"
      }} className="shadow">
        <div>
          <a className="btn btn-primary" onClick={newSystem} style={{ backgroundColor: "#402E32", borderColor: "#402E32" }}>New system</a>
          <a className="btn btn-primary" onClick={newSystemWizard} style={{ backgroundColor: "#402E32", borderColor: "#402E32" }}>New system (WIZARD)</a>
        </div>
        <table className="table table-hover caption-top" style={{ "textAlign": "center" }}>
          <thead className="table-light">
            <tr>
              <th>System Name</th>
              <th>System Location</th>
              <th>System ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) =>
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.location_string}</td>
                <td>{row.system_id}</td>
                <td>
                  <a className="btn btn-hover" style={{ border: "solid 1px" }} href={"/systems/" + row.id}>View arrays</a>
                  <a className="btn btn-hover" style={{ border: "solid 1px" }} onClick={() => { deleteSystem(row.id) }}>Delete</a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
