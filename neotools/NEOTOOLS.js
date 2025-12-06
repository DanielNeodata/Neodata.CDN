var _NEOTOOLS = {
	_SERVER: "",
	_blockUI: true,

	onDestroyModal: function (_target) {
		$(_target).remove();
		$(".modal-backdrop").remove();
		$("body").removeClass("modal-open");
	},
	onModalAlert: function (_title, _body, _class) {
		if (_class == undefined) { _class = "info"; }
		_NEOTOOLS.onDestroyModal("#alterModal");
		var _html = "<div class='modal fade' id='alterModal' role='dialog'>";
		_html += " <div class='modal-dialog modal-dialog-centered' role='document'>";
		_html += "  <div class='modal-content'>";
		_html += "    <div class='modal-header text-" + _class + "'>";
		_html += "      <h2 class='modal-title'>" + _title + "</h2>";
		_html += "    </div>";
		_html += "    <div class='modal-body'>";
		_html += _body;
		_html += "    </div>";
		_html += "    <div class='modal-footer font-weight-light'>";
		_html += "       <button type='button' class='btn-raised btn btn-cancel-alert btn-" + _class + " btn-sm'><i class='material-icons'>done</i></span>Aceptar</button>";
		_html += "    </div>";
		_html += "  </div>";
		_html += " </div>";
		_html += "</div>";
		$("body").append(_html);
		$("body").off("click", ".btn-cancel-alert").on("click", ".btn-cancel-alert", function () {
			_NEOTOOLS.onDestroyModal("#alterModal");
		});
		$("#alterModal").modal({ backdrop: true, keyboard: true, show: true });
		return true;
	},
	onErrHandler: function (msg) {
		var _text = "";
		if (typeof msg === 'object') {
			if (msg.message != undefined) {
				_text = msg.message;
			} else {
				_text = JSON.stringify(msg);
			}
		} else {
			_text = msg;
		}
		_NEOTOOLS.onModalAlert("System alert", _text, "warning");
	},

	/**
	 * /
	 * App implementation for inner calls
	 */
	onCreateQR: function (_params) {
		return new Promise(
			function (resolve, reject) {
				_NEOTOOLS.CreateQR(_params).then(function (data) {
					if (data.status == "OK") {
						resolve(data);
					} else {
						reject(data);
					}
				}).catch(function (err) {
					_NEOTOOLS.onErrHandler(err.message);
					reject(err);
				});
			});
	},

	/**
	 * /
	 * API Communication Implementation
	 */
	CreateQR: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json.method = "CreateQR";
				_NEOTOOLS._waiter = true;
				_NEOTOOLS.ExecuteDirect(_json, null).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},

	formatFixedParameters: function (_json) {
		if (_json["server"] == undefined) { _json["server"] = _NEOTOOLS._SERVER; }
		if (_json["exit"] == undefined) { _json["exit"] = "output"; } //download
		if (_json["mime"] == undefined) { _json["mime"] = "application/json"; } // "text/xml" or other (must be supported)
		if (_json["function"] == undefined) { _json["function"] = ""; }
		if (_json["model"] == undefined) { _json["model"] = ""; }
		if (_json["method"] == undefined) { _json["method"] = "api/getNeoCommand"; }
		return _json;
	},
	ExecuteDirect: function (_json, _method) {
		return new Promise(
			function (resolve, reject) {
				try {
					if (_method != null) { _json["method"] = _method; }
					_NEOTOOLS.Execute(_json).then(function (datajson) {
						if (datajson.status != undefined) {
							if (datajson.status == "OK" || datajson.status == "OK") {
								resolve(datajson);
							} else {
								reject(datajson);
							}
						} else {
							resolve(datajson);
						}
					});
				} catch (rex) {
					reject(rex);
				}
			});
	},
	Execute: function (_json) {
		return new Promise(
			function (resolve, reject) {
				try {
					var _params = _NEOTOOLS.formatFixedParameters(_json);
					var _data = JSON.stringify(_params);

					var form = new FormData();
					form.append("Url", _json["url"]);

					var ajaxRq = $.ajax({
						url: (_json.server + _json.method),
						method: "POST",
						timeout: 0,
						processData: false,
						mimeType: "multipart/form-data",
						dataType: "json",
						contentType: false,
						data: form,
						beforeSend: function () { },
						complete: function () { },
						error: function (xhr, ajaxOptions, thrownError) { reject(thrownError); },
						success: function (datajson) { resolve(datajson); }
					});
				} catch (rex) {
					reject(rex);
				}
			}
		)
	},
	Load: function (_file) {
		return new Promise(
			function (resolve, reject) {
				var ajaxRq = $.ajax({
					type: "GET",
					timeout: 10000,
					dataType: "html",
					async: false,
					cache: false,
					url: _file,
					success: function (data) { resolve(data); },
					error: function (xhr, msg) { reject(msg); }
				});
			});
	},
}
