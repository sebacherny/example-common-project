function add_loading(body) {
	const div = document.createElement("div");
	div.className = "loading";
	const closeBtn = document.createElement("button");
	closeBtn.textContent = "X";
	closeBtn.onclick = () => { remove_loading(this); }
	closeBtn.className = "btn btn-danger cross_button_for_loading";
	const minimizeBtn = document.createElement("button");
	minimizeBtn.textContent = "-";
	minimizeBtn.onclick = () => { minimize_loading(div); }
	minimizeBtn.className = "btn btn-danger minimize_button_for_loading";
	div.appendChild(closeBtn);
	div.appendChild(minimizeBtn);
	body.appendChild(div);
}

function remove_loading() {
	if (document.getElementsByClassName("loading").length > 0) {
		document.getElementsByClassName("loading")[0].remove();
	} else if (document.getElementsByClassName("minimized_loading").length > 0) {
		document.getElementsByClassName("minimized_loading")[0].remove();
	}
}

function remove_loading_from_button(e) {
	e.remove();
}

function minimize_loading(e) {
	e.className = "minimized_loading";
}

/* JQUERY 
function create_modal(header_txt, body_text, validate, callback, modal_size){
	var modal = $("<div>", {class: "modal fade",tabindex:1});
	var div = $("<div>", {class: "modal-dialog"}).appendTo(modal);
	if (modal_size) div.addClass(modal_size);
	var content = $("<div>", {class: "modal-content"}).appendTo(div);
	var header = $("<div>", {class: "modal-header"}).appendTo(content);
	$("<button>", {class: "close", "data-dismiss": "modal"}).html("&times;").appendTo(header);
	$("<h4>", {class: "modal-title", html: header_txt}).appendTo(header);
	var body = $("<div>", {class: "modal-body"}).appendTo(content);
	body.append(body_text);
	var footer = $("<div>", {class: "modal-footer"}).appendTo(content);
	if (validate){
		$("<button>", {class: "btn btn-success",
					   "data-dismiss": "modal",
					   text: "Sí"}).appendTo(footer).click(function(){callback(modal); });
		$("<button>", {class: "btn btn-danger", "data-dismiss": "modal", text: "No"}).appendTo(footer);
	} else {
		$("<button>", {class: "btn btn-default", "data-dismiss": "modal", text: "Close"}).appendTo(footer);
	}
	$(modal).on("keyup", function(e){
		if (e.keyCode == 13){
			if (validate) callback(modal);
			$(modal).modal("hide");
		}
	})
	$(modal).on('hidden.bs.modal', function (e) {
		$(document).off('keyup')
		$(modal).remove();
	});
	$(modal).modal("show");
}
*/

function addCommas(num) {
	const splitted = num.toString().split('.');
	var numStr = splitted[0];
	var ret = '';
	for (var i = 0; i < numStr.length; i++) {
		ret += numStr[i];
		if ((numStr.length - 1 - i) % 3 === 0 && i != numStr.length - 1) {
			ret += ',';
		}
	}
	if (splitted.length > 1) {
		ret += '.' + splitted[1];
	}
	return ret;
}

function csvFileToJSON(file, json_success) {
	try {
		var reader = new FileReader();
		reader.readAsBinaryString(file);
		reader.onload = function (e) {
			var jsonData = [];
			var headers = [];
			var rows = e.target.result.split("\r\n");
			for (var i = 0; i < rows.length; i++) {
				var cells_except_for_commas = rows[i].split(",");
				var cells = [];
				var must_join = false;
				var complete_value = "";
				for (const v of cells_except_for_commas) {
					complete_value += v;
					if (complete_value.length > 0 && complete_value[0] == '"' && complete_value[complete_value.length - 1] != '"') {
						continue;
					} else {
						if (complete_value.length > 0 && complete_value[0] == '"') {
							cells.push(complete_value.substring(1, complete_value.length - 1));
						} else {
							cells.push(complete_value);
						}
						complete_value = "";
					}
				}
				var rowData = {};
				for (var j = 0; j < cells.length; j++) {
					if (i == 0) {
						var headerName = cells[j].trim();
						headers.push(headerName);
					} else {
						var key = headers[j];
						if (key) {
							rowData[key] = cells[j].trim();
						}
					}
				}
				//skip the first row (header) data
				if (i != 0) {
					jsonData.push(rowData);
				}
			}
			json_success(jsonData);
		}
	} catch (e) {
		console.error(e);
	}
}


function xlsxFileToJSON(file, json_success) {
	var reader = new FileReader();
	reader.onload = function (e) {
		var data = e.target.result;
		var workbook = XLSX.read(data, {
			type: 'binary'
		});
		const sheetName = workbook.SheetNames[0];
		const spreadsheet_obj = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName])
		json_success(spreadsheet_obj);
	};

	reader.onerror = function (ex) {
		console.log(ex);
	};
	reader.readAsBinaryString(file);
}

function downloadCsvFromHeadersAndRows(headers, rows, title) {
	const headersRow = headers.join(',');
	var comma_separated_rows = [headersRow];
	for (const row of rows) {
		comma_separated_rows.push('"' + row.join('","') + '"');
	}
	const blob = new Blob([comma_separated_rows.join('\n')], { type: 'text/csv' });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.setAttribute('href', url);
	a.setAttribute('download', title);
	a.click();
}

function downloadCsv(datasetId, datasetName) {
	get_dataset_rows_as_list_api(datasetId, (data) => {
		downloadCsvFromHeadersAndRows(data.headers, data.rows, datasetName + '.csv');
	});
}

function doIfEscapePressed(event, funcCall) {
	event = event || window.event;
	var key = event.which || event.key || event.keyCode;
	if (key === 27) { // escape
		funcCall();
	}
};

function constructDonutGraph(name, currentDatasetData, displayBool = true) {
	if (document.getElementById(name) != null && currentDatasetData != null) {
		if (window.donutGraphs == undefined) {
			window.donutGraphs = {};
		}
		if (window.donutGraphs[name] != undefined) {
			window.donutGraphs[name].destroy();
		}
		const data = {
			labels: currentDatasetData[name]['x_values'],
			datasets: [{
				data: currentDatasetData[name]['y_values'],
				backgroundColor: currentDatasetData[name]['colors'],
				hoverOffset: 4
			}]
		};
		console.log(name)
		console.log(data)

		window.donutGraphs[name] = new Chart(name, {
			type: 'pie',
			data: data,
			options: {
				legend: {
					display: displayBool
				}
			}
		});
	}
}
