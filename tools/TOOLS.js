var _TOOLS = {
    _avalilableLanguages: ["en"],
    onDestroyModal: function (_target, _callback) {
        $(_target).remove();
        $(".modal-backdrop").remove();
        $("body").removeClass("modal-open");
        if ($.isFunction(_callback)) { _callback(); }
    },
    onModalAlert: function (_title, _body, _class) {
        if (_class == undefined) { _class = "info"; }
        _TOOLS.onDestroyModal("#alterModal");
        var _html = "<div class='modal fade' id='alterModal' role='dialog' style='z-index:999998;'>";
        _html += " <div class='modal-dialog modal-dialog-centered modal-lg m-0 p-0' role='document' style='z-index:999999;'>";
        _html += "  <div class='modal-content mt-2' style='position:absolute;left:0px;top:0px;width:100vw;'>";
        _html += "    <div class='modal-header text-" + _class + "'>";
        if (_title != "") {
            _html += "<h4>" + _title + "<button  class='close pull-right' data-dismiss='modal' style='position:absolute;right:10px;top:10px;font-size:2rem;'>&times;</button></h4>";
        } else {
            _html += "<button  class='close' data-dismiss='modal' style='position:absolute;right:10px;top:10px;font-size:2rem;'>&times;</button>";
        }
        _html += "    </div>";
        _html += "    <div class='modal-body'>";
        _html += _body;
        _html += "    </div>";
        _html += "  </div>";
        _html += " </div>";
        _html += "</div>";
        $("body").append(_html);
        $("body").off("click", ".btn-cancel-alert").on("click", ".btn-cancel-alert", function () {
            _TOOLS.onDestroyModal("#alterModal");
        });
        $("#alterModal").modal({ backdrop: true, keyboard: true, show: true });
        return true;
    },

    resize: function () {
        var win = $(window);
        var _w = (win.width() - 25);
        var _h = win.height();
        $("#map").css({ "width": "100%", "height": ("1000px") });
    },
    UUID: function () {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) { s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1); }
        s[14] = "4";
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        var uuid = s.join("");
        return uuid;
    },
    toCurr: function (val) {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ars', currencyDisplay: 'narrowSymbol' }).format(val);
    },
    todayYYYYMMDD: function (_separator) {
        var currentDate = new Date();
        var day = currentDate.getDate();
        var month = currentDate.getMonth() + 1;
        var year = currentDate.getFullYear();
        if (day < 10) { day = "0" + day; }
        if (month < 10) { month = "0" + month; }
        return (year + _separator + month + _separator + day);
    },
    toDDMMYY: function (_date, _separator) {
        _date = _date.split("T")[0];
        var _v = _date.split("T")[0].split(_separator);
        return (_v[2] + "/" + _v[1] + "/" + _v[0]);
    },
    toDeg: function (r) { return r * 180 / Math.PI; },
    toDataURL: function (src, callback, outputFormat) {
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            var canvas = document.createElement('CANVAS');
            var ctx = canvas.getContext('2d');
            var dataURL;
            canvas.height = this.naturalHeight;
            canvas.width = this.naturalWidth;
            ctx.drawImage(this, 0, 0);
            dataURL = canvas.toDataURL(outputFormat);
            callback(dataURL);
        };
        img.src = src;
        /*
        if (img.complete || img.complete === undefined) {
            img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
            img.src = src;
        }
        */
    },
    toSHS256: function (ascii) {
        function rightRotate(value, amount) {
            return (value >>> amount) | (value << (32 - amount));
        };
        var mathPow = Math.pow;
        var maxWord = mathPow(2, 32);
        var lengthProperty = 'length'
        var i, j; // Used as a counter across the whole file
        var result = ''
        var words = [];
        var asciiBitLength = ascii[lengthProperty] * 8;
        //* caching results is optional - remove/add slash from front of this line to toggle
        // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
        // (we actually calculate the first 64, but extra values are just ignored)
        var hash = sha256.h = sha256.h || [];
        // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
        var k = sha256.k = sha256.k || [];
        var primeCounter = k[lengthProperty];
        /*/
        var hash = [], k = [];
        var primeCounter = 0;
        //*/
        var isComposite = {};
        for (var candidate = 2; primeCounter < 64; candidate++) {
            if (!isComposite[candidate]) {
                for (i = 0; i < 313; i += candidate) {
                    isComposite[i] = candidate;
                }
                hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
                k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
            }
        }
        ascii += '\x80' // Append Ƈ' bit (plus zero padding)
        while (ascii[lengthProperty] % 64 - 56) ascii += '\x00' // More zero padding
        for (i = 0; i < ascii[lengthProperty]; i++) {
            j = ascii.charCodeAt(i);
            if (j >> 8) return; // ASCII check: only accept characters in range 0-255
            words[i >> 2] |= j << ((3 - i) % 4) * 8;
        }
        words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
        words[words[lengthProperty]] = (asciiBitLength)
        // process each chunk
        for (j = 0; j < words[lengthProperty];) {
            var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
            var oldHash = hash;
            // This is now the undefinedworking hash", often labelled as variables a...g
            // (we have to truncate as well, otherwise extra entries at the end accumulate
            hash = hash.slice(0, 8);
            for (i = 0; i < 64; i++) {
                var i2 = i + j;
                // Expand the message into 64 words
                // Used below if 
                var w15 = w[i - 15], w2 = w[i - 2];
                // Iterate
                var a = hash[0], e = hash[4];
                var temp1 = hash[7]
                    + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
                    + ((e & hash[5]) ^ ((~e) & hash[6])) // ch
                    + k[i]
                    // Expand the message schedule if needed
                    + (w[i] = (i < 16) ? w[i] : (
                        w[i - 16]
                        + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) // s0
                        + w[i - 7]
                        + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)) // s1
                    ) | 0
                    );
                // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
                var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj
                hash = [(temp1 + temp2) | 0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
                hash[4] = (hash[4] + temp1) | 0;
            }
            for (i = 0; i < 8; i++) { hash[i] = (hash[i] + oldHash[i]) | 0; }
        }
        for (i = 0; i < 8; i++) {
            for (j = 3; j + 1; j--) {
                var b = (hash[i] >> (j * 8)) & 255;
                result += ((b < 16) ? 0 : '') + b.toString(16);
            }
        }
        return result;
    },
    getNow: function () {
        var currentDate = new Date();
        var second = currentDate.getSeconds();
        var minute = currentDate.getMinutes();
        var hour = currentDate.getHours();
        var day = currentDate.getDate();
        var month = currentDate.getMonth() + 1;
        var year = currentDate.getFullYear();
        if (day < 10) { day = "0" + day; }
        if (month < 10) { month = "0" + month; }
        if (hour < 10) { hour = "0" + hour; }
        if (minute < 10) { minute = "0" + minute; }
        if (second < 10) { second = "0" + second; }
        return day + "/" + month + "/" + year + " " + hour + ":" + minute + ":" + second;
    },
    getNowYYYYMMDD: function () {
        var currentDate = new Date();
        var second = currentDate.getSeconds();
        var minute = currentDate.getMinutes();
        var hour = currentDate.getHours();
        var day = currentDate.getDate();
        var month = currentDate.getMonth() + 1;
        var year = currentDate.getFullYear();
        if (day < 10) { day = "0" + day; }
        if (month < 10) { month = "0" + month; }
        if (hour < 10) { hour = "0" + hour; }
        if (minute < 10) { minute = "0" + minute; }
        if (second < 10) { second = "0" + second; }
        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    },
    validate: function (_selector) {
        var _ret = true;
        $(_selector).each(function () { _ret = _TOOLS.formatValidation($(this)) && _ret; });
        return _ret;
    },
    formatValidation: function (_obj) {
        var _ret = true;
        var _color = "transparent";
        var _color_alert = "rgba(251, 4, 11,0.25)";
        switch (_obj.prop("tagName")) {
            case "TEXTAREA":
            case "INPUT":
                switch (_obj.attr("type")) {
                    case "email":
                        if (!_TOOLS.isValidEmail(_obj.val())) {
                            _color = _color_alert;
                            _ret = false;
                        }
                        break;
                    case "radio":
                        _ret = ($("input[name='" + property + "']:checked").val() != undefined);
                        if (!_ret) {
                            _color = _color_alert;
                            _obj.parent().css({ "background-color": _color, "border": "solid 1px silver", "border-radius": "0.25rem" });
                        } else {
                            _obj.parent().css({ "background-color": "transparent", "border": "solid 1px transparent" });
                        }
                        break;
                    case "checkbox":
                        var _checked = _obj.is(":checked");
                        if (!_checked) {
                            _color = _color_alert;
                            _ret = false;
                            _obj.parent().css("color", _color);
                        } else {
                            _obj.parent().css("color", "transparent");
                        }
                        break;
                    default:
                        if (_obj.hasClass("data-list")) {
                            if (_obj.attr("data-selected-id") == "" || _obj.attr("data-selected-id") == undefined) { _color = _color_alert; _ret = false; }
                        } else {
                            if (_obj.val() == "") { _color = _color_alert; _ret = false; }
                        }
                        break;
                }
                break;
            case "SELECT":
                if (_obj.val() == "-1" || _obj.val() == undefined || _obj.val() == null) { _color = _color_alert; _ret = false; }
                break;
        }
        _obj.css("background-color", _color);
        return _ret;
    },
    getFormValues: function (_selector, _this) {
        var _jsonSave = {};
        $(_selector).each(function () {
            var property = $(this).attr('name');
            var value = "";
            switch (true) {
                case $(this).hasClass("combo"):
                    if ($(this).length == 0) { value = ""; } else { value = $(this).val(); }
                    if (value == null || value == "-1" || value == "0" || value == "") { value = "-1"; }
                    break;
                case $(this).hasClass("check"):
                    if ($(this).prop("checked")) { value = $(this).val(); } else { value = ""; }
                    break;
                default:
                    value = $(this).val();
                    break;
            }
            _jsonSave[property] = value;
        });
        if (_this != undefined) {
            _jsonSave["id"] = _this.attr("data-id");
            _jsonSave["module"] = _this.attr("data-module");
            _jsonSave["model"] = _this.attr("data-model");
            _jsonSave["table"] = _this.attr("data-table");
            _jsonSave["action"] = _this.attr("data-action");
            _jsonSave["function"] = _this.attr("data-action");
            if (_this.attr("data-page") == undefined) { _this.attr("data-page", 1); };
            _jsonSave["page"] = _this.attr("data-page");
        }
        return _jsonSave;
    },
    isElementVisible: function (el) {
        if (typeof jQuery !== 'undefined' && el instanceof jQuery) { el = el[0]; }
        var rect = el.getBoundingClientRect();
        var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
        var windowWidth = (window.innerWidth || document.documentElement.clientWidth);
        var vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
        var horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
        return (vertInView && horInView);
    },
    isValidEmail: function (email) {
        var em = /^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        return em.test(email);
    },
    utf8_to_str: function (a) {
        for (var i = 0, s = ''; i < a.length; i++) {
            var h = a[i].toString(16)
            if (h.length < 2) h = '0' + h
            s += '%' + h
        }
        return decodeURI(s);
    },
    utf8_to_b64: function (str) { return window.btoa(unescape(encodeURIComponent(str))); },
    b64_to_utf8: function (str) { str = str.replace(/\s/g, ''); return decodeURIComponent(escape(window.atob(str))); },
    arrayBufferToBase64: function (buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
        return window.btoa(binary);
    },
    loadCombo: function (datajson, params) {
        return new Promise(
            function (resolve, reject) {
                try {
                    if (params.placeholder == undefined) { params.placeholder = "[Seleccione]"; }
                    $(params.target).empty();
                    if (parseInt(params.selected) == -1) {
                        $(params.target).append('<option value="-1">' + params.placeholder + '</option>');
                    }
                    $.each(datajson.data, function (i, item) {
                        var _sel = "";
                        if (params.selected == item[params.id]) { _sel = "selected"; }
                        $(params.target).append('<option ' + _sel + ' value="' + item[params.id] + '">' + item[params.description] + '</option>');
                    });
                    resolve(true);
                } catch (rex) {
                    reject(rex);
                }
            });
    },
    iconByMime: function (_file_type, _data) {
        var _icon = "";
        switch (true) {
            case (_file_type.indexOf("image") != -1):
                _icon = "./assets/img/image.png?nocache1";
                break;
            case (_file_type.indexOf("wav") != -1):
            case (_file_type.indexOf("mp3") != -1):
            case (_file_type.indexOf("audio") != -1):
                _icon = "./assets/img/audio.png?nocache1";
                break;
            case (_file_type.indexOf("video") != -1):
            case (_file_type.indexOf("youtube") != -1):
            case (_file_type.indexOf("video") != -1):
                _icon = "./assets/img/video.png?nocache1";
                break;
            case (_file_type.indexOf("pdf") != -1):
                _icon = "./assets/img/pdf.png?nocache1";
                break;
            default:
                _icon = "./assets/img/file.png?nocache1";
                break;
        }
        return _icon;
    },
    prettyPrint: function (obj) {
        return JSON.stringify(obj, undefined, 4);
    },
    NASort: function (a, b) {
        if (a.innerHTML == 'NA') {
            return 1;
        }
        else if (b.innerHTML == 'NA') {
            return -1;
        }
        return (a.innerHTML > b.innerHTML) ? 1 : -1;
    },
    replaceAll: function (str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    },
    loadBrowser: function (datajson, params) {
        return new Promise(
            function (resolve, reject) {
                try {
                    var _full = false;
                    var _html = "";
                    $.each(datajson.data, function (i, item) {
                        if (i == 0) {
                            _full = true;
                            _html += "<table class='table table-condensed'>";
                            _html += " <thead>";
                            _html += "  <tr>";
                            $.each(params.cols, function (i, col) {
                                _html += "<th><b>" + col.title + "</b></th>";
                            });
                            _html += "  </tr>";
                            _html += " </thead>";
                            _html += " <tbody>";
                        }
                        _html += "<tr>";
                        $.each(params.cols, function (i, col) {
                            _html += "<td>" + item[col.field] + "</td>";
                        });
                        _html += "</tr>";
                    });
                    if (_full) {
                        _html += " </tbody>";
                        _html += "</table>";
                    }
                    $(params.target).html(_html);
                    resolve(true);
                } catch (rex) {
                    reject(rex);
                }
            });
    },
    createFileItem: function (_name, _result) {
        var _id = _TOOLS.UUID();
        return "<li class='list-group-item attach " + _id + "' data-name='" + _name + "' data-url='" + _result + "' style='padding:10px;'>Se ha adjuntado <span class='badge badge-success'>" + _name + "</span><a href='#' class='btn btn-xs btn-deattach btn-danger pull-right' data-id='" + _id + "' style='margin:0px;'><i class='material-icons'>delete_forever</i></a></li>"
    },
    copyToClipboard: function (_this) {
        var _id = _this.attr("data-source");
        elem = document.getElementById(_id);
        var targetId = "_hiddenCopyText_";
        var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
        var origSelectionStart, origSelectionEnd;
        if (isInput) {
            target = elem;
            origSelectionStart = elem.selectionStart;
            origSelectionEnd = elem.selectionEnd;
        } else {
            target = document.getElementById(targetId);
            if (!target) {
                var target = document.createElement("textarea");
                target.style.position = "absolute";
                target.style.left = "-9999px";
                target.style.top = "0";
                target.id = targetId;
                document.body.appendChild(target);
            }
            target.textContent = elem.textContent;
        }
        var currentFocus = document.activeElement;
        target.focus();
        target.setSelectionRange(0, target.value.length);
        var succeed;
        try { succeed = document.execCommand("copy"); } catch (e) { succeed = false; }
        if (currentFocus && typeof currentFocus.focus === "function") { currentFocus.focus(); }
        if (isInput) { elem.setSelectionRange(origSelectionStart, origSelectionEnd); } else { target.textContent = ""; }
        _TOOLS.onModalAlert("", "Se han copiado los datos al portapapeles.  Puede utilizarlos donde desee.", "info");
        return succeed;
    },
    onTraerLookUp: function (_table, _key = null) {
        return new Promise(
            function (resolve, reject) {
                var _json = { "function": "traerLookUp", "tabla": _table, "key": _key };
                _API.UiClubRedondoWSTransparent(_json).then(function (_data) {
                    resolve(_data);
                }).catch(function (error) {
                    reject(error);
                });
            });
    },
    onSetCookie: function (cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = ("expires=" + d.toUTCString());
        document.cookie = (cname + "=" + cvalue + ";" + expires + ";path=/");
    },
    onGetCookie: function (cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') { c = c.substring(1); }
            if (c.indexOf(name) == 0) { return c.substring(name.length, c.length); }
        }
        return "";
    },
    onGetParameterByName: function (name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    },
    onAllUrlParams: function (url) {
        var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
        var obj = {};
        if (queryString) {
            queryString = queryString.split('#')[0];
            var arr = queryString.split('&');
            for (var i = 0; i < arr.length; i++) {
                var a = arr[i].split('=');
                var paramName = a[0];
                var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
                paramName = paramName.toLowerCase();
                if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
                if (paramName.match(/\[(\d+)?\]$/)) {
                    var key = paramName.replace(/\[(\d+)?\]/, '');
                    if (!obj[key]) obj[key] = [];
                    if (paramName.match(/\[\d+\]$/)) {
                        var index = /\[(\d+)\]/.exec(paramName)[1];
                        obj[key][index] = paramValue;
                    } else {
                        obj[key].push(paramValue);
                    }
                } else {
                    if (!obj[paramName]) {
                        obj[paramName] = paramValue;
                    } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                        obj[paramName] = [obj[paramName]];
                        obj[paramName].push(paramValue);
                    } else {
                        obj[paramName].push(paramValue);
                    }
                }
            }
        }
        return obj;
    },
    stripHtml: function (html) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return (tmp.textContent || tmp.innerText || "");
    },
    isElementVisible: function (el) {
        if (typeof jQuery !== 'undefined' && el instanceof jQuery) { el = el[0]; }
        var rect = el.getBoundingClientRect();
        var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
        var windowWidth = (window.innerWidth || document.documentElement.clientWidth);
        var vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
        var horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

        return (vertInView && horInView);
    },
    waitForElement: function (selector, callback) {
        if ($(selector).length > 0) {
            setTimeout(function () { callback(); }, 1);
        } else {
            setTimeout(function () { _TOOLS.waitForElement(selector, callback); }, 1);
        }
    },
    LPAD: function (str, char, length) {
        while (String(str).length < length) { str = (char + str); }
        return str;
    },
    HtmlToPdfFile: function (_mode, _target, _fileName, _title, _text, _callback) {
        var PDF = new jsPDF();
        var elementHTML = document.querySelector(_target);

        PDF.html(elementHTML, {
            callback: function (doc) {
                var _ret = true;
                switch (_mode) {
                    case "base64":
                        doc.save(_fileName);
                        break;
                    case "share":
                        console.log(doc.output("arraybuffer"));
                        const buffer = doc.output("arraybuffer");
                        const pdf = new File([buffer], _fileName, { type: "application/pdf" });
                        const files = [pdf];
                        var shareData = { files: files, title: _title, text: _text };
                        if (navigator.canShare && navigator.canShare(shareData)) {
                            //console.log("can",true);
                            navigator.share(shareData);
                        } else {
                            //console.log("cannot", false);
                            _ret = false;
                        }
                        break;
                }
                if ($.isFunction(_callback)) { _callback(_ret); }
            },
            margin: [10, 10, 10, 10],
            autoPaging: 'text',
            x: 0,
            y: 0,
            width: 190, //target width in the PDF document
            windowWidth: 675 //window width in CSS pixels
        });
    },
    avoidCache: function (_target) {
        return false;
        //$(_target).each(function () { $(this).attr('src', $(this).attr('src') + '?' + (new Date()).getTime()); });
    },
    titleCase: function (str) {
        var splitStr = str.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) { splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1); }
        return splitStr.join(' ');
    },
    tagReplace: function (data, tag, value) {
        data = data.replace(tag, value);
        data = data.replace(tag, "");
        return data;
    },
    isMobileDevice: function () {
        let details = navigator.userAgent;
        let regexp = /android|iphone|kindle|ipad/i;
        let isMobileDevice = regexp.test(details);
        return isMobileDevice;
    },
    toFullscreen: function (_id) {
        const element = document.getElementById(_id);
        if (screenfull.isEnabled) { screenfull.request(element); }
    },
    checkPassword: function (_this) {
        var password = _this.val();
        var _ret = true;
        if (password.length >= 1 && password.length < 7) { _ret = false; }
        if (password.length >= 1 && !password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) { _ret = false; }
        if (password.length >= 1 && !password.match(/([a-zA-Z])/) && !password.match(/([0-9])/)) { _ret = false; }
        if (password.length >= 1 && !password.match(/([!,%,&,@,#,$,^,*,?,_,~,.,:,;])/)) { _ret = false; }
        return _ret;
    },
    validarCBU: function (nrocbu) {
        if (nrocbu.length != 22) { return false; }
        var bloque1 = nrocbu.substr(0, 8);
        if (bloque1.length != 8) { return false; }
        var banco = bloque1.substr(0, 3);
        var digitoVerificador1 = bloque1[3];
        var sucursal = bloque1.substr(4, 3);
        var digitoVerificador2 = bloque1[7];
        var suma = (banco[0] * 7 + banco[1] * 1 + banco[2] * 3 + digitoVerificador1 * 9 + sucursal[0] * 7 + sucursal[1] * 1 + sucursal[2] * 3);
        var diferencia = (10 - (suma % 10));
        if (diferencia == digitoVerificador2) {
            var bloque2 = nrocbu.substr(8, 14);
            if (bloque2.length != 14) { return false; }
            var digitoVerificador = bloque2[13];
            var suma = (bloque2[0] * 3 + bloque2[1] * 9 + bloque2[2] * 7 + bloque2[3] * 1 + bloque2[4] * 3 + bloque2[5] * 9 + bloque2[6] * 7 + bloque2[7] * 1 + bloque2[8] * 3 + bloque2[9] * 9 + bloque2[10] * 7 + bloque2[11] * 1 + bloque2[12] * 3);
            var diferencia = (10 - (suma % 10));
            return (diferencia == digitoVerificador);
        } else {
            return false;
        }
    },
    toMoney: function (_value, _intl, _style, _currency) {
        if (_intl == undefined) { _intl = "de-DE"; }
        var formatter = new Intl.NumberFormat(_intl, {
            style: _style,
            currency: _currency,
        });
        return formatter.format(_value);
    },
    onGetFirstBrowserLanguage: function () {
        var _ret = _TOOLS._avalilableLanguages[0];
        var nav = window.navigator, browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'], i, language;
        if (Array.isArray(nav.languages)) {
            for (i = 0; i < nav.languages.length; i++) {
                language = nav.languages[i];
                if (language && language.length) {
                    _ret = language.split("-")[0];
                    break;
                }
            }
        }
        for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
            language = nav[browserLanguagePropertyKeys[i]];
            if (language && language.length) {
                _ret = language.split("-")[0];
                break;
            }
        }
        if (!_TOOLS._avalilableLanguages.includes(_ret)) { _ret = _TOOLS._avalilableLanguages[0]; }
        return _ret;
    },
    prettyPrint: function (obj, _target) {
        var pretty = JSON.stringify(obj, undefined, 4);
        $(_target).html("<pre>" + pretty + "</pre>");
    },
    capitalizeFirstLetter: function (string) {
        return (string.charAt(0).toUpperCase() + string.toLowerCase().slice(1));
    },
};