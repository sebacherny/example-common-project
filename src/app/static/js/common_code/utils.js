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