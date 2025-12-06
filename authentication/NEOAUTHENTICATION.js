var _NEOAUTHENTICATION = {
	_SERVER: "",

	UiAuthenticate: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json.method = "authenticate";
				_NEOAUTHENTICATION.ExecuteDirect(_json, null).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},

	/**
	 * /
	 * Interface AJAX wrapper
	 */
	formatFixedParameters: function (_json) {
		if (_json["server"] == undefined) { _json["server"] = _NEOAUTHENTICATION._SERVER; }
		if (_json["exit"] == undefined) { _json["exit"] = "output"; } //download
		if (_json["mime"] == undefined) { _json["mime"] = "application/json"; } // "text/xml" or other (must be supported)
		if (_json["function"] == undefined) { _json["function"] = ""; }
		if (_json["model"] == undefined) { _json["model"] = ""; }
		return _json;
	},
	ExecuteDirect: function (_json, _method) {
		return new Promise(
			function (resolve, reject) {
				try {
					if (_method != null) { _json["method"] = _method; }
					_NEOAUTHENTICATION.Execute(_json).then(function (datajson) {
						if (datajson.status != undefined) {
							resolve(datajson);
						} else {
							resolve(datajson);
						}
					});
				} catch (rex) {
					alert(JSON.stringify(rex));
					reject(rex);
				}
			});
	},
	Execute: function (_json) {
		return new Promise(
			function (resolve, reject) {
				try {
					var _params = _NEOAUTHENTICATION.formatFixedParameters(_json);
					var _data = JSON.stringify(_params);
					var form = new FormData();
					form.append("Username", _params["username"]);
					form.append("Password", _params["password"]);
					form.append("Id", _params["id"]);

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
}
