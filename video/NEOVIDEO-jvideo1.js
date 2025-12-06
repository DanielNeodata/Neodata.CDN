var _NEOVIDEO = {
	_DOMAIN: "jvideo1.gruponeodata.com",
	_SERVER: "",
	_API: null,
	_id_application: null,
	_application: "",
	_id_user: 0,
	_username: "",
	_password: "",
	_token: "",
	_token_type: "",
	_id_transaction: 0,
	_rol: "",
	_tmrUpdate: 0,
	onDisconnect: null,
	onParticipantJoined: null,
	participantLeft: null,
	/**
	 * /
	 * Tools
	 */
	utf8_to_b64: function (str) { return window.btoa(unescape(encodeURIComponent(str))); },
	b64_to_utf8: function (str) { str = str.replace(/\s/g, ''); return decodeURIComponent(escape(window.atob(str))); },

	_CONFIG_INIT_VIDEO_DEFAULTS: {
		"target": "#meet",
		"caller": ".videoMenu",
		"roomname": "NEOVIDEO",
		"fullname": " ",
		"alias": " ",
		"width": 600,
		"height": 600,
		"create_token": true,
	},
	_CONFIG_OVERWRITE: {
		//apiLogLevels: ['warn', 'log', 'error', 'info', 'debug']
	},
	_INTERFACE_CONFIG_OVERWRITE: {
		NATIVE_APP_NAME: "NeoVideo",
		DEFAULT_LOCAL_DISPLAY_NAME: " ",
		DEFAULT_REMOTE_DISPLAY_NAME: " ",
		TOOLBAR_BUTTONS: ['microphone', 'camera', 'fullscreen', 'hangup', 'desktop', 'chat', 'tileview']
	},

	/**
	 * /
	 * App implementation for inner calls
	 */
	onAuthenticate: function () {
		return new Promise(
			function (resolve, reject) {
				try {
					if (_NEOVIDEO._username == "" || _NEOVIDEO._password == "") { reject({ "message": "Debe proveer un 'username' y 'password'" }); }
					_NEOAUTHENTICATION.UiAuthenticate({ "username": _NEOVIDEO._username, "password": _NEOVIDEO._password, "id": _NEOVIDEO._id_application })
						.then(function (data) {
							if (data.status == "OK") {
								_NEOVIDEO._id_application = data.records[0].id_application;
								_NEOVIDEO._application = data.records[0].application;
								_NEOVIDEO._id_user = data.records[0].id_user;
								_NEOVIDEO._username = data.records[0].username;
								_NEOVIDEO._token = data.token;
								_NEOVIDEO._token_type = "";
								resolve(data);
							} else {
								reject(data.data);
							}
						})
						.catch(function (rex) {
							reject(rex);
						});
				} catch (err) {
					reject(err);
				}
			});
	},
	onCreateNewVideoRoom: function (_this, _config) {
		return new Promise(
			function (resolve, reject) {
				try {
					_NEOVIDEO.onAuthenticate().then(function (_auth) {
						if (_config == undefined) { _config = {}; }
						_NEOVIDEO.UiCreateNewVideoRoom(_config).then(function (data) {
							_NEOVIDEO._rol = "host";
							_NEOVIDEO._id_transaction = data.numeric;
							_NEOVIDEO._token = data.message;
							_NEOVIDEO.onOpenVideo(data).then(function (inited) { resolve(inited); }).catch(function (err) { reject(err); });
						}).catch(function (err) {
							reject(err);
						});
					});
				} catch (err) {
					reject(err);
				}
			});
	},
	onJoinOpenSession: function (_id, _forced = false) {
		return new Promise(
			function (resolve, reject) {
				try {
					_NEOVIDEO.onAuthenticate().then(function (_auth) {
						_NEOVIDEO.UiJoinOpenSession({ "id": _id, "forced": _forced }).then(function (data) {
							_NEOVIDEO._token = data.message;
							if (data.status != "OK") { reject(data); }
							_NEOVIDEO._rol = "guest";
							_NEOVIDEO._id_transaction = _id;
							_NEOVIDEO.onOpenVideo(data).then(function (inited) {
								resolve(inited);
							}).catch(function (err) {
								reject(err);
							});
						}).catch(function (err) {
							reject(err);
						});
					});
				} catch (err) {
					reject(err);
				}
			});
	},
	onListAvailableVideoRooms: function () {
		return new Promise(
			function (resolve, reject) {
				try {
					_NEOVIDEO.onAuthenticate().then(function (_auth) {
						_NEOVIDEO.UiListAvailableVideoRooms({}).then(function (data) {
							if (data.status != "OK") { reject(data); }
							resolve(data);
						}).catch(function (err) {
							reject(err);
						});
					});
				} catch (err) {
					reject(err);
				}
			});
	},
	onListAvailableLiveStreaming: function () {
		return new Promise(
			function (resolve, reject) {
				try {
					_NEOVIDEO.onAuthenticate().then(function (_auth) {
						_NEOVIDEO.UiListAvailableLiveStreaming({}).then(function (data) {
							if (data.status != "OK") { reject(data); }
							resolve(data);
						}).catch(function (err) {
							reject(err);
						});
					});
				} catch (err) {
					reject(err);
				}
			});
	},

	onOpenVideo: function (data) {
		return new Promise(
			function (resolve, reject) {
				try {
					var _CONFIG_INIT_VIDEO = {
						"rol": _NEOVIDEO._rol,
						"target": _NEOVIDEO._CONFIG_INIT_VIDEO_DEFAULTS.target,
						"caller": _NEOVIDEO._CONFIG_INIT_VIDEO_DEFAULTS.caller,
						"id_transaction": _NEOVIDEO._id_transaction,
						"roomname": (_NEOVIDEO._CONFIG_INIT_VIDEO_DEFAULTS.roomname + _NEOVIDEO._id_transaction),
						"fullname": _NEOVIDEO._CONFIG_INIT_VIDEO_DEFAULTS.fullname,
						"alias": _NEOVIDEO._CONFIG_INIT_VIDEO_DEFAULTS.alias,
						"width": _NEOVIDEO._CONFIG_INIT_VIDEO_DEFAULTS.width,
						"height": _NEOVIDEO._CONFIG_INIT_VIDEO_DEFAULTS.height,
						"create_token": _NEOVIDEO._CONFIG_INIT_VIDEO_DEFAULTS.create_token,
						"domain": _NEOVIDEO._DOMAIN,
						"token": _NEOVIDEO._token,
						"title": ("#" + _NEOVIDEO._id_transaction),
					};
					clearInterval(_NEOVIDEO._tmrUpdate);
					_NEOVIDEO._tmrUpdate = setInterval(function () {
						switch (_NEOVIDEO._rol) {
							case "host":
								_NEOVIDEO.onUpdateVideoHost();
								break;
							default:
								_NEOVIDEO.onUpdateVideoGuest();
								break;
						}
					}, 10000);
					_NEOVIDEO.onTurnOnVideo(_CONFIG_INIT_VIDEO).then(function (created) { resolve(created); }).catch(function (err) { reject(err); });;
				} catch (err) {
					reject(err);
				}
			});
	},
	onTurnOnVideo: function (_json) {
		return new Promise(
			function (resolve, reject) {
				try {
					var _userInfo = { email: "", displayName: _json.alias };
					var _parentNode = document.querySelector(_json.target);
					var _options = {
						jwt: _json.token,
						roomName: _json.roomname,
						width: _json.width,
						height: _json.height,
						parentNode: _parentNode,
						//onload: function () { $('[name^="jitsiConferenceFrame"]').on('load', function () { _NEOVIDEO._API.dispose(); }); },
						userInfo: _userInfo,
						configOverwrite: _NEOVIDEO._CONFIG_OVERWRITE,
						interfaceConfigOverwrite: _NEOVIDEO._INTERFACE_CONFIG_OVERWRITE
					}
					if (_NEOVIDEO._API != null) { _NEOVIDEO._API.dispose(); };
					_NEOVIDEO._API = new JitsiMeetExternalAPI(_json.domain, _options);
					_NEOVIDEO._API.executeCommand('subject', ' ');
					setTimeout(function () {
						_NEOVIDEO._API.addEventListeners(
							{
								readyToClose: function () {
									_NEOVIDEO.onCloseVideo().then(function (data) {
										if ($.isFunction(_NEOVIDEO.onDisconnect)) { _NEOVIDEO.onDisconnect(data); }
									});
								},
								participantJoined: function (data) { if ($.isFunction(_NEOVIDEO.onParticipantJoined)) { _NEOVIDEO.onParticipantJoined(data); } },
								participantLeft: function (data) { if ($.isFunction(_NEOVIDEO.onParticipantLeft)) { _NEOVIDEO.onParticipantLeft(data); } },
								videoConferenceJoined: function (data) { if ($.isFunction(_NEOVIDEO.onVideoConferenceJoined)) { _NEOVIDEO.onVideoConferenceJoined(data); } },
								videoConferenceLeft: function (data) { if ($.isFunction(_NEOVIDEO.onVideoConferenceLeft)) { _NEOVIDEO.onVideoConferenceLeft(data); } },
								browserSupport: function (data) { if ($.isFunction(_NEOVIDEO.onBrowserSupport)) { _NEOVIDEO.onBrowserSupport(data); } },
								breakoutRoomsUpdated: function (data) { if ($.isFunction(_NEOVIDEO.onBreakoutRoomsUpdated)) { _NEOVIDEO.onBreakoutRoomsUpdated(data); } },
								errorOccurred: function (data) { if ($.isFunction(_NEOVIDEO.onErrorOccurred)) { _NEOVIDEO.onErrorOccurred(data); } },
								log: function (data) { if ($.isFunction(_NEOVIDEO.onLog)) { _NEOVIDEO.onLog(data); } },

								/**
								 * /
								 * ALL events!
								 */
								cameraError: function (data) { console.log("cameraError->"); console.log(data); },
								avatarChanged: function (data) { console.log("avatarChanged->"); console.log(data); },
								audioAvailabilityChanged: function (data) { console.log("audioAvailabilityChanged->"); console.log(data); },
								audioMuteStatusChanged: function (data) { console.log("audioMuteStatusChanged->"); console.log(data); },
								contentSharingParticipantsChanged: function (data) { console.log("contentSharingParticipantsChanged->"); console.log(data); },
								dataChannelOpened: function (data) { console.log("dataChannelOpened->"); console.log(data); },
								endpointTextMessageReceived: function (data) { console.log("endpointTextMessageReceived->"); console.log(data); },
								faceLandmarkDetected: function (data) { console.log("faceLandmarkDetected->"); console.log(data); },
								knockingParticipant: function (data) { console.log("knockingParticipant->"); console.log(data); },
								largeVideoChanged: function (data) { console.log("largeVideoChanged->"); console.log(data); },
								micError: function (data) { console.log("micError->"); console.log(data); },
								screenSharingStatusChanged: function (data) { console.log("screenSharingStatusChanged->"); console.log(data); },
								dominantSpeakerChanged: function (data) { console.log("dominantSpeakerChanged->"); console.log(data); },
								raiseHandUpdated: function (data) { console.log("raiseHandUpdated->"); console.log(data); },
								tileViewChanged: function (data) { console.log("tileViewChanged->"); console.log(data); },
								chatUpdated: function (data) { console.log("chatUpdated->"); console.log(data); },
								incomingMessage: function (data) { console.log("incomingMessage->"); console.log(data); },
								mouseEnter: function (data) { console.log("mouseEnter->"); console.log(data); },
								mouseLeave: function (data) { console.log("mouseLeave->"); console.log(data); },
								mouseMove: function (data) { console.log("mouseMove->"); console.log(data); },
								toolbarButtonClicked: function (data) { console.log("toolbarButtonClicked->"); console.log(data); },
								outgoingMessage: function (data) { console.log("outgoingMessage->"); console.log(data); },
								displayNameChange: function (data) { console.log("displayNameChange->"); console.log(data); },
								deviceListChanged: function (data) { console.log("deviceListChanged->"); console.log(data); },
								emailChange: function (data) { console.log("emailChange->"); console.log(data); },
								feedbackSubmitted: function (data) { console.log("feedbackSubmitted->"); console.log(data); },
								filmstripDisplayChanged: function (data) { console.log("filmstripDisplayChanged->"); console.log(data); },
								moderationStatusChanged: function (data) { console.log("moderationStatusChanged->"); console.log(data); },
								moderationParticipantApproved: function (data) { console.log("moderationParticipantApproved->"); console.log(data); },
								moderationParticipantRejected: function (data) { console.log("moderationParticipantRejected->"); console.log(data); },
								participantKickedOut: function (data) { console.log("participantKickedOut->"); console.log(data); },
								participantRoleChanged: function (data) { console.log("participantRoleChanged->"); console.log(data); },
								participantsPaneToggled: function (data) { console.log("participantsPaneToggled->"); console.log(data); },
								passwordRequired: function (data) { console.log("passwordRequired->"); console.log(data); },
								videoAvailabilityChanged: function (data) { console.log("videoAvailabilityChanged->"); console.log(data); },
								videoMuteStatusChanged: function (data) { console.log("videoMuteStatusChanged->"); console.log(data); },
								videoQualityChanged: function (data) { console.log("videoQualityChanged->"); console.log(data); },
								recordingLinkAvailable: function (data) { console.log("recordingLinkAvailable->"); console.log(data); },
								recordingStatusChanged: function (data) { console.log("recordingStatusChanged->"); console.log(data); },
								subjectChange: function (data) { console.log("subjectChange->"); console.log(data); },
								suspendDetected: function (data) { console.log("suspendDetected->"); console.log(data); },
							});
					}, 3000);
					resolve(_json);
				} catch (err) {
					reject(err);
				}
			});
	},
	onTurnOffVideo: function (_json) {
		return new Promise(
			function (resolve, reject) {
				try {
					_NEOVIDEO._API.executeCommand('hangup');
					resolve(true);
				} catch (err) {
					reject(err);
				}
			});
	},
	onCloseVideo: function () {
		return new Promise(
			function (resolve, reject) {
				try {
					_NEOVIDEO.onAuthenticate().then(function (_auth) {
						clearInterval(_NEOVIDEO._tmrUpdate);
						if (_NEOVIDEO._rol == "host") {
							_NEOVIDEO.UiCloseOpenSession({ "id": _NEOVIDEO._id_transaction })
								.then(function (data) {
									resolve(true);
								})
								.catch(function (err) {
									reject(err);
								});
						} else {
							resolve(true);
						}
					});
				} catch (err) {
					reject(err);
				}
			});
	},

	onUpdateVideoHost: function () {
		return new Promise(
			function (resolve, reject) {
				try {
					_NEOVIDEO.onAuthenticate().then(function (_auth) {
						_NEOVIDEO.UiUpdateVideoHost({ "id": _NEOVIDEO._id_transaction }).then(function (data) {
							if (data.status != "OK") {
								clearInterval(_NEOVIDEO._tmrUpdate);
								_NEOVIDEO._API.executeCommand('hangup');
								reject(data);
							} else {
								resolve(true);
							}
						}).catch(function (err) {
							clearInterval(_NEOVIDEO._tmrUpdate);
							_NEOVIDEO._API.executeCommand('hangup');
							reject(err);
						});
					});
				} catch (err) {
					reject(err);
				}
			});
	},
	onUpdateVideoGuest: function () {
		return new Promise(
			function (resolve, reject) {
				try {
					_NEOVIDEO.onAuthenticate().then(function (_auth) {
						_NEOVIDEO.UiUpdateVideoGuest({ "id": _NEOVIDEO._id_transaction }).then(function (data) {
							if (data.status != "OK") {
								clearInterval(_NEOVIDEO._tmrUpdate);
								_NEOVIDEO._API.executeCommand('hangup');
								reject(data);
							} else {
								resolve(true);
							}
						}).catch(function (err) {
							clearInterval(_NEOVIDEO._tmrUpdate);
							_NEOVIDEO._API.executeCommand('hangup');
							reject(err);
						});
					});
				} catch (err) {
					reject(err);
				}
			});
	},

	onSendRelatedData: function (_json) {
		return new Promise(
			function (resolve, reject) {
				try {
					_NEOVIDEO.onAuthenticate().then(function (_auth) {
						_NEOVIDEO.UiSendRelatedData(_json).then(function (data) {
							if (data.status != "OK") { reject(data); }
							resolve(data);
						}).catch(function (err) {
							reject(err);
						});
					});
				} catch (err) {
					reject(err);
				}
			});
	},
	onDeleteDataInClient: function (_json) {
		return new Promise(
			function (resolve, reject) {
				try {
					_NEOVIDEO.onAuthenticate().then(function (_auth) {
						_NEOVIDEO.UiDeleteDataInClient(_json).then(function (data) {
							if (data.status != "OK") { reject(data); }
							resolve(data);
						}).catch(function (err) {
							reject(err);
						});
					});
				} catch (err) {
					reject(err);
				}
			});
	},
	onReceiveRelatedData: function (_json) {
		return new Promise(
			function (resolve, reject) {
				try {
					_NEOVIDEO.onAuthenticate().then(function (_auth) {
						_NEOVIDEO.UiReceiveRelatedData(_json).then(function (data) {
							if (data.status != "OK") { reject(data); }
							resolve(data);
						}).catch(function (err) {
							reject(err);
						});
					});
				} catch (err) {
					reject(err);
				}
			});
	},
	onGetRelatedData: function (_json) {
		return new Promise(
			function (resolve, reject) {
				try {
					_NEOVIDEO.onAuthenticate().then(function (_auth) {
						_NEOVIDEO.UiGetRelatedData(_json).then(function (data) {
							if (data.status != "OK") { reject(data); }
							resolve(data);
						}).catch(function (err) {
							reject(err);
						});
					});
				} catch (err) {
					reject(err);
				}
			});
	},

	/**
	 * /
	 * API Communication Implementation
	 */
	UiCreateNewVideoRoom: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json["method"] = "CreateNewVideoRoom";
				_NEOVIDEO._waiter = true;
				var form = new FormData();
				_NEOVIDEO.ExecuteDirect(_json, null, form).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	UiListAvailableVideoRooms: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json["method"] = "ListAvailableVideoRooms";
				var form = new FormData();
				_NEOVIDEO.ExecuteDirect(_json, null, form).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	UiListAvailableLiveStreaming: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json["method"] = "ListAvailableLiveStreaming";
				var form = new FormData();
				_NEOVIDEO.ExecuteDirect(_json, null, form).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	UiJoinOpenSession: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json["method"] = "JoinOpenSession";
				_NEOVIDEO._waiter = true;
				var form = new FormData();
				form.append("id_transaction", _json["id"]);
				form.append("reOpen", _json["forced"]);
				_NEOVIDEO.ExecuteDirect(_json, null, form).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	UiCloseOpenSession: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json["method"] = "CloseOpenSession";
				var form = new FormData();
				form.append("id_transaction", _json["id"]);

				_NEOVIDEO.ExecuteDirect(_json, null, form).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	UiUpdateVideoHost: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json["method"] = "UpdateVideoHost";
				var form = new FormData();
				form.append("id_transaction", _json["id"]);

				_NEOVIDEO.ExecuteDirect(_json, null, form).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	UiUpdateVideoGuest: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json["method"] = "UpdateVideoGuest";
				var form = new FormData();
				form.append("id_transaction", _json["id"]);

				_NEOVIDEO.ExecuteDirect(_json, null, form).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	UiSendRelatedData: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json["method"] = "SendRelatedData";
				var form = new FormData();
				form.append("id_transaction", _json["id"]);
				form.append("id_item", _json["id_item"]);
				form.append("description", _json["description"]);
				form.append("raw_data", _json["raw_data"]);

				_NEOVIDEO.ExecuteDirect(_json, null, form).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	UiDeleteDataInClient: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json["method"] = "DeleteDataInClient";
				var form = new FormData();
				form.append("id_transaction", _json["id"]);

				_NEOVIDEO.ExecuteDirect(_json, null, form).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	UiReceiveRelatedData: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json["method"] = "ReceiveRelatedData";
				var form = new FormData();
				form.append("id_transaction", _json["id"]);
				form.append("remove", _json["remove"]);

				_NEOVIDEO.ExecuteDirect(_json, null, form).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	UiGetRelatedData: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json["method"] = "GetRelatedData";
				var form = new FormData();
				form.append("id_transaction", _json["id"]);

				_NEOVIDEO.ExecuteDirect(_json, null, form).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	UiGetWrtcOfferAnswer: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json["method"] = "GetWrtcOfferAnswer";
				var form = new FormData();
				form.append("id_transaction", _json["id"]);

				_NEOVIDEO.ExecuteDirect(_json, null, form).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},
	UiUpdateWrtcAnswer: function (_json) {
		return new Promise(
			function (resolve, reject) {
				_json["method"] = "UpdateWrtcAnswer";
				var form = new FormData();
				form.append("id_transaction", _json["id"]);
				form.append("raw_answer", _json["raw_answer"]);

				_NEOVIDEO.ExecuteDirect(_json, null, form).then(function (data) { resolve(data); }).catch(function (err) { reject(err); });
			});
	},

	/**
	 * /
	 * Interface AJAX wrapper
	 */
	formatFixedParameters: function (_json) {
		_json["id_user"] = _NEOVIDEO._id_user;
		_json["id_application"] = _NEOVIDEO._id_application;
		_json["token"] = _NEOVIDEO._token;
		if (_json["server"] == undefined) { _json["server"] = _NEOVIDEO._SERVER; }
		if (_json["exit"] == undefined) { _json["exit"] = "output"; } //download
		if (_json["mime"] == undefined) { _json["mime"] = "application/json"; } // "text/xml" or other (must be supported)
		if (_json["function"] == undefined) { _json["function"] = ""; }
		if (_json["model"] == undefined) { _json["model"] = ""; }
		if (_json["method"] == undefined) { _json["method"] = "api/getNeoCommand"; }
		return _json;
	},
	ExecuteDirect: function (_json, _method, form) {
		return new Promise(
			function (resolve, reject) {
				try {
					if (_method != null) { _json["method"] = _method; }
					_NEOVIDEO.Execute(_json, form).then(function (datajson) {
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
	Execute: function (_json, form) {
		return new Promise(
			function (resolve, reject) {
				try {
					var _params = _NEOVIDEO.formatFixedParameters(_json);
					var _data = JSON.stringify(_params);

					form.append("id_user", _json["id_user"]);
					form.append("id_application", _json["id_application"]);
					form.append("token", _json["token"]);


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
