AT_Interview.prototype.convertDeclarations = function () {
    var res = '';
    for (var i = 0; i < this.features.length; i++) {
        res += '\nТИП ТИП' + (i + 1) + '\nСИМВОЛ';
        for (var j = 0; j < this.features[i].values.length; j++) {
            res += '\n"' + this.features[i].values[j] + '"';
        }
        res += '\nКОММЕНТАРИЙ Тип для признака "' + this.features[i].title + '"\n';
    }

    if (this.diagnoses.length) {
        res += '\nТИП ТИП' + (this.features.length + 1) + '\nСИМВОЛ';
        for (var i = 0; i < this.diagnoses.length; i++) {
            res += '\n"' + this.diagnoses[i] + '"';
        }
        res += '\nКОММЕНТАРИЙ Заключение';
    }

    res += '\n\nОБЪЕКТ Пациент\nГРУППА ГРУППА1\nАТРИБУТЫ';
    for (var i = 0; i < this.features.length; i++) {
        res += '\nАТРИБУТ ' + this.features[i].title.replaceAll(' ', '_').replaceAll('-', '_') + '\nТИП ТИП' + (i + 1) + '\nКОММЕНТАРИЙ ' + this.features[i].title;
    }

    if (this.diagnoses.length) {
        res += '\nАТРИБУТ Заключение\nТИП ТИП' + (this.features.length + 1) + '\nКОММЕНТАРИЙ Заключение';
    }
    res += '\nКОММЕНТАРИЙ Пациент';

    return res;
}

AT_Interview.prototype.convertDeclarationsAT = function () {
    var res = '';
    for (var i = 0; i < this.features.length; i++) {
        res += '\nТИП ТИП' + (i + 1) + '\nСИМВОЛ';
        for (var j = 0; j < this.features[i].values.length; j++) {
            res += '\n"' + this.features[i].values[j] + '"';
        }
        res += '\nКОММЕНТАРИЙ Тип для признака "' + this.features[i].title + '"\n';
    }

    if (this.diagnoses.length) {
        res += '\nТИП ТИП' + (this.features.length + 1) + '\nСИМВОЛ';
        for (var i = 0; i < this.diagnoses.length; i++) {
            res += '\n"' + this.diagnoses[i] + '"';
        }
        res += '\nКОММЕНТАРИЙ Заключение';
    }

    res += '\n\nОБЪЕКТ ОБЪЕКТ1\nГРУППА ГРУППА1\nАТРИБУТЫ';
    for (var i = 0; i < this.features.length; i++) {
        res += '\nАТРИБУТ АТРИБУТ' + (i + 1) + '\nТИП ТИП' + (i + 1) + '\nКОММЕНТАРИЙ ' + this.features[i].title;
    }

    if (this.diagnoses.length) {
        res += '\nАТРИБУТ АТРИБУТ' + (this.features.length + 1) + '\nТИП ТИП' + (this.features.length + 1) + '\nКОММЕНТАРИЙ Заключение';
    }
    res += '\nКОММЕНТАРИЙ Пациент';

    return res;
}

AT_Feature.prototype.convertToRules = function (objName, comment, startNum, fromRoot) {
    var name = objName || 'Пациент';
    var num = startNum || 1;
    var res = '';
    var conclusions = fromRoot ? this.getConclusionNodes() : this._getConclusionNodes();
    for (var i = 0; i < conclusions.length; i++) {
        var c = conclusions[i];
        var p = this.getParentNode(c);
        res += 'ПРАВИЛО ПРАВИЛО' + num + '\nЕСЛИ\n    ' + name + '.' + p.title.replaceAll(' ', '_').replaceAll('-', '_') + '="' + p.getBranch(c).name + '" УВЕРЕННОСТЬ ' + JSON.stringify(p.getBranch(c).settings.belief).replace(',', ';') + ' ТОЧНОСТЬ ' + p.getBranch(c).settings.accuracy;
        while (p.previouce && (!fromRoot && p.previouce.isDeeper(this) || fromRoot)) {
            var tmp = p.previouce;
            var b = tmp.getBranch(p);
            res += ' &\n    ' + name + '.' + tmp.title.replaceAll(' ', '_').replaceAll('-', '_') + '="' + b.name + '" УВЕРЕННОСТЬ ' + JSON.stringify(b.settings.belief).replace(',', ';') + ' ТОЧНОСТЬ ' + b.settings.accuracy;
            p = tmp;
        }
        res += '\nТО';
        for (var j = 0; j < c.conclusion.length; j++) {
            var title = 'Заключение';
            if (c.conclusion[j].value.title) {
                title = c.conclusion[j].value.title.replaceAll(' ', '_').replaceAll('-', '_');
            }
            res += '\n    ' + name + '.' + title + '="' + c.conclusion[j].value.value + '" УВЕРЕННОСТЬ ' + JSON.stringify(c.conclusion[j].settings.belief).replace(',', ';') + ' ТОЧНОСТЬ ' + c.conclusion[j].settings.accuracy;
        }
        res += '\nКОММЕНТАРИЙ ' + (comment || ('ПРАВИЛО' + num)) + '\n\n';
        num++;
    }
    return res;
}

AT_Feature.prototype.convertToRulesAT = function (objName, comment, startNum, fromRoot, features) {
    var name = objName || 'ОБЪЕКТ1';
    var num = startNum || 1;
    var res = '';
    var conclusions = fromRoot ? this.getConclusionNodes() : this._getConclusionNodes();
    for (var i = 0; i < conclusions.length; i++) {
        var c = conclusions[i];
        var p = this.getParentNode(c);
        res += 'ПРАВИЛО ПРАВИЛО' + num + '\nЕСЛИ\n    ' + name + '.АТРИБУТ' + (features.indexOf(p.title) + 1) + '="' + p.getBranch(c).name + '" УВЕРЕННОСТЬ ' + JSON.stringify(p.getBranch(c).settings.belief).replace(',', ';') + ' ТОЧНОСТЬ ' + p.getBranch(c).settings.accuracy;
        while (p.previouce && (!fromRoot && p.previouce.isDeeper(this) || fromRoot)) {
            var tmp = p.previouce;
            var b = tmp.getBranch(p);
            res += ' &\n    ' + name + '.АТРИБУТ' + (features.indexOf(tmp.title) + 1) + '="' + b.name + '" УВЕРЕННОСТЬ ' + JSON.stringify(b.settings.belief).replace(',', ';') + ' ТОЧНОСТЬ ' + b.settings.accuracy;
            p = tmp;
        }
        res += '\nТО';
        for (var j = 0; j < c.conclusion.length; j++) {
            var title = 'АТРИБУТ' + (features.length + 1);
            if (c.conclusion[j].value.title) {
                title = 'АТРИБУТ' + (features.indexOf(c.conclusion[j].value.title) + 1);
            }
            res += '\n    ' + name + '.' + title + '="' + c.conclusion[j].value.value + '" УВЕРЕННОСТЬ ' + JSON.stringify(c.conclusion[j].settings.belief).replace(',', ';') + ' ТОЧНОСТЬ ' + c.conclusion[j].settings.accuracy;
        }
        res += '\nКОММЕНТАРИЙ ' + (comment || ('ПРАВИЛО' + num)) + '\n\n';
        num++;
    }
    return res;
}

var encodeCP1251 = function (string) {
    function encodeChar(c) {
        var isKyr = function (str) {
            return /[а-я]/i.test(str);
        }
        var cp1251 = 'ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—�™љ›њќћџ ЎўЈ¤Ґ¦§Ё©Є«¬*®Ї°±Ііґµ¶·\
ё№є»јЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя';
        var p = isKyr(c) ? (cp1251.indexOf(c) + 128) : c.charCodeAt(0);
        var h = p.toString(16);
        if (h == 'a') {
            h = '0A';
        }
        return '%' + h;
    }
    var res = '';
    for (var i = 0; i < string.length; i++) {
        res += encodeChar(string.charAt(i)) //ну или string[i]
    }
    return res;
}

function decodeCP1251(string) {
    function decodeChar(s, p) {
        var cp1251 = 'ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—�™љ›њќћџ ЎўЈ¤Ґ¦§Ё©Є«¬*®Ї°±Ііґµ¶·\
ё№є»јЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя';
        p = parseInt(p, 16);
        return p < 128 ? String.fromCharCode(p) : cp1251[p - 128];
    }
    var str = string;
    return str.replace(/%(..)/g, decodeChar);
}

String.prototype.replaceAll = function (search, replace) {
    return this.split(search).join(replace);
}

var features = [];
for (var i = 0; i < interview.features.length; i++) {
    features.push(interview.features[i].title)
}

function saveAllDeclaraions(ATType) {
    var decs = ATType ? 'data:text/plain;charset:CP1251,' + encodeCP1251(interview.convertDeclarationsAT()) : 'data:text/plain,' + interview.convertDeclarations();
    var a = document.createElement("a");
    a.setAttribute("href", decs);
    a.setAttribute("download", "declarations.kbs");
    a.click();
}

function getAllRulesFromNumber(ATType, num, fs) {
    var rules = ATType ? (interview.root.convertToRulesAT(null, null, num, null, fs)) : interview.root.convertToRules(null, null, num);
    return rules;
}

function saveRulesFromNumber(ATType, num, fs) {
    var rules = (ATType ? 'data:text/plain;charset:CP1251,' : 'data:text/plain,') + ATType ? encodeCP1251(getAllRulesFromNumber(ATType, num, fs)) : getAllRulesFromNumber(ATType, num, fs);
    var a = document.createElement("a");
    a.setAttribute("href", rules);
    a.setAttribute("download", "rules.kbs");
    a.click();
}