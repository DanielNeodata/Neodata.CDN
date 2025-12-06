var _NEOSIGNATURE = {
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
		_NEOSIGNATURE.onDestroyModal("#alterModal");
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
			_NEOSIGNATURE.onDestroyModal("#alterModal");
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
		_NEOSIGNATURE.onModalAlert("System alert", _text, "warning");
	},

	/**
	 * /
	 * App implementation for inner calls
	 */
	onAuthenticate: function () {
		return new Promise(
			function (resolve, reject) {
				try {
					if (_NEOSIGNATURE._username == "" || _NEOSIGNATURE._password == "") {
						_NEOSIGNATURE.onErrHandler("Debe proveer un 'username' y 'password'");
						return false;
					}
					var _auth = { "username": _NEOSIGNATURE._username, "password": _NEOSIGNATURE._password, "id": _NEOSIGNATURE._id_application };
					_NEOAUTHENTICATION.UiAuthenticate(_auth)
						.then(function (data) {
							if (data.status == "OK") {
								_NEOSIGNATURE._id_application = data.records[0].id_application;
								_NEOSIGNATURE._application = data.records[0].application;
								_NEOSIGNATURE._id_user = data.records[0].id_user;
								_NEOSIGNATURE._username = data.records[0].username;
								_NEOSIGNATURE._token = data.tokenSingleUse;
								_NEOSIGNATURE._token_type = "";
								resolve(data);
							} else {
								reject(data);
							}
						})
						.catch(function (rex) {
							_NEOSIGNATURE.onErrHandler(rex);
							reject(rex);
						});
				} catch (err) {
					_NEOSIGNATURE.onErrHandler(err.message);
					reject(err);
				}
			});

	},
	onSendTransfer: function (_base64, _base64_additional, _type_key, _val_key, _name_key) {
		return new Promise(
			function (resolve, reject) {
				_NEOSIGNATURE.onAuthenticate().then(function (data) {
					var _json = {
						"id_type_document": 1,
						"id_type_status": 1,
						"externalid": 0,
						"raw_data": _base64,
						"mime_type": _base64.split(";")[0].split(":")[1],
						"raw_data_additional": _base64_additional,
						"mime_type_additional": _base64_additional.split(";")[0].split(":")[1],
						"type_key": _type_key,
						"val_key": _val_key,
						"name_key": _name_key,
						"pageToAlter": 0,
						"x": 0,
						"y": 0,
						"lat": 0,
						"lng": 0,
						"altitude": 0,
						"speed": 0,
						"referer": "",
						"custom_message": "",
						"modifier": ""
					};
					//set modifier if sending a pdf!
					if (_json["mime_type"] == "application/pdf") { _json["modifier"] = "sign_with_raw_additional"; }

					_NEOSIGNATURE.Create(_json).then(function (data) {
						if (data.status == "OK") {
							$(".id_signature").val(data.records[0].id);
							$(".id_signature").keyup();
							resolve(data);
						} else {
							_NEOSIGNATURE.onErrHandler(data.message);
							$(".id_signature").val(0);
							$(".id_signature").keyup();
							reject(data);
						}
					}).catch(function (err) {
						_NEOSIGNATURE.onErrHandler(err.message);
						$(".id_signature").val(0);
						$(".id_signature").keyup();
						reject(err);
					});
				}).catch(function (err) {
					_NEOSIGNATURE.onErrHandler(err);
				});
			});
	},
	onGetTransfers: function (_this) {
		_NEOSIGNATURE.onAuthenticate().then(function (data) {
			$(".responseTransaction").addClass("d-none");
			$(".responseGet").removeClass("d-none");
			clearTimeout(_NEOSIGNATURE._trmLazy);
			_NEOSIGNATURE._trmLazy = setTimeout(function () {
				$(".btn-clear-sign").click();
				$(".card-footer").html("");
				$(".endpoints").addClass("d-none");
				$(".onlyzeros").removeClass("d-none");
				$(".btnSendTransfer").removeClass("d-none");
				_NEOSIGNATURE._actual_id = $(".id_signature").val();
				var _params = { "id": _NEOSIGNATURE._actual_id };
				_NEOSIGNATURE.Search(_params).then(function (data) {
					if (data.status == "OK") {
						_NEOSIGNATURE._last_get = data;
						$.each(data.records, function (i, item) {
							$(".btnSendTransfer").addClass("d-none");
							$(".endpoints").removeClass("d-none");
							$(".onlyzeros").addClass("d-none");
							$(".id_signature").val(item.id);
							var _image = _TOOLS.iconByMime(item.signature.mime_type);
							if (_image == "./img/image.png") { _image = item.raw_data; }
							$(".img-1").attr("src", _image);
							$(".img-1").attr("data-base64", item.signature.raw_data);
							$(".img-additional-1").attr("src", item.raw_data_additional);
							var _html = "";
							_html += "<div class='card p-3 text-left'>";
							_html += ("<p>ID <b>" + item.id + "</b></p>");
							_html += ("<p>Fecha de transacción <b>" + item.created + "</b></p>");
							if (item.privatized != "" && item.privatized != "null" && item.privatized != null) { _html += ("<p>Fecha de modo privado <b>" + item.privatized + "</b></p>"); }
							if (item.destroyed != "" && item.destroyed != "null" && item.destroyed != null) { _html += ("<p>Fecha de destrucción <b>" + item.destroyed + "</b></p>"); }

							switch (parseInt(item.id_type_status)) {
								case 1:
									_html += ("<p>La transacción está <b><span class='badge badge-info'>Pendiente de aceptación</b></p>");
									break;
								case 2:
									_html += ("<p>La transacción fue confirmada el <b>" + item.fum + "</b></p>");
									_html += ("<p>La transacción ha sido <b><span class='badge badge-success'>aceptada el " + item.fum + "</b></p>");
									break;
								case 3:
									_html += ("<p>La transacción tiene fecha de rechazo <b>" + item.fum + "</b></p>");
									break;
							}

							_html += "  <div class='row'>";
							_html += "    <div class='col-6'>";
							_html += ("      <b>Firma digital</b><br/><p style='word-break:break-all;'>" + item.signature + "</p>");
							_html += ("      <b>Integridad verificada</b><br/><p style='word-break:break-all;'># " + item.integrity + " " + item.verified_integrity + "</p>");
							_html += ("      <b>Clave pública</b><br/><p style='word-break:break-all;'>" + item.publicKey + "</p>");
							_html += "    </div>";
							_html += "    <div class='col-6'>";
							_html += ("      <b>Firma digital adicional</b><br/><p style='word-break:break-all;'>" + item.signature_additional + "</p>");
							_html += ("      <b>Integridad verificada adicional</b><br/><p style='word-break:break-all;'># " + item.integrity_additional + " " + item.verified_integrity_additional + "</p>");
							_html += ("      <b>Clave pública adicional</b><br/><p style='word-break:break-all;'>" + item.publicKey_additional + "</p>");
							_html += "    </div>";
							_html += "  </div>";

							_html += "</div>";
							$(".footer-1").html(_html);
							$(".responseTransaction").addClass("d-none");
							$(".responseGet").removeClass("d-none");
						});
					}
				});
			}, 500);
		}).catch(function (err) {
			_NEOSIGNATURE.onErrHandler(err);
		});
	},
	onState: function () {
		return new Promise(
			function (resolve, reject) {
				_NEOSIGNATURE.onAuthenticate().then(function (data) {
					_NEOSIGNATURE.State({}).then(function (data) {
						if (data.status == "OK") {
							resolve(data);
						} else {
							reject(data);
						}
					}).catch(function (err) {
						_NEOSIGNATURE.onErrHandler(err.message);
						reject(err);
					});
				}).catch(function (err) {
					err.message = "El usuario no puede autenticar las credenciales para esta función de la plataforma";
					_NEOSIGNATURE.onErrHandler(err);
					reject(err);
				});
			});
	},
	onMonitoring: function (_params) {
		return new Promise(
			function (resolve, reject) {
				_NEOSIGNATURE.onAuthenticate().then(function (data) {
					_NEOSIGNATURE.Monitoring(_params).then(function (data) {
						if (data.status == "OK") {
							resolve(data);
						} else {
							reject(data);
						}
					}).catch(function (err) {
						_NEOSIGNATURE.onErrHandler(err.message);
						reject(err);
					});
				}).catch(function (err) {
					err.message = "El usuario no puede autenticar las credenciales para esta función de la plataforma";
					_NEOSIGNATURE.onErrHandler(err);
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
				_json["method"] = "Create";
				_NEOSIGNATURE._waiter = true;
				_NEOSIGNATURE.ExecuteDirect(_json, null).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	Search: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json["method"] = "Search";
				_NEOSIGNATURE.ExecuteDirect(_json, null).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	State: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json.method = "State";
				_NEOSIGNATURE._waiter = true;
				_NEOSIGNATURE.ExecuteDirect(_json, null).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	Monitoring: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json.method = "Monitoring";
				_NEOSIGNATURE._waiter = true;
				_NEOSIGNATURE.ExecuteDirect(_json, null).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},

	/**
	 * /
	 * Interface AJAX wrapper
	 */
	formatFixedParameters: function (_json) {
		_json["id_user"] = _NEOSIGNATURE._id_user;
		_json["id_application"] = _NEOSIGNATURE._id_application;
		_json["token"] = _NEOSIGNATURE._token;
		if (_json["server"] == undefined) { _json["server"] = _NEOSIGNATURE._SERVER; }
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
					_NEOSIGNATURE.Execute(_json).then(function (datajson) {
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
					var _params = _NEOSIGNATURE.formatFixedParameters(_json);
					var _data = JSON.stringify(_params);

					var form = new FormData();
					form.append("id_user", _json["id_user"]);
					form.append("id_application", _json["id_application"]);
					form.append("token", _json["token"]);

					form.append("id_type_document", _json["id_type_document"]);
					form.append("id_type_status", _json["id_type_status"]);
					form.append("externalid", _json["externalid"]);
					form.append("raw_data", _json["raw_data"]);
					form.append("mime_type", _json["mime_type"]);
					form.append("raw_data_additional", _json["raw_data_additional"]);
					form.append("mime_type_additional", _json["mime_type_additional"]);
					form.append("type_key", _json["type_key"]);
					form.append("val_key", _json["val_key"]);
					form.append("name_key", _json["name_key"]);
					form.append("pageToAlter", _json["pageToAlter"]);
					form.append("x", _json["x"]);
					form.append("y", _json["y"]);
					form.append("lat", _json["lat"]);
					form.append("lng", _json["lng"]);
					form.append("altitude", _json["altitude"]);
					form.append("speed", _json["speed"]);
					form.append("referer", _json["referer"]);
					form.append("custom_message", _json["custom_message"]);
					form.append("modifier", _json["modifier"]);
					if (_json["search"] != undefined) { form.append("search", _json["search"]); }
					if (_json["date_from"] != undefined) { form.append("date_from", _json["date_from"]); }
					if (_json["date_to"] != undefined) { form.append("date_to", _json["date_to"]); }
					if (_json["page"] != undefined) { form.append("page", _json["page"]); }
					if (_json["pagesize"] != undefined) { form.append("pagesize", _json["pagesize"]); }

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
