AT_Feature.prototype.convertToRulesCP = function (objName, comment, startNum, fromRoot) {
    var name = objName || 'оЮЖХЕМР';
    var num = startNum || 1;
    var res = '';
    var conclusions = fromRoot ? this.getConclusionNodes() : this._getConclusionNodes();
    for (var i = 0; i < conclusions.length; i++) {
        var c = conclusions[i];
        var p = this.getParentNode(c);
        res += 'опюбхкн опюбхкн' + num + '\nеякх\n    ' + name + '.' + p.title.replaceAll(' ', '_').replaceAll('-', '_') + '="' + p.getBranch(c).name + '" сбепеммнярэ ' + JSON.stringify(p.getBranch(c).settings.belief).replace(',', ';') + ' рнвмнярэ ' + p.getBranch(c).settings.accuracy;
        while (p.previouce && (!fromRoot && p.previouce.isDeeper(this) || fromRoot)) {
            var tmp = p.previouce;
            var b = tmp.getBranch(p);
            res += ' &\n    ' + name + '.' + tmp.title.replaceAll(' ', '_').replaceAll('-', '_') + '="' + b.name + '" сбепеммнярэ ' + JSON.stringify(b.settings.belief).replace(',', ';') + ' рнвмнярэ ' + b.settings.accuracy;
            p = tmp;
        }
        res += '\nрн';
        for (var j = 0; j < c.conclusion.length; j++) {
            var title = 'гЮЙКЧВЕМХЕ';
            if (c.conclusion[j].value.title) {
                title = c.conclusion[j].value.title.replaceAll(' ', '_').replaceAll('-', '_');
            }
            res += '\n    ' + name + '.' + title + '="' + c.conclusion[j].value.value + '" сбепеммнярэ ' + JSON.stringify(c.conclusion[j].settings.belief).replace(',', ';') + ' рнвмнярэ ' + c.conclusion[j].settings.accuracy;
        }
        res += '\nйнллемрюпхи ' + (comment || ('опюбхкн' + num)) + '\n\n';
        num++;
    }
    return res;
}

AT_Interview.prototype.convertDeclarationsCP = function () {
    var res = '';
    for (var i = 0; i < this.features.length; i++) {
        res += '\nрхо рхо' + (i + 1) + '\nяхлбнк';
        for (var j = 0; j < this.features[i].values.length; j++) {
            res += '\n"' + this.features[i].values[j] + '"';
        }
        res += '\nйнллемрюпхи рХО ДКЪ ОПХГМЮЙЮ "' + this.features[i].title + '"\n';
    }

    if (this.diagnoses.length) {
        res += '\nрхо рхо' + (this.features.length + 1) + '\nяхлбнк';
        for (var i = 0; i < this.diagnoses.length; i++) {
            res += '\n"' + this.diagnoses[i] + '"';
        }
        res += '\nйнллемрюпхи гЮЙКЧВЕМХЕ';
    }

    res += '\n\nназейр оЮЖХЕМР\nцпсоою цпсоою1\nюрпхасрш';
    for (var i = 0; i < this.features.length; i++) {
        res += '\nюрпхаср ' + this.features[i].title.replaceAll(' ', '_').replaceAll('-', '_') + '\nрхо рхо' + (i + 1) + '\nйнллемрюпхи ' + this.features[i].title;
    }

    if (this.diagnoses.length) {
        res += '\nюрпхаср гЮЙКЧВЕМХЕ\nрхо рхо' + (this.features.length + 1) + '\nйнллемрюпхи гЮЙКЧВЕМХЕ';
    }
    res += '\nйнллемрюпхи оЮЖХЕМР';

    return res;
}