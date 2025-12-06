var _HTTPREQUEST = {
    server: "",
    _fail_conect: false,
    _waiter:false,
    _channels:null,
    _viewMode: "",
    _ready: false,
    _id_app: null,
    _id_root: null,
    _sufix: "",
    _sufix2: "",
    _id_user_active: 0,
    _id_club_redondo: 0,
    _id_type_user_active: 0,
    _username_active: "",
    _master_account : "",
    _image_active : "",
    _master_image_active : "",
    _email_active: "",
    _token_authentication: "",
    _token_authentication_created: "",
    _token_authentication_expire: "",
    _firebase_password: "123456",
    _firebase_user: null,
    _sufixEmail: "",
    formatFixedParameters: function (_json) {
        _json["id_app"] = _HTTPREQUEST._id_app;
        _json["id_root"] = _HTTPREQUEST._id_root;
        _json["id_user_active"] = _HTTPREQUEST._id_user_active;
        _json["id_club_redondo"] = _HTTPREQUEST._id_club_redondo;
        _json["username_active"] = _HTTPREQUEST._username_active;
        _json["token_authentication"] = _HTTPREQUEST._token_authentication;
        _json["sufix"] = _HTTPREQUEST._sufix;
        _json["sufix2"] = _HTTPREQUEST._sufix2;
        if (_json["exit"] == undefined) { _json["exit"] = "output"; } //download
        if (_json["mime"] == undefined) { _json["mime"] = "application/json"; } // "text/xml" or other (must be supported)
        if (_json["function"] == undefined) { _json["function"] = ""; }
        if (_json["model"] == undefined) { _json["model"] = ""; }
        if (_json["method"] == undefined) { _json["method"] = "api.backend/neocommandTransparent"; }
        return _json;
    },
    initialize: function (_user_model) {
        if (_HTTPREQUEST._remote_mode) { if (!_HTTPREQUEST._compiled && _HTTPREQUEST._here.indexOf("localhost")) { _HTTPREQUEST.server = _HTTPREQUEST._here; } }
        if (_HTTPREQUEST._user_active == null) { _HTTPREQUEST._user_active = _user_model; }
        _HTTPREQUEST._ready = true;
    },
    ExecuteDirect: function (_json, _method) {
        return new Promise(
            function (resolve, reject) {
                try {
                    var _alert = (_json["function"] == "statusTelemedicina");
                    if (_method != null) { _json["method"] = _method; }
                    _HTTPREQUEST.Execute(_json).then(function (datajson) {
                        if (_alert) { _alert = _alert;}
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
                    var _alert = (_json["function"] == "statusTelemedicina");
                    if (!_HTTPREQUEST._ready) { _HTTPREQUEST.initialize(null); }
                    _all = _HTTPREQUEST.formatFixedParameters(_json);
                    var _tmp = JSON.stringify(_all);
                    var ajaxRq = $.ajax({
                        type: "POST",
                        dataType: "json",
                        crossDomain: true,
                        url: (_HTTPREQUEST.server + _json.method),
                        data: _json,
                        beforeSend: function () { _HTTPREQUEST.onBeforeSendExecute(); },
                        complete: function () { _HTTPREQUEST.onCompleteExecute(); },
                        error: function (xhr, ajaxOptions, thrownError) {
                            if (!_HTTPREQUEST._fail_conect) {
                                _HTTPREQUEST._fail_conect = true;
                                alert("No hay conexión a Internet activa");
                                window.location.href = "offline.html";
                                resolve(null);
                            } else {
                                reject(thrownError);
                            }
                        },
                        success: function (datajson) {
                            _HTTPREQUEST._fail_conect = false;
                            if (datajson == null) {
                                datajson = { "results": null };
                                resolve(datajson);
                            } else {
                                if (datajson.compressed == null) { datajson.compressed = false; }
                                if (datajson.compressed == undefined) { datajson.compressed = false; }
                                if (datajson != null && datajson.compressed) {
                                    var zip = new JSZip();
                                    JSZip.loadAsync(window.atob(datajson.message)).then(function (zip) {
                                        zip.file("compressed.tmp").async("string").then(
                                            function success(content) {
                                                datajson.message = content;
                                                resolve(datajson);
                                            },
                                            function error(err) {
                                                reject(err);
                                            });
                                    });
                                } else {
                                    resolve(datajson);
                                }
                            }
                        }
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
    onBeforeSendExecute: function () {
        if (_HTTPREQUEST._waiter) { }
    },
    onCompleteExecute: function () {
        _HTTPREQUEST._waiter = false;
    },
};