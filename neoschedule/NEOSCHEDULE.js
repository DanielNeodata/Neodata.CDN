var _NEOSCHEDULE = {
	_SERVER: "",
	_blockUI: true,
	_id_application: null,
	_application: "",
	_id_user: 0,
	_username: "",
	_password: "",
	_token: "",
	_token_type: "",

	onDestroyModal: function (_target) {
		$(_target).remove();
		$(".modal-backdrop").remove();
		$("body").removeClass("modal-open");
	},
	onModalAlert: function (_title, _body, _class) {
		if (_class == undefined) { _class = "info"; }
		_NEOSCHEDULE.onDestroyModal("#alterModal");
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
			_NEOSCHEDULE.onDestroyModal("#alterModal");
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
		_NEOSCHEDULE.onModalAlert("System alert", _text, "warning");
	},

	/**
	 * /
	 * App implementation for inner calls
	 */
	onAuthenticate: function () {
		return new Promise(
			function (resolve, reject) {
				try {
					if (_NEOSCHEDULE._username == "" || _NEOSCHEDULE._password == "") {
						_NEOSCHEDULE.onErrHandler("Debe proveer un 'username' y 'password'");
						return false;
					}
					var _auth = { "username": _NEOSCHEDULE._username, "password": _NEOSCHEDULE._password, "id": _NEOSCHEDULE._id_application };
					_NEOAUTHENTICATION.UiAuthenticate(_auth)
						.then(function (data) {
							if (data.status == "OK") {
								_NEOSCHEDULE._id_application = data.records[0].id_application;
								_NEOSCHEDULE._application = data.records[0].application;
								_NEOSCHEDULE._id_user = data.records[0].id_user;
								_NEOSCHEDULE._username = data.records[0].username;
								_NEOSCHEDULE._token = data.token;
								_NEOSCHEDULE._token_type = "";
								resolve(data);
							} else {
								reject(data);
							}
						})
						.catch(function (rex) {
							_NEOSCHEDULE.onErrHandler(rex);
							reject(rex);
						});
				} catch (err) {
					_NEOSCHEDULE.onErrHandler(err.message);
					reject(err);
				}
			});

	},
	onSendEvent: function (_base64) {
		return new Promise(
			function (resolve, reject) {
				_NEOSCHEDULE.onAuthenticate().then(function (data) {
					var _json = {
						"mime_type": _base64.split(";")[0].split(":")[1],
						"raw_data": _base64.split(",")[1],
						"externalid": 0
					};
					_NEOSCHEDULE.Create(_json).then(function (data) {
						if (data.status == "OK") {
							$(".id_event").val(data.numeric);
							$(".id_event").keyup();
							resolve(data);
						} else {
							_NEOSCHEDULE.onErrHandler(data.message);
							$(".id_event").val(0);
							$(".id_event").keyup();
							reject(data);
						}
					}).catch(function (err) {
						_NEOSCHEDULE.onErrHandler(err.message);
						$(".id_event").val(0);
						$(".id_event").keyup();
						reject(err);
					});
				}).catch(function (err) {
					_NEOSCHEDULE.onErrHandler(err);
				});
			});
	},
	onState: function () {
		return new Promise(
			function (resolve, reject) {
				_NEOSCHEDULE.onAuthenticate().then(function (data) {
					_NEOSCHEDULE.State({}).then(function (data) {
						if (data.status == "OK") {
							resolve(data);
						} else {
							reject(data);
						}
					}).catch(function (err) {
						_NEOSCHEDULE.onErrHandler(err.message);
						reject(err);
					});
				}).catch(function (err) {
					err.message = "El usuario no puede autenticar las credenciales para esta función de la plataforma";
					_NEOSCHEDULE.onErrHandler(err);
					reject(err);
				});
			});
	},
	onMonitoring: function (_params) {
		return new Promise(
			function (resolve, reject) {
				_NEOSCHEDULE.onAuthenticate().then(function (data) {
					_NEOSCHEDULE.Monitoring(_params).then(function (data) {
						if (data.status == "OK") {
							resolve(data);
						} else {
							reject(data);
						}
					}).catch(function (err) {
						_NEOSCHEDULE.onErrHandler(err.message);
						reject(err);
					});
				}).catch(function (err) {
					err.message = "El usuario no puede autenticar las credenciales para esta función de la plataforma";
					_NEOSCHEDULE.onErrHandler(err);
					reject(err);
				});
			});
	},

	/**
	 * /
	 * API Communication Implementation
	 */
	Create: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json.method = "Create";
				_NEOSCHEDULE._waiter = true;
				_NEOSCHEDULE.ExecuteDirect(_json, null).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	State: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json.method = "State";
				_NEOSCHEDULE._waiter = true;
				_NEOSCHEDULE.ExecuteDirect(_json, null).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	Monitoring: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json.method = "Monitoring";
				_NEOSCHEDULE._waiter = true;
				_NEOSCHEDULE.ExecuteDirect(_json, null).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},

	/**
	 * /
	 * Interface AJAX wrapper
	 */
	formatFixedParameters: function (_json) {
		_json["id_user"] = _NEOSCHEDULE._id_user;
		_json["id_application"] = _NEOSCHEDULE._id_application;
		_json["token"] = _NEOSCHEDULE._token;
		if (_json["server"] == undefined) { _json["server"] = _NEOSCHEDULE._SERVER; }
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
					console.log(_json);
					_NEOSCHEDULE.Execute(_json).then(function (datajson) {
						if (datajson.status != undefined) {
							if (datajson.status == "OK" || datajson.status == "OK") {
								resolve(datajson);
							} else {
								if (parseInt(datajson.code) == -1) {
									$(".splash").remove();
									$(".login").remove();
									$(".main").remove();
									$(".deprecated").removeClass("d-none").fadeIn("fast");
								}
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
					var _params = _NEOSCHEDULE.formatFixedParameters(_json);
					var _data = JSON.stringify(_params);

					var form = new FormData();
					form.append("id_user", _json["id_user"]);
					form.append("id_application", _json["id_application"]);
					form.append("token", _json["token"]);
					form.append("Raw_data", _json["raw_data"]);
					form.append("Mime_type", _json["mime_type"]);
					form.append("ExternalId", _json["externalid"]);
					form.append("search", _json["search"]);
					form.append("date_from", _json["date_from"]);
					form.append("date_to", _json["date_to"]);
					form.append("id_type_status", _json["id_type_status"]);
					form.append("id_type_transaction", _json["id_type_transaction"]);

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
