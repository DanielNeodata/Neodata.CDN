var _v_distance_total = "Distancia total";
var _v_duration_total = "Duración total";
var _v_begin = "Comienza en";
var _v_end = "Termina en";
var _v_mode = "Modo";
var _v_instructions = "Instrucciones";
var _v_driving = "Conduciendo";
var _v_bicycling = "En bicicleta";
var _v_transit = "Por tránsito";
var _v_walking = "Caminando";
var _v_from = "desde";
var _v_to = "hasta";
var _v_stops = "paradas";
var _v_resolving = "Hay una petición aún en proceso";
var _v_select_marker = "Debe seleccionar un lugar para ver sus detalles o rutas";
var _v_guest_first_name = "Sin";
var _v_guest_last_name = "usuario";
var _v_search_here = "Buscar aquí";
var _v_select = "Seleccione facultad";
var _v_empty_combo = "¡Debe seleccionar una facultad!";

var _GMAP = {
    map: null,
    watchID: null,
    markers: [],
    _DEFAULT_POSITION: { lat: -34.5416838, lng: -58.7124407 }, //Casa Central
    _TRACK_POSITION: null,
    _DEFAULT_ZOOM: 12,
    _BIG_ZOOM: 14,
    _last_polyline: null,
    _last_route_mode: "",
    _route_color: "#141493",
    _ME_MARKER: null,
    _LAST_SELECTED_MARKER: null,
    _MARKERS: [],
    _MAP_STYLES: {
        default: null,
        hideAll: [
            { featureType: "poi", stylers: [{ visibility: "on" }] },
            { featureType: "poi.park", stylers: [{ visibility: "on" }] },
            { featureType: "transit", stylers: [{ visibility: "on" }] },
            { featureType: "administrative", stylers: [{ visibility: "on" }] },
            { featureType: "landscape", stylers: [{ visibility: "on" }] },
            { featureType: "road", stylers: [{ visibility: "on" }] },
        ],
    },
    onDetect: function () {
        _GMAP.watchID = navigator.geolocation.watchPosition(_GMAP.onWatchPosition, _GMAP.onWatchPositionError, { maximumAge: 0, timeout: 30000, enableHighAccuracy: true });
    },
    onCreateMap: function () {
        
        _GMAP.map = new google.maps.Map(document.getElementById('map'), {
            center: _GMAP._DEFAULT_POSITION,
            zoom: _GMAP._DEFAULT_ZOOM,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                position: google.maps.ControlPosition.LEFT_TOP
            },
            mapTypeControl: false,
            fullscreenControl: false,
            scaleControl: false,
            streetViewControl: false,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            },
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
            },
        });
        for (var i = 0; i < _GMAP.markers.length; i++) { _GMAP.markers[i].setMap(null); }
        _GMAP.markers = [];
        _GMAP._LAST_SELECTED_MARKER = null;
    },

    onDrawMarkers: function (_jsonRecords) {
        _GMAP._MARKERS = _jsonRecords;
        $.each(_GMAP._MARKERS, function (i, obj) {
            obj["zoom"] = _GMAP._DEFAULT_ZOOM;
            var _size = { width: 30, height: 36 };
            var latLng = new google.maps.LatLng(obj.lat, obj.lng);
            var _image = { url: (obj.icon), scaledSize: new google.maps.Size(_size.width, _size.height) };
            var _class = "no-marker-label";
            var _content = obj.name;
            var marker = new MarkerWithLabel(
                {
                    position: latLng,
                    animation: google.maps.Animation.DROP,
                    draggable: false,
                    map: _GMAP.map,
                    icon: _image,
                    title: obj.name + " " + obj.address,
                    labelContent: _content,
                    labelAnchor: new google.maps.Point(-5, 5),
                    labelClass: _class,
                    labelInBackground: true
                });
            _GMAP.markers.push(marker);
            marker.addListener('click', function (event) {
                _GMAP._LAST_SELECTED_MARKER = marker;
                try { _GMAP.map.setCenter({ lat: event.latLng.lat(), lng: event.latLng.lng() }); } catch (rex) { }
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null);
                } else {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function () { marker.setAnimation(null); }, 1500);
                }
                _GMAP.onToggleInfoMap(obj).then(function (data) { }).catch(function (err) { });
            });
        });
    },

    onToggleInfoMap: function (_json) {
        return new Promise(
            function (resolve, reject) {
                try {
                    var _height = ($(window).height() * 0.40);
                    $(".info-map").fadeOut("fast", function () {
                        //$(".info-map").css({ "height": _height + "px" });
                        //$(".info-map").css({ "bottom": "-" + _height + "px" }).show();
                        if (_GMAP._last_polyline) { _GMAP._last_polyline.setMap(null); _GMAP._last_polyline = null; };
                        $(".marker-name").html(_json.name);
                        $(".marker-address").html(_json.address);
                        $(".marker-open").html(_json.open);
                        $(".marker-transport").html(_json.transport);
                        $(".info-map").removeClass("d-none").show().animate({ "bottom": "0px" }, { duration: 500, easing: "easeOutQuad", mobileHA: true });
                        _GMAP.map.setZoom(parseInt(_json["zoom"]));
                        _GMAP.onTraceRoute();
                        resolve(_json);
                    });
                } catch (rex) {
                    reject(rex);
                }
            }
        )
    },
    onTrackMe: function (_json) {
        if (_GMAP._ME_MARKER) {
            _GMAP.map.setCenter(_json);
            _GMAP.map.setZoom(parseInt(_GMAP._DEFAULT_ZOOM));
            if (_GMAP._ME_MARKER.getAnimation() !== null) {
                _GMAP._ME_MARKER.setAnimation(null);
            } else {
                _GMAP._ME_MARKER.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () { _GMAP._ME_MARKER.setAnimation(null); }, 1000);
            }
        }
    },
    onWatchPosition: function (position) {
        try {
            if (position.coords == undefined) { throw new Error(null); }
            _GMAP._TRACK_POSITION = { lat: position.coords.latitude, lng: position.coords.longitude };
            var _size = { width: 40, height: 40 };
            var _image = { url: ("./img/Comun/me.png?nocache1"), scaledSize: new google.maps.Size(_size.width, _size.height) };
            if (_GMAP._ME_MARKER) { _GMAP._ME_MARKER.setMap(null); }
            _GMAP._ME_MARKER = new google.maps.Marker(
                {
                    position: _GMAP._TRACK_POSITION,
                    draggable: false,
                    map: _GMAP.map,
                    icon: _image,
                    title: "Mi ubicación actual",
                });
            _GMAP._ME_MARKER.addListener('click', function (event) {
                _GMAP.onTrackMe({ lat: event.latLng.lat(), lng: event.latLng.lng() });
            });
        } catch (err) {
            _GMAP.onWatchPositionError();
        }
    },
    onWatchPositionError: function () {
        _GMAP._TRACK_POSITION = _GMAP._DEFAULT_POSITION;
        if (_GMAP._ME_MARKER) {
            _GMAP._ME_MARKER.setMap(null);
            _GMAP._ME_MARKER = null;
        }
    },
    onTraceRoute: function (_json) {
        if (_GMAP._resolving) { return false; }
        if (_GMAP._last_polyline) { _GMAP._last_polyline.setMap(null); _GMAP._last_polyline = null; };
        if (_GMAP._last_route_mode == "") { _GMAP._last_route_mode = "driving"; }
        var _params = {
            "origin": (_GMAP._TRACK_POSITION.lat + "," + _GMAP._TRACK_POSITION.lng),
            "destination": (_GMAP._LAST_SELECTED_MARKER.getPosition().lat() + "," + _GMAP._LAST_SELECTED_MARKER.getPosition().lng()),
            "mode": _GMAP._last_route_mode,
            "language": "es",
            "units": "metric",
        };
        _GMAP._resolving = true;
        _API.UiGetDirections(_params).then(function (datajson) {
            var _ok = false;
            $.each(datajson.routes, function (i, route) {
                _ok = true;
                var _html = "";
                _GMAP._last_polyline = new google.maps.Polyline({
                    path: google.maps.geometry.encoding.decodePath(route.overview_polyline.points),
                    strokeColor: _GMAP._route_color,
                    strokeOpacity: 0.50,
                    strokeWeight: 5,
                    fillColor: _GMAP._route_color,
                    fillOpacity: 1.0,
                    map: _GMAP.map,
                });
                $.each(route.legs, function (x, leg) {
                    _html += "<p><b>" + _v_distance_total + " " + leg.distance.text + " " + _v_duration_total + " " + leg.duration.text + "</b></p>";
                    _html += "<p>" + _v_begin + " " + leg.start_address + " " + "<th>" + _v_end + " " + leg.end_address + "</p>";
                    $.each(leg.steps, function (y, step) {
                        var _color = "transparent";
                        _html += "<p>" + step.html_instructions + "</p>";
                        if (step.transit_details) {
                            _html += "<p><img src='" + step.transit_details.line.vehicle.icon + "'/>" + step.transit_details.line.short_name + " " + step.transit_details.line.name + "<br/>";
                            _html += step.transit_details.num_stops + " " + _v_stops + " " + _v_to + " " + step.transit_details.arrival_stop.name + "</p>";
                        }
                        _html += "<p style='text-align:right;'>" + step.distance.text + " " + step.duration.text + "</p>";
                    });
                    _html += "</tbody>";
                    _html += "</table>";
                });
                $(".directions").html(_html);
                _GMAP._resolving = false;
            });
            if (!_ok) {
                $(".directions").html("<h2>Sin información disponible para ir a la sucursal, desde su ubicación</h2>");
            }
        });
    },
};


