AT_Feature.prototype.convertToRulesCP = function (objName, comment, startNum, fromRoot) {
    var name = objName || '�������';
    var num = startNum || 1;
    var res = '';
    var conclusions = fromRoot ? this.getConclusionNodes() : this._getConclusionNodes();
    for (var i = 0; i < conclusions.length; i++) {
        var c = conclusions[i];
        var p = this.getParentNode(c);
        res += '������� �������' + num + '\n����\n    ' + name + '.' + p.title.replaceAll(' ', '_').replaceAll('-', '_') + '="' + p.getBranch(c).name + '" ����������� ' + JSON.stringify(p.getBranch(c).settings.belief).replace(',', ';') + ' �������� ' + p.getBranch(c).settings.accuracy;
        while (p.previouce && (!fromRoot && p.previouce.isDeeper(this) || fromRoot)) {
            var tmp = p.previouce;
            var b = tmp.getBranch(p);
            res += ' &\n    ' + name + '.' + tmp.title.replaceAll(' ', '_').replaceAll('-', '_') + '="' + b.name + '" ����������� ' + JSON.stringify(b.settings.belief).replace(',', ';') + ' �������� ' + b.settings.accuracy;
            p = tmp;
        }
        res += '\n��';
        for (var j = 0; j < c.conclusion.length; j++) {
            var title = '����������';
            if (c.conclusion[j].value.title) {
                title = c.conclusion[j].value.title.replaceAll(' ', '_').replaceAll('-', '_');
            }
            res += '\n    ' + name + '.' + title + '="' + c.conclusion[j].value.value + '" ����������� ' + JSON.stringify(c.conclusion[j].settings.belief).replace(',', ';') + ' �������� ' + c.conclusion[j].settings.accuracy;
        }
        res += '\n����������� ' + (comment || ('�������' + num)) + '\n\n';
        num++;
    }
    return res;
}

AT_Interview.prototype.convertDeclarationsCP = function () {
    var res = '';
    for (var i = 0; i < this.features.length; i++) {
        res += '\n��� ���' + (i + 1) + '\n������';
        for (var j = 0; j < this.features[i].values.length; j++) {
            res += '\n"' + this.features[i].values[j] + '"';
        }
        res += '\n����������� ��� ��� �������� "' + this.features[i].title + '"\n';
    }

    if (this.diagnoses.length) {
        res += '\n��� ���' + (this.features.length + 1) + '\n������';
        for (var i = 0; i < this.diagnoses.length; i++) {
            res += '\n"' + this.diagnoses[i] + '"';
        }
        res += '\n����������� ����������';
    }

    res += '\n\n������ �������\n������ ������1\n��������';
    for (var i = 0; i < this.features.length; i++) {
        res += '\n������� ' + this.features[i].title.replaceAll(' ', '_').replaceAll('-', '_') + '\n��� ���' + (i + 1) + '\n����������� ' + this.features[i].title;
    }

    if (this.diagnoses.length) {
        res += '\n������� ����������\n��� ���' + (this.features.length + 1) + '\n����������� ����������';
    }
    res += '\n����������� �������';

    return res;
}