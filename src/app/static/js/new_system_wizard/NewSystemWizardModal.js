'use strict';

// STEPS = [brand, location, siteid, SEinventory, ENinventory, newarray, moneyrate]

class NewSystemWizardModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            steps: [],
            currentStep: "brand",
            currentInverterIndex: 0,
            currentArrayIndex: 0,
            inverters: [],
            arrays: [this._getEmptyArray()],
        };
    }

    _getEmptyArray = () => {
        return {
            inverter_indexes: [],
            panelMake: "", panelModel: "", moduleCapacity: 0,
            numberOfModules: 0, azimuth: 0, tiltAngle: 0, note: "",
            arrayType: 0, moduleType: 0, losses: 14,
        }
    }

    _previousInverter = () => {
        if (this.state.currentInverterIndex > 0) {
            this.setState({
                currentInverterIndex: this.state.currentInverterIndex - 1,
            })
        }
    }
    _nextInverter = () => {
        if (this.state.currentInverterIndex < this.state.inverters.length - 1) {
            this.setState({
                currentInverterIndex: this.state.currentInverterIndex + 1,
            })
        }
    }

    _loadArrayValues = (array) => {
        document.getElementById("wizardPanelMakeInput").value = array.panelMake;
        document.getElementById("wizardPanelModelInput").value = array.panelModel;
        document.getElementById("wizardNumberOfModulesInput").value = array.numberOfModules;
        document.getElementById("wizardModuleCapacityInput").value = array.moduleCapacity;
        document.getElementById("wizardAzimuthInput").value = array.azimuth;
        document.getElementById("wizardTiltAngleInput").value = array.tiltAngle;
        document.getElementById("wizardLossesInput").value = array.losses;
        document.getElementById("wizardModuleType").value = array.moduleType;
        document.getElementById("wizardArrayType").value = array.arrayType;
        document.getElementById("wizardNoteInput").value = array.note;
    }

    _saveArray = () => {
        let array = {};
        array['inverter_indexes'] = this.state.arrays[this.state.currentArrayIndex]['inverter_indexes'];
        array.panelMake = document.getElementById("wizardPanelMakeInput").value;
        array.panelModel = document.getElementById("wizardPanelModelInput").value;
        array.numberOfModules = parseInt(document.getElementById("wizardNumberOfModulesInput").value);
        array.moduleCapacity = parseInt(document.getElementById("wizardModuleCapacityInput").value);
        array.azimuth = parseInt(document.getElementById("wizardAzimuthInput").value);
        array.tiltAngle = parseInt(document.getElementById("wizardTiltAngleInput").value);
        array.losses = parseInt(document.getElementById("wizardLossesInput").value);
        array.moduleType = document.getElementById("wizardModuleType").value;
        array.arrayType = document.getElementById("wizardArrayType").value;
        array.note = document.getElementById("wizardNoteInput").value;
        let newArrays = this.state.arrays;
        newArrays[this.state.currentArrayIndex] = array;
        this.setState({
            arrays: newArrays,
        });
        return [newArrays, array];
    }

    _previousArray = () => {
        this._saveArray();
        if (this.state.currentArrayIndex > 0) {
            this._loadArrayValues(this.state.arrays[this.state.currentArrayIndex - 1]);
            this.setState({
                currentArrayIndex: this.state.currentArrayIndex - 1,
            })
        }
    }

    _nextArray = () => {
        const [allArrays, _array] = this._saveArray();
        if (this.state.currentArrayIndex < this.state.arrays.length - 1) {
            this._loadArrayValues(this.state.arrays[this.state.currentArrayIndex + 1]);
            this.setState({
                currentArrayIndex: this.state.currentArrayIndex + 1,
            })
        } else {
            let newArrays = allArrays;
            const emptyArray = this._getEmptyArray();
            newArrays.push(emptyArray);
            this.setState({
                currentArrayIndex: this.state.currentArrayIndex + 1,
                arrays: newArrays,
            })
            this._loadArrayValues(emptyArray);
        }
    }

    _addToInverter = () => {
        const [allArrays, array] = this._saveArray();
        array['inverter_indexes'].push(this.state.currentInverterIndex);
        let newArrays = [...allArrays];
        newArrays[this.state.currentArrayIndex] = array;
        let inv = this.state.inverters[this.state.currentInverterIndex];
        inv['assigned_arrays'].push(this.state.currentArrayIndex);
        let newInverters = [...this.state.inverters];
        newInverters[this.state.currentInverterIndex] = inv;
        this.setState({
            arrays: newArrays,
            inverters: newInverters,
        })
    }

    _removeFromInverter = () => {
        let array = this.state.arrays[this.state.currentArrayIndex];
        const index_in_inverters_list = array['inverter_indexes'].indexOf(this.state.currentInverterIndex);
        if (index_in_inverters_list > -1) {
            const left = [...array['inverter_indexes'].slice(0, index_in_inverters_list)];
            const right = [...array['inverter_indexes'].slice(index_in_inverters_list + 1)];
            array['inverter_indexes'] = left.concat(right);
        }
        let newArrays = [...this.state.arrays];
        newArrays[this.state.currentArrayIndex] = array;
        let inv = this.state.inverters[this.state.currentInverterIndex];
        const index_in_arrays_list = inv['assigned_arrays'].indexOf(this.state.currentArrayIndex);
        if (index_in_arrays_list > -1) {
            const left = [...inv['assigned_arrays'].slice(0, index_in_arrays_list)];
            const right = [...inv['assigned_arrays'].slice(index_in_arrays_list + 1)];
            inv['assigned_arrays'] = left.concat(right);
        }
        let newInverters = [...this.state.inverters];
        newInverters[this.state.currentInverterIndex] = inv;
        this.setState({
            arrays: newArrays,
            inverters: newInverters,
        })
    }

    _deleteArray = () => {
        if (this.state.length === 1) {
            return;
        }
        this._removeFromInverter();
        const left = [...this.state.arrays.slice(0, this.state.currentArrayIndex)];
        const right = [...this.state.arrays.slice(this.state.currentArrayIndex + 1)];
        const newArrays = left.concat(right);
        let newArrayIndex = this.state.currentArrayIndex;
        if (this.state.currentArrayIndex + 1 < this.state.arrays.length) {
            this._loadArrayValues(this.state.arrays[this.state.currentArrayIndex + 1]);
        } else {
            this._loadArrayValues(this.state.arrays[this.state.currentArrayIndex - 1]);
            newArrayIndex = newArrayIndex - 1;
        }
        this.setState({
            arrays: newArrays,
            currentArrayIndex: newArrayIndex,
        });
    }

    _getSiteInventory = () => {
        if (this.props.inverterBrand === "SolarEdge") {
            get_solar_edge_client_inventory_api(this.props.siteID, (data) => {
                this.props.setSiteInventory(data.data);
                let invs = [...data.data["inverters"]];
                for (let inv of invs) {
                    inv['assigned_arrays'] = [];
                }
                this.setState({
                    inverters: invs
                });
                // setSystemLocationAddress(data.data.location_address);
            }, () => {
                this.props.setSiteInventory(null);
                this.props.setError('Inventory could not be retrieved');
            });
        }
        if (this.props.inverterBrand === "Enphase") {
            get_enphase_client_inventory_api(this.props.siteID, (data) => {
                this.props.setSiteInventory(data.data);
                let invs = [...data.data["inverters"]];
                for (let inv of invs) {
                    inv['assigned_arrays'] = [];
                }
                this.setState({
                    inverters: invs
                });
                // setSystemLocationAddress(data.data.location_address);
            }, () => {
                this.props.setSiteInventory(null);
                this.props.setError('Inventory could not be retrieved');
            });
        }
    };

    _focusForCurrentStep = (step) => {
        let idToFocus = null;
        if (step === "brand") {
            idToFocus = "wizardInverterBrandInput";
        } else if (step === "location") {
            idToFocus = "wizardSystemLocationAddressInput";
        } else if (step === "siteid") {
            if (this.props.siteID === "") {
                idToFocus = "wizardSiteIdInput";
            } else {
                idToFocus = "nextButton";
            }
        } else if (step === "SEinventory" || step === "ENinventory") {
            idToFocus = "nextButton";
        } else if (step === "newarray") {
            idToFocus = "wizardPanelMakeInput";
        }
        if (idToFocus != null) {
            setTimeout(() => {
                const itemInput = document.getElementById(idToFocus);
                if (itemInput) {
                    itemInput.focus();
                }
            }, 100);
        }
    };

    _next = () => {
        this.props.setError("");
        let currentStep = this.state.currentStep;
        let currentInverterIndex = this.state.currentInverterIndex;
        let currentArrayIndex = this.state.currentArrayIndex;
        let currentInverters = [...this.state.inverters];
        let currentArrays = [...this.state.arrays];
        if (currentStep === "brand") {
            currentStep = "location";
        } else if (currentStep === "location") {
            currentStep = "siteid";
            this.props.getClientInfo();
        } else if (currentStep === "siteid") {
            //if (this.props.siteIDmanualInput) {
            //    this.props.setSiteID(document.getElementById("wizardSiteIdInput").value);
            //}
            if (this.props.inverterBrand === "SolarEdge") {
                currentStep = "SEinventory";
            }
            if (this.props.inverterBrand === "Enphase") {
                currentStep = "ENinventory";
            }
        } else if (currentStep === "SEinventory") {
            currentInverters = this.props.siteInventory["inverters"];
            currentStep = "newarray";
            currentInverterIndex = 0;
            currentArrayIndex = 0;
        } else if (currentStep === "ENinventory") {
            // FIXME
            currentInverters = this.props.siteInventory["inverters"];
            currentStep = "newarray";
            currentInverterIndex = 0;
            currentArrayIndex = 0;
        } else if (currentStep === "newarray") {
            const [allArrays, _array] = this._saveArray();
            currentArrays = allArrays;
            currentStep = "moneyrate";
        } else if (currentStep === "moneyrate") {
            this.props.setError("");
            this.props.setShowWizard(false);
            add_loading(document.body);
            create_system_from_wizard_api({
                arrays: this.state.arrays,
                system: {
                    systemName: this.props.systemName,
                    systemLocationAddress: this.props.systemLocationAddress,
                    systemLocationLongitude: "",
                    systemLocationLatitude: "",
                    systemId: this.props.siteID,
                    apiName: this.props.inverterBrand,
                    moneyRateInfo: { 'utilityName': this.props.selectedUtilityName, 'utilityRate': this.props.selectedUtilityRate }
                },
                inverters: this.state.inverters,
                apiName: this.props.inverterBrand,
            }, () => {
                alert("System created!");
                remove_loading();
                this.props.doAfterSave();
            }, (errors) => {
                this.props.setShowWizard(true);
                this.props.setError(errors.join('<br/>'));
                remove_loading();
            });
        }
        this._focusForCurrentStep(currentStep);
        this.setState({
            currentStep: currentStep,
            currentInverterIndex: currentInverterIndex,
            currentArrayIndex: currentArrayIndex,
            inverters: currentInverters,
            arrays: currentArrays,
        });
    }

    _prev = () => {
        let currentStep = this.state.currentStep;
        let currentInverterIndex = this.state.currentInverterIndex;
        let currentArrayIndex = this.state.currentArrayIndex;
        let currentInverters = [...this.state.inverters];
        let currentArrays = [...this.state.arrays];
        if (currentStep === "brand") {
            return;
        } else if (currentStep === "location") {
            currentStep = "brand";
        } else if (currentStep === "siteid") {
            currentStep = "location";
            this.props.setSiteID("");
        } else if (currentStep === "SEinventory" || currentStep === "ENinventory") {
            currentStep = "siteid";
            this.props.setSiteInventory(null);
        } else if (currentStep === "newarray") {
            this._saveArray();
            if (this.props.inverterBrand === "SolarEdge") {
                currentStep = "SEinventory";
            }
            if (this.props.inverterBrand === "Enphase") {
                currentStep = "ENinventory";
            }
        } else if (currentStep === "moneyrate") {
            currentStep = "newarray";
            this._loadArrayValues(this.state.arrays[this.state.currentArrayIndex]);
        }

        this.props.setError("");
        this.props.setNextBtnDisabled(false);
        this._focusForCurrentStep(currentStep);
        this.setState({
            currentStep: currentStep,
            currentArrayIndex: currentArrayIndex,
            currentInverterIndex: currentInverterIndex,
            arrays: currentArrays,
            inverters: currentInverters,
        });
    }

    _nextBtnDisabled = () => {
        if (this.props.nextBtnDisabled) {
            return true;
        }
        if (this.state.currentStep === "brand") {
            return false;
        }
        if (this.state.currentStep === "location") {
            return this.props.systemLocationAddress === "" || this.props.systemLocationCity === "" ||
                this.props.systemLocationState === "" || this.props.systemLocationZipCode === "";
        }
        if (this.state.currentStep === "siteid") {
            if (this.props.siteIDmanualInput) {
                return this.props.nextBtnDisabled;
            } else {
                return this.props.siteID === "";
            }
        }
        if (this.state.currentStep === "newarray") {
            for (const inv of this.state.inverters) {
                if (inv['assigned_arrays'].length === 0) {
                    return true;
                }
            }
            for (const arr of this.state.arrays) {
                if (arr['inverter_indexes'].length === 0) {
                    return true;
                }
            }
        }
        if (this.state.currentStep === "moneyrate") {
            return this.props.selectedUtilityName == null || this.props.selectedUtilityRate == null || this.props.selectedUtilityName == '' || this.props.selectedUtilityRate == '';
        }
        if (this.props.inverterBrand === "SolarEdge") {
            if (this.state.currentStep === "SEinventory" || this.state.currentStep === "ENinventory") {
                return this.props.siteInventory === null;
            }
        }
        return false;
    }


    render() {

        return <div style={{ background: "#00000060" }}
            className={"modal " + (this.props.showWizard ? " show d-block" : " d-none")} tabIndex="-1" role="dialog">
            <div className="modal-dialog shadow">
                <form method="post">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{this.props.modalDescription}</h5>
                            <button type="button" className="btn-close" onClick={() => { this.props.setShowWizard(false) }} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div>
                                <StepInverterBrand
                                    systemName={this.props.systemName} setSystemName={this.props.setSystemName}
                                    currentStep={this.state.currentStep}
                                    inverterBrand={this.props.inverterBrand} setInverterBrand={this.props.setInverterBrand}
                                />
                                <Step1SolarEdge currentStep={this.state.currentStep} inverterBrand={this.props.inverterBrand} setSiteID={this.props.setSiteID}
                                    systemLocationAddress={this.props.systemLocationAddress} setSystemLocationAddress={this.props.setSystemLocationAddress}
                                    systemLocationCity={this.props.systemLocationCity} setSystemLocationCity={this.props.setSystemLocationCity}
                                    systemLocationState={this.props.systemLocationState} setSystemLocationState={this.props.setSystemLocationState}
                                    systemLocationZipCode={this.props.systemLocationZipCode} setSystemLocationZipCode={this.props.setSystemLocationZipCode}
                                />
                                <Step2SolarEdge currentStep={this.state.currentStep}
                                    inverterBrand={this.props.inverterBrand}
                                    siteID={this.props.siteID} setSiteID={this.props.setSiteID}
                                    siteIDmanualInput={this.props.siteIDmanualInput}
                                    getClientInfo={this.props.getClientInfo}
                                    setNextBtnDisabled={this.props.setNextBtnDisabled}
                                    error={this.props.error}
                                />
                                <Step3SolarEdge
                                    currentStep={this.state.currentStep}
                                    inverterBrand={this.props.inverterBrand}
                                    siteID={this.props.siteID}
                                    getSiteInventory={this._getSiteInventory}
                                    siteInventory={this.props.siteInventory}
                                />
                                <StepNewArraySolarEdge
                                    inverterBrand={this.props.inverterBrand} siteID={this.props.siteID}
                                    currentStep={this.state.currentStep}
                                    modalDescription={this.props.modalDescription}
                                    error={this.props.error} btnText={"New array"}
                                    pageLanguage={this.props.pageLanguage}
                                    inverterIndex={this.state.currentInverterIndex}
                                    arrayIndex={this.state.currentArrayIndex}
                                    inverters={this.state.inverters}
                                    arrays={this.state.arrays}
                                    previousInverter={this._previousInverter}
                                    nextInverter={this._nextInverter}
                                    previousArray={this._previousArray}
                                    nextArray={this._nextArray}
                                    addToInverter={this._addToInverter}
                                    removeFromInverter={this._removeFromInverter}
                                    deleteArray={this._deleteArray}
                                />
                                <StepNewArrayEnphase
                                    inverterBrand={this.props.inverterBrand} siteID={this.props.siteID}
                                    currentStep={this.state.currentStep}
                                    modalDescription={this.props.modalDescription}
                                    error={this.props.error} btnText={"New array"}
                                    pageLanguage={this.props.pageLanguage}
                                    inverterIndex={this.state.currentInverterIndex}
                                    arrayIndex={this.state.currentArrayIndex}
                                    inverters={this.state.inverters}
                                    arrays={this.state.arrays}
                                    previousInverter={this._previousInverter}
                                    nextInverter={this._nextInverter}
                                    previousArray={this._previousArray}
                                    nextArray={this._nextArray}
                                    addToInverter={this._addToInverter}
                                    removeFromInverter={this._removeFromInverter}
                                    deleteArray={this._deleteArray}
                                />
                                <StepMoneyRate
                                    currentStep={this.state.currentStep}
                                    ratesArray={this.props.ratesArray}
                                    setRatesArray={this.props.setRatesArray}
                                    selectedUtilityName={this.props.selectedUtilityName}
                                    setSelectedUtilityName={this.props.setSelectedUtilityName}
                                    selectedUtilityRate={this.props.selectedUtilityRate}
                                    setSelectedUtilityRate={this.props.setSelectedUtilityRate}
                                />
                                <small className="form-text text-muted">{this.props.error}</small>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" disabled={this.state.currentStep === 0} className="btn btn-secondary" onClick={this._prev} data-bs-dismiss="modal">Back</button>
                            <button type="button" disabled={this._nextBtnDisabled()}
                                className="btn btn-primary" onClick={this._next}
                                id="nextButton"
                                style={{ backgroundColor: "#402E32", borderColor: "#402E32" }}>
                                {this.state.currentStep === "moneyrate" ? "Finish" : "Next"}
                            </button>
                        </div>
                    </div>
                </form>
            </div >
        </div >
    }
}