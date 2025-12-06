var _DB = {
    _reinit_database: false,
    _APP_DATABASE: {},
    _APP_TABLES: {},
    db: null,
    onInit: function () {
        return new Promise(
            function (resolve, reject) {
                try {
                    _DB.db = window.openDatabase(_DB._APP_DATABASE.schema, _DB._APP_DATABASE.version, _DB._APP_DATABASE.schema + " DB", _DB._APP_DATABASE.size);
                    $.each(_DB._APP_TABLES.tables, function (i, obj) {
                        var _sql = ("drop table if exists " + obj.name);
                        if (_DB._reinit_database) { _DB.onExecuteSql(_sql); }
                        _sql = ("create table if not exists " + obj.name + obj.script);
                        _DB.onExecuteSql(_sql);
                    });
                    $.each(_DB._APP_TABLES.index, function (i, obj) { _DB.onExecuteSql(obj.script); });
                    resolve(null);
                } catch (err) {
                    reject(err);
                }
            });
    },
    onExecuteSql: function (_sql) {
        return new Promise(
            function (resolve, reject) {
                _DB.db.transaction(function (tx) { tx.executeSql(_sql, [], function (tx, data) { resolve(data); }); }, function (err) { reject(err); }, null);
            });
    },
    onLocalCleanDeadCache: function (_table) {
        var _sql = "delete from " + _table;// + " where DATE(data_cache) < DATE('" + _TOOLS.todayYYYYMMDD('-') + "')";
        _DB.onExecuteSql(_sql);
    },
    onLocalAllCleanDeadCache: function () {
        $.each(_DB._APP_TABLES.tables, function (i, obj) {
            _DB.onLocalCleanDeadCache(obj.name);
        });
    },
    Set: function (_key, _json_value) {
        try {
            localStorage.setItem(_key, JSON.stringify(_json_value));
            return true;
        } catch (err) {
            return false;
        }
    },
    Get: function (_key) {
        try {
            return JSON.parse(localStorage.getItem(_key));
        } catch (err) {
            return null;
        }
    },
    Remove: function (_key) {
        try {
            localStorage.removeItem(_key);
            return true;
        } catch (err) {
            return false;
        }
    },
};