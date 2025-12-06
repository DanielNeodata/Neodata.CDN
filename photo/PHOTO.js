var _PHOTO = {
    onGetPicture: function (_this) {
        try {
            navigator.camera.getPicture(_PHOTO.onPhotoDataSuccess, _PHOTO.onPhotoFail,
                {
                    quality: 100,
                    destinationType: 0,
                    sourceType: _this.attr("data-source"),
                    encodingType: 0,
                    targetWidth: 1536,
                    targetHeight: 2048,
                    allowEdit: false,
                    correctOrientation: false
                });
        } catch (err) {
            modalAlert("Error", "<b>No se ha podido tomar la foto en forma adecuada.</b><br/>Su dispositivo puede tener algún problema de configuración, de memoria o de espacio libre para el almacenamiento.");
        }
    },
    onPhotoDataSuccess: function (_imageData) {
        var _type_media = "data:image/jpeg;base64,";
        var _json = {
            "carbon_copy": 0,
            "message": ("Imagen: " + _TOOLS.getNow()),
            "raw_data": ('{"mime":"' + _type_media + '","base64":"' + _imageData + '"}'),
            "id_charge_code":  $(".paycode").html(),
            "id_type_item": 1,
            "id_type_direction": 1,
            "type_media": _type_media
        };
        _API.UiDirectTelemedicina(_json).then(function (data) {
            if (data.status == "OK") {
                modalAlert("Alerta", "<b>Se ha enviado la imagen en forma exitosa</b>");
            } else {
                throw data;
            }
        }).catch(function (err) {
            modalAlert("Alerta", "<b style='color:red;'>No se ha enviado ninguna imagen.  " + err.message + "</b>");
        });

    },
    onPhotoFail: function (message) {
        modalAlert("Alerta", "<b style='color:orange;'>No se ha enviado ninguna imagen.  Reintente</b>");
    },
}
