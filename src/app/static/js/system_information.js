'use strict';
const e = React.createElement;


function App() {
  const [arraysList, setArraysList] = React.useState([]);
  const [invertersList, setInvertersList] = React.useState([]);
  const [modalDescription, setModalDescription] = React.useState("");
  const [showArrayModal, setShowArrayModal] = React.useState(false);
  const [showInverterModal, setShowInverterModal] = React.useState(false);
  const [error, setError] = React.useState("");
  const [itemId, setItemId] = React.useState(null);
  const [inverterMake, setInverterMake] = React.useState("");
  const [inverterModel, setInverterModel] = React.useState("");
  const [inverterCapacity, setInverterCapacity] = React.useState(0);
  const [panelMake, setPanelMake] = React.useState("");
  const [panelModel, setPanelModel] = React.useState("");
  const [moduleCapacity, setModuleCapacity] = React.useState(0);
  const [numberOfModules, setNumberOfModules] = React.useState(0);
  const [arrayType, setArrayType] = React.useState(0);
  const [moduleType, setModuleType] = React.useState(0);
  const [azimuth, setAzimuth] = React.useState("");
  const [tiltAngle, setTiltAngle] = React.useState("");
  const [losses, setLosses] = React.useState(14);
  const [note, setNote] = React.useState("");
  const [selectedInverter, setSelectedInverter] = React.useState(null);
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [systemData, setSystemData] = React.useState(null);
  const [userInfo, setUserInfo] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");

  const TRANSLATED_STRINGS = {
    "empty_panel_make": { "en": "Make cannot be empty", },
    "empty_make_and_model": { "en": "Make and model cannot be empty", },
    "create_inverter": { "en": "Add Inverter" },
    "create_solar_array": { "en": "Add Array" },
    "see_dashboard": { "en": "Dashboard" },
    "edit_solar_array": { "en": "Edit array" },
    "edit_inverter": { "en": "Edit inverter" },
    "inverterMakeAndModel_header": { "en": "Inverter" },
    "azimuth_header": { "en": "Azimuth" },
    "solarPanelMake_header": { "en": "Solar Panel Make" },
    "solarPanelModel_header": { "en": "Solar Panel Model" },
    "moduleCapacity_header": { "en": "Module Capacity" },
    "numberOfModules_header": { "en": "# Modules" },
    "tiltAngle_header": { "en": "Tilt Angle" },
    "losses_header": { "en": "losses" },
    "arrayType_header": { "en": "Array type" },
    "moduleType_header": { "en": "Module type" },
    "note_header": { "en": "Note" },
    "lastPVWatts_header": { "en": "Last PVWatts" },

  };

  const systemId = getSystemId();

  const createSolarArray = (e) => {
    e.preventDefault();
    setError("");
    if (panelMake === "") {
      setError(TRANSLATED_STRINGS["empty_panel_make"][pageLanguage]);
      return;
    }
    if (!moduleCapacity) {
      setError("Module capacity must be positive");
      return;
    }
    if (!numberOfModules) {
      setError("Number of modules must be positive");
      return;
    }
    document.querySelector("#createArrayBtn").setAttribute("disabled", "true");
    if (itemId == null) {
      post_solar_array_api(systemId, {
        inverterId: selectedInverter,
        panelMake, panelModel, moduleCapacity,
        numberOfModules, azimuth, tiltAngle,
        note, arrayType, moduleType, losses
      },
        (solarArray) => {
          getData();
          document.querySelector("#createArrayBtn").removeAttribute("disabled");
          setShowArrayModal(false);
        }, (err) => {
          document.querySelector("#createArrayBtn").removeAttribute("disabled");
          setError(err["errors"][0]);
        });
    } else {
      put_solar_array_api(systemId, itemId, {
        inverterId: selectedInverter,
        panelMake, panelModel, moduleCapacity,
        numberOfModules, azimuth, tiltAngle,
        note, arrayType, moduleType, losses
      },
        (solarArray) => {
          document.querySelector("#createArrayBtn").removeAttribute("disabled");
          getData();
          setShowArrayModal(false);
        }, (err) => {
          document.querySelector("#createArrayBtn").removeAttribute("disabled");
          setError(err["errors"][0]);
        });
    }
  };

  const deleteSolarArray = (arrayId) => {
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
        delete_solar_array_api(systemId, arrayId, () => {
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

  const createInverter = (e) => {
    e.preventDefault();
    setError("");
    if (inverterMake === "") {
      setError(TRANSLATED_STRINGS["empty_make_and_model"][pageLanguage]);
      return;
    }
    if (inverterModel === "") {
      setError("Inverter model cannot be empty");
      return;
    }
    document.querySelector("#createInverterBtn").setAttribute("disabled", "true");
    if (itemId == null) {
      post_inverter_api(systemId, {
        inverterMake, inverterModel, inverterCapacity
      },
        (inverter) => {
          getData();
          document.querySelector("#createInverterBtn").removeAttribute("disabled");
          setShowInverterModal(false);
        }, (err) => {
          document.querySelector("#createInverterBtn").removeAttribute("disabled");
          setError(err["errors"][0]);
        });
    } else {
      put_inverter_api(systemId, itemId, {
        inverterMake, inverterModel, inverterCapacity
      },
        (solarArray) => {
          getData();
          document.querySelector("#createArrayBtn").removeAttribute("disabled");
          setShowInverterModal(false);
        }, (err) => {
          document.querySelector("#createArrayBtn").removeAttribute("disabled");
          setError(err["errors"][0]);
        });
    }
  };

  const deleteInverter = (inverterId) => {
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
        delete_inverter_api(systemId, inverterId, () => {
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

  const newSolarArray = (inverter_id) => {
    setModalDescription("New solar array");
    setSelectedInverter(inverter_id);
    setItemId(null);
    setPanelMake("");
    setPanelModel("");
    setModuleCapacity(0);
    setNumberOfModules(1);
    setAzimuth(0);
    setTiltAngle(0);
    setLosses(14);
    setNote("");
    setArrayType(0);
    setModuleType(0);
    setError("");
    setShowArrayModal(true);
    const firstInput = document.getElementById("panelMakeInput");
    setTimeout(() => { firstInput && firstInput.focus() }, 1);
  };

  const editSolarArray = (data) => {
    setModalDescription("Edit array " + data.id);
    setSelectedInverter(data.inverter);
    setItemId(data.id);
    setPanelMake(data.panel_make);
    setPanelModel(data.panel_model);
    setModuleCapacity(data.module_capacity);
    setNumberOfModules(data.number_of_modules);
    setAzimuth(data.azimuth);
    setTiltAngle(data.tilt_angle);
    setArrayType(data.array_type);
    setModuleType(data.module_type);
    setLosses(data.losses);
    setNote(data.note);
    setError("");
    setShowArrayModal(true);
  };

  const newInverter = () => {
    setModalDescription("New inverter");
    setItemId(null);
    setInverterMake("");
    setInverterModel("");
    setError("");
    setShowInverterModal(true);
    const firstInput = document.getElementById("inverterMakeInput");
    setTimeout(() => { firstInput && firstInput.focus() }, 1);
  };

  const editInverter = (data) => {
    setModalDescription("Edit inverter " + data.id);
    setItemId(data.id);
    setInverterMake(data.make);
    setInverterModel(data.model);
    setError("");
    setShowInverterModal(true);
  };

  window.addEventListener('keyup', (ev) => {
    doIfEscapePressed(ev, () => { setShowInverterModal(false); setShowArrayModal(false); })
  }, false);

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    get_inverters_api(systemId, (data) => {
      setInvertersList(data.data);
    });
    get_solar_arrays_api(systemId, (data) => setArraysList(data.data));
    get_system_info_api(systemId, (data) => setSystemData(data.data));
    get_user_data_api((data) => setUserInfo(data.data));
  };
  React.useEffect(() => {
    getData();
  }, []);

  getLoggedInUsername((username) => { setLoggedInUsername(username) });

  return (
    <div>
      <AppHeader />
      <InverterModal showModal={showInverterModal} setShowModal={setShowInverterModal}
        modalDescription={modalDescription} pageLanguage={pageLanguage}
        inverterMake={inverterMake} setInverterMake={setInverterMake}
        inverterModel={inverterModel} setInverterModel={setInverterModel}
        inverterCapacity={inverterCapacity} setInverterCapacity={setInverterCapacity}
        onclickFnc={createInverter}
        error={error}
        btnText={itemId == null ? TRANSLATED_STRINGS["create_inverter"][pageLanguage] : TRANSLATED_STRINGS["edit_inverter"][pageLanguage]}
      />
      <SolarArrayModal showModal={showArrayModal} setShowModal={setShowArrayModal}
        modalDescription={modalDescription}
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
        selectedInverter={selectedInverter}
        error={error} btnText={itemId == null ? TRANSLATED_STRINGS["create_solar_array"][pageLanguage] : TRANSLATED_STRINGS["edit_solar_array"][pageLanguage]}
        onclickFnc={createSolarArray}
        pageLanguage={pageLanguage} />
      <UserHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true}
        is_admin={userInfo && userInfo.is_admin} pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
      />
      <SystemHeader systemData={systemData} is_system_view={true} />
      <SolarEdgeSystemInformation
        invertersList={invertersList} systemData={systemData}
        arraysList={arraysList}
      />
      <EnphaseSystemInformation
        invertersList={invertersList} systemData={systemData}
        arraysList={arraysList}
      />
    </div>);
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);

