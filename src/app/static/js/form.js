'use strict';
const e = React.createElement;


function App() {
  const [formDataObject, setFormDataObject] = React.useState([]);
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [userInfo, setUserInfo] = React.useState(null);
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [selectedState, setSelectedState] = React.useState("");
  const [selectedIndustry, setSelectedIndustry] = React.useState("");
  const [selectedCompany, setSelectedCompany] = React.useState("");
  const [notFoundCompany, setNotFoundCompany] = React.useState("");
  const [didFindCompany, setDidFindCompany] = React.useState(true);
  const [stepIndex, setStepIndex] = React.useState(-1);
  const [allCheckedEfforts, setAllCheckedEfforts] = React.useState({});
  const [allCsrValuesBySubcategory, setAllCsrValuesBySubcategory] = React.useState({});

  const success = (data) => {
    setFormDataObject(data.data);
    setStepIndex(0);
    setSelectedCompany(data.data.companyOptions[0]);
    setSelectedIndustry(data.data.industriesOptions[0]);
    setSelectedState(data.data.stateOptions[0]);
  };

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    get_form_data_api(success, (text) => { console.log("Error: ", text) });
    get_user_data_api((data) => setUserInfo(data.data))
  };
  React.useEffect(() => {
    getData();
  }, []);

  const saveInputValues = () => {
    const newAllCsrValuesBySubcategory = allCsrValuesBySubcategory;
    for (const inputTxt of document.querySelectorAll('[id^=csr_value_txt]')) {
      const subcategory = parseInt(inputTxt.id.split('_')[3]);
      if (inputTxt.value) {
        newAllCsrValuesBySubcategory[subcategory] = inputTxt.value;
      } else {
        newAllCsrValuesBySubcategory[subcategory] = null;
      }
    }
    setAllCsrValuesBySubcategory(newAllCsrValuesBySubcategory);
    return newAllCsrValuesBySubcategory;
  }

  const storeRows = () => {
    var newAllCsrValuesBySubcategory = allCsrValuesBySubcategory;
    if (formDataObject.steps[stepIndex]['name'] === 'input_csr_values') {
      newAllCsrValuesBySubcategory = saveInputValues();
    }
    store_rows_from_form_api({
      allCsrValuesBySubcategory: newAllCsrValuesBySubcategory,
      selectedYear,
      companyName: didFindCompany ? selectedCompany : notFoundCompany,
      state: selectedState,
      industry: selectedIndustry,
    }, (data) => {
      alert(data.rows_added + ' new rows were added, thanks!')
    }, (data) => {
      if (data.show_errors) {
        alert(data.errors[0]);
      }
    });
  };

  const getPersonalInfoDiv = () => {
    return <div>
      <h4>Company Info</h4>
      <select disabled={!didFindCompany} value={selectedCompany}
        onChange={(e) => setSelectedCompany(e.target.value)}
      >
        {
          (formDataObject.companyOptions || []).map((companyName, idx) =>
            <option key={idx} value={companyName}>{companyName}</option>
          )
        }
      </select>
      <br />
      <input value={didFindCompany} onChange={(e) => {
        if (e.target.checked) {
          document.getElementById('other_company_txt').focus();
        }
        setDidFindCompany(!e.target.checked);
      }} type="checkbox" /><label>{'\xa0'}I did not find my company in the list</label>{'\xa0\xa0\xa0'}
      <input disabled={didFindCompany} id='other_company_txt'
        value={notFoundCompany}
        onChange={(e) => setNotFoundCompany(e.target.value)} />
      <br />
      <br />
      <label>Which of the following fiscal years would you like to help us update?</label>
      <br />
      <select value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
      >
        {
          (formDataObject.fiscalYears || []).map((year, idx) =>
            <option key={idx} value={year}>{year}</option>
          )
        }
      </select>
      <br />
      <br />
      <label>Select state for company's headquarters office</label>
      <br />
      <select value={selectedState}
        onChange={(e) => setSelectedState(e.target.value)}
      >
        {
          (formDataObject.stateOptions || []).map((stateName, idx) =>
            <option key={idx} value={stateName}>{stateName}</option>
          )
        }
      </select>
      <br />
      <br />
      <label>Select company's main industry</label>
      <br />
      <select value={selectedIndustry}
        onChange={(e) => setSelectedIndustry(e.target.value)}
      >
        {
          (formDataObject.industriesOptions || []).map((industry, idx) =>
            <option key={idx} value={industry}>{industry}</option>
          )
        }
      </select>
      <br />
      <br />
    </div>
  }

  const getSelectEffortsDiv = () => {
    var checkedSubCategories = [];
    for (const checkedEFfort of (allCheckedEfforts[formDataObject.steps[stepIndex]['category_name']] || [])) {
      checkedSubCategories.push(checkedEFfort['subcategory_num']);
    }
    return <div>
      {
        formDataObject.steps[stepIndex]['category_name'] !== 'Diversity Metrics' &&
        <h5>For the fiscal year {selectedYear}, do you have information regarding your organization's investment in the following {formDataObject.steps[stepIndex]['category_name']} efforts? (Please check all that apply)</h5>
      }
      {
        formDataObject.steps[stepIndex]['category_name'] === 'Diversity Metrics' &&
        <h5>For the fiscal year {selectedYear}, do you also happen to know any of the following? (Please check all that apply)</h5>
      }
      {
        (formDataObject.steps[stepIndex]['efforts'] || []).map((effort, effortIdx) =>
          <div key={effortIdx}>
            <input id={'effort_checkbox_' + effort['subcategory_num']}
              type="checkbox" defaultChecked={checkedSubCategories.includes(effort['subcategory_num'])} />
            <label style={{ fontWeight: 'lighter' }}>{effort['text']}</label>
          </div>
        )
      }
    </div >
  }

  const getInputCsrValuesDiv = () => {
    const tabCheckedEfforts = (allCheckedEfforts[formDataObject.steps[stepIndex]['category_name']] || []);
    return <div>
      <h6>Based on your responses, please fill in the information about this spending in the appropriate questions below</h6>
      {
        tabCheckedEfforts.map((effort, effortIdx) =>
          <div key={effortIdx} id={effort['subcategory_num'] + "_div"}>
            {formDataObject.steps[stepIndex]['category_name'] !== 'Diversity Metrics' &&
              <label style={{ fontWeight: 'normal' }}>Please enter the amount (in USD) you believe your organization has spent on <b>{effort['text']}</b> </label>
            }
            {formDataObject.steps[stepIndex]['category_name'] === 'Diversity Metrics' &&
              <label style={{ fontWeight: 'normal' }}>Please enter the information you have (as %) on <b>{effort['text']}</b> in {selectedYear}</label>
            }
            <input id={'csr_value_txt_' + effort['subcategory_num']} type="number"
              defaultValue={allCsrValuesBySubcategory[effort['subcategory_num'] || 0]}
              max={formDataObject.steps[stepIndex]['category_name'] === 'Diversity Metrics' ? 100 : null} />
          </div>
        )
      }
    </div>
  }

  const getFinalStepDiv = () => {
    var rowsToAddCount = Object.values(allCsrValuesBySubcategory).filter(x => x != null).length;
    return <div>
      <h6>You are going to add CSR values about {rowsToAddCount} different metrics. Submit to finish.</h6>
    </div>
  }

  const next = (currentStepIndexOrNull) => {
    const currentStepIndex = currentStepIndexOrNull || stepIndex;
    var shouldDoAnotherNext = false;
    const currentStepInfo = formDataObject.steps[currentStepIndex];
    if (currentStepInfo['efforts']) {
      let checkedEfforts = [];
      for (const effort of currentStepInfo['efforts']) {
        if (document.getElementById('effort_checkbox_' + effort['subcategory_num']).checked) {
          checkedEfforts.push({ 'text': effort['text'], 'subcategory_num': effort['subcategory_num'] })
        }
      }
      if (checkedEfforts.length === 0) {
        shouldDoAnotherNext = true;
      }
      var newAllCheckedEfforts = allCheckedEfforts;
      newAllCheckedEfforts[currentStepInfo['category_name']] = checkedEfforts;
      setAllCheckedEfforts(newAllCheckedEfforts);
    } else if (currentStepInfo['name'] === 'input_csr_values') {
      saveInputValues();
    }
    if (shouldDoAnotherNext) {
      next(currentStepIndex + 1);
    } else if (currentStepIndex < formDataObject.steps.length - 1) {
      setStepIndex(currentStepIndex + 1);
    }
  }

  const previous = () => {
    if (stepIndex > 0) {
      var previousStepIndex = stepIndex - 1;
      const previousCategoryStepInfo = formDataObject.steps[stepIndex - 1];
      if (previousCategoryStepInfo['name'] === 'input_csr_values' &&
        allCheckedEfforts[previousCategoryStepInfo['category_name']].length === 0) {
        previousStepIndex -= 1;
      }
    }
    setStepIndex(previousStepIndex);
  }


  return (
    <div>
      <AppHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true} />
      <UserHeader
        loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername}
        redirectWhenLoggedOut={true}
        viewName="tickets"
        pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
        is_admin={userInfo != null && userInfo.is_admin}
        tickets_count={userInfo != null ? userInfo.tickets_count : 0}
        is_client_admin={userInfo != null ? userInfo.is_client_admin : false}
      />
      <div className='container_div'>
        {
          formDataObject != null && stepIndex >= 0 && formDataObject.steps[stepIndex] != null && formDataObject.steps[stepIndex].name === 'personal_info' && getPersonalInfoDiv()
        }

        {
          formDataObject != null && stepIndex >= 0 && formDataObject.steps[stepIndex] != null && formDataObject.steps[stepIndex].name === 'select_efforts' && getSelectEffortsDiv()
        }

        {
          formDataObject != null && stepIndex >= 0 && formDataObject.steps[stepIndex] != null && formDataObject.steps[stepIndex].name === 'input_csr_values' && getInputCsrValuesDiv()
        }{
          formDataObject != null && stepIndex >= 0 && formDataObject.steps[stepIndex] != null && formDataObject.steps[stepIndex].name === 'final_step' && getFinalStepDiv()
        }
        {
          formDataObject != null &&
          stepIndex > 0 &&
          <button
            style={{ backgroundColor: "#434575", borderColor: "#434575", marginLeft: '10px', color: '#ffffff' }}
            type="submit" className="btn"
            onClick={previous}
          >Previous</button>
        }
        {
          formDataObject != null &&
          formDataObject.steps != null &&
          stepIndex === formDataObject.steps.length - 1 &&
          <button
            style={{ backgroundColor: "#434575", borderColor: "#434575", marginLeft: '10px', color: '#ffffff' }}
            type="submit" className="btn"
            onClick={storeRows}
          >Submit</button>
        }
        {
          formDataObject != null &&
          formDataObject.steps != null &&
          stepIndex < formDataObject.steps.length - 1 &&
          <button
            style={{ backgroundColor: "#434575", borderColor: "#434575", marginLeft: '10px', color: '#ffffff' }}
            type="submit" className="btn"
            onClick={() => next()}
          >Next</button>
        }
      </div>

      <br />
    </div >
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
