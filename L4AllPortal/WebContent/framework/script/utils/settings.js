/*==================================================
 *  sulle orme di  Exhibit.SettingsUtilities
 *
 *  cerca i valori dei parametri dell'oggetto negli attributi del tag html che definisce l'oggetto stesso 
 *  e assegna i valori alla variabile this._settings.xxxx
 *
 *==================================================
 */
SettingsUtilities = new Object();


SettingsUtilities._internalCollectSettings = function(id, specs, settings) {
    f = function(field){
            var str0 = '#'+id;
            var str = $(str0).attr(field);
            return str;
    }
    for (var field in specs) {
        var spec = specs[field];
        var name = field;
        if ("name" in spec) {
            name = spec.name;
        }
        if (!(name in settings) && "defaultValue" in spec) {
            settings[name] = spec.defaultValue;
        }
        
        var value = f(field);
        if (value == null) {
            continue;
        }
        
        if (typeof value == "string") {
            //value = value.trim();
            if (value.length == 0) {
                continue;
            }
        }
        
        var type = "text";
        if ("type" in spec) {
            type = spec.type;
        }
        
        var dimensions = 1;
        if ("dimensions" in spec) {
            dimensions = spec.dimensions;
        }
        
        try {
            if (dimensions > 1) {
                var separator = ",";
                if ("separator" in spec) {
                    separator = spec.separator;
                }
                
                var a = value.split(separator);
                if (a.length != dimensions) {
                    throw new Error("Expected a tuple of " + dimensions + " dimensions separated with " + separator + " but got " + value);
                } else {
                    for (var i = 0; i < a.length; i++) {
                        a[i] = SettingsUtilities._parseSetting(a[i].trim(), type, spec);
                    }
                    
                    settings[name] = a;
                }
            } else {
                settings[name] = SettingsUtilities._parseSetting(value, type, spec);
            }
        } catch (e) {
            SimileAjax.Debug.exception(e);
        }
    }
};

SettingsUtilities._parseSetting = function(s, type, spec) {
    var sType = typeof s;
    if (type == "text") {
        return s;
    } else if (type == "float") {
        if (sType == "number") {
            return s;
        } else if (sType == "string") {
            var f = parseFloat(s);
            if (!isNaN(f)) {
                return f;
            }
        }
        throw new Error("Expected a floating point number but got " + s);
    } else if (type == "int") {
        if (sType == "number") {
            return Math.round(s);
        } else if (sType == "string") {
            var n = parseInt(s);
            if (!isNaN(n)) {
                return n;
            }
        }
        throw new Error("Expected an integer but got " + s);
    } else if (type == "boolean") {
        if (sType == "boolean") {
            return s;
        } else if (sType == "string") {
            s = s.toLowerCase();
            if (s == "true") {
                return true;
            } else if (s == "false") {
                return false;
            }
        }
        throw new Error("Expected either 'true' or 'false' but got " + s);
    } else if (type == "function") {
        if (sType == "function") {
            return s;
        } else if (sType == "string") {
            try {
                var f = eval(s);
                if (typeof f == "function") {
                    return f;
                }
            } catch (e) {
                // silent
            }
        }
        throw new Error("Expected a function or the name of a function but got " + s);
    } else if (type == "enum") {
        var choices = spec.choices;
        for (var i = 0; i < choices.length; i++) {
            if (choices[i] == s) {
                return s;
            }
        }
        throw new Error("Expected one of " + choices.join(", ") + " but got " + s);
    } else {
        throw new Error("Unknown setting type " + type);
    }
};

