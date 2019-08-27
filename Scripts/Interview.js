Array.prototype.max = function () {
    var res = this[0];
    for (var i = 0; i < this.length; i++) {
        if (res < this[i]) {
            res = this[i];
        }
    }
    return res;
}

Array.prototype.remove = function (index, stay) {
    var a = [];
    for (var i = 0; i < this.length; i++) {
        a.push(this[i]);
    }
    a.splice(index, 1);
    if (!stay) {
        this.splice(index, 1);
    }
    return a;
}

Array.prototype.min = function () {
    var res = this[0];
    for (var i = 0; i < this.length; i++) {
        if (res > this[i]) {
            res = this[i];
        }
    }
    return res;
}

HTMLCollection.prototype.indexOf = Array.prototype.indexOf;

String.prototype.replaceAll = function (search, replace) {
    return this.split(search).join(replace);
}

var AT_Interview = function () {
    this.root = null;
    this.sessions = [];
    this.currentSession = null;
    this.features = [];
    this.position = null;
    this.diagnoses = [];
}

AT_Interview.prototype.init = function (e) {
    this.mainFrame = e;
    this.mainFrame.innerHTML = '';
    this.ZIndexes = [1];

    if (document.getElementById('interview-style')) {
        document.getElementById('interview-style').remove();
    }
    var style = document.createElement('style');
    style.setAttribute('id', 'interview-style');
    style.setAttribute('type', 'text/css');

    style.innerText = '.branch-stb {position:absolute; transform:translate(0%, -10%); cursor:pointer; bacground:transparent; display:none} .branch-stb:hover{display:inline; background: #f0feff;} .visible-stb{position:absolute; transform:translate(0%, -10%); cursor:pointer; display:inline; background: #f0feff; border:1px solid silver;} .drop {position: absolute;} .drop-btn{padding: 5px; margin: 2px; border: 1px solid silver; background: #f0feff; cursor:pointer} .drop-btn:hover{background: white;} .modal-layer {display: block; background: rgba(160, 160, 160, 0.42); position: absolute; top:0px; left:0px; width: 100%; min-height:min-content; height:100%;} .modal-message {background:white; position:absolute; padding:20px; left:50%; top:50%; transform: translate(-50%, -50%);} .frame{position: absolute; padding:40px; left:50%; top:50%; transform: translate(-50%, -50%); background:#ededed} .wrapper{border: 1px #c4c4c4 solid; padding: 10px;}';

    document.head.appendChild(style);

    AT_Feature.prototype.addStyle();
};

AT_Interview.prototype.buildControls = function () {
    var line = document.createElement('div');
    line.style = 'position: absolute; top:0px; left:0px; width: 100%; padding: 20px; background: rgba(160, 160, 160, 0.42);';
    line.style.zIndex = 2;
    line.id = "line";
    var save = document.createElement('button');
    save.innerText = 'Сохранить';

    var load = document.createElement('button');
    load.innerText = 'Загрузить';

    line.appendChild(save);
    line.appendChild(load);

    var self = this;

    save.onclick = function () {
        self.saveToFile();
    }

    load.onclick = function () {

        var fileInput = document.createElement('input');
        fileInput.type = 'file';

        fileInput.oninput = function () {
            var file = fileInput.files[0];

            var reader = new FileReader();
            reader.onload = function (e) {
                var obj = JSON.parse(e.target.result);
                self.features = obj.features;
                self.diagnoses = obj.diagnoses;
                self.startFromObject(obj);
            };
            reader.readAsText(file);
        }
        fileInput.click();
    }

    this.mainFrame.appendChild(line);
}



AT_Interview.prototype.saveToFile = function () {
    var s = {};

    if (!this.name) {
        this.name = 'protocol';
    }

    s.name = this.name;

    s.data = this.root.toJSON();
    s.step = this.position.step;
    s.features = this.features;
    s.diagnoses = this.diagnoses;
    var bs = this.position.concludedBranchesIS();
    if (bs) {
        var stp = [];
        for (var i = 0; i < bs.length; i++) {
            var cn = this.position.branches[bs[i]].next.conclusion;
            for (var j = 0; j < cn.length; j++) {
                stp.push(cn[j].step);
            }
        }
        s.step = stp.max();
    }
    var message = this.createModal();
    var fields = this.addModalFields(message);
    fields[0].innerHTML = 'Укажите имя файла: <input value="' + this.name + '"></input> .prc';
    var save = document.createElement('button');
    save.innerText = 'Сохранить';
    var back = document.createElement('button');
    back.innerText = 'Отмена';

    fields[1].appendChild(save);
    fields[1].appendChild(back);

    var self = this;

    back.onclick = function () {
        self.removeLastModal();
    }

    save.onclick = function () {
        var a = document.createElement("a");
        self.name = message.getElementsByTagName('input')[0].value;
        s.name = message.getElementsByTagName('input')[0].value;
        a.setAttribute("href", "data:text/plain," + JSON.stringify(s));
        a.setAttribute("download", message.getElementsByTagName('input')[0].value + ".prc");

        a.click();
        self.removeLastModal();
    }
}

AT_Interview.prototype.startFromObject = function (obj) {
    this.name = obj.name;
    this.root = AT_Feature.fromJSON(obj.data);
    this.position = this.root.getNodeByStep(obj.step);
    this.startFromPoint(this.position);
}

AT_Interview.prototype.start = function () {
    this.buildControls();
    this.startFrame = this.buildFeatureInput();
}

AT_Interview.prototype.buildFeatureInput = function () {
    var settings = {
        "belief": [50, 100],
        "accuracy": 0
    };

    if (document.getElementById('feature-input')) {
        document.getElementById('feature-input').remove();
    }

    var frame = document.createElement('div');
    frame.className = 'frame';
    frame.setAttribute('id', 'feature-input');

    var titleWrapper = document.createElement('div');
    titleWrapper.className = 'wrapper';
    var titleLabel = document.createElement('label');
    titleLabel.innerText = 'Выберите симптом/признак или опишите новый: ';
    titleWrapper.appendChild(titleLabel);
    var titleInput = document.createElement('input');
    titleInput.disabled = false;
    titleInput.setAttribute('type', 'text');
    titleInput.setAttribute('list', 'feature-list');
    var featureList = document.createElement('datalist');
    featureList.setAttribute('id', 'feature-list');
    for (var i = 0; i < this.features.length; i++) {
        var option = document.createElement('option');
        option.setAttribute('selected', false);
        option.innerText = this.features[i].title;
        featureList.appendChild(option);
    }
    titleWrapper.appendChild(titleInput);
    titleWrapper.appendChild(featureList);

    titleInput.onfocus = function () {
        if (document.getElementById('values-list')) {
            document.getElementById('values-list').remove();
        }
    }

    var self = this;

    var valueWrapper = document.createElement('div');
    valueWrapper.className = 'wrapper';
    var valueLabel = document.createElement('label');
    valueLabel.innerText = 'Задайте значение выбранного симптома/признака: ';
    valueWrapper.appendChild(valueLabel);
    var valueInput = document.createElement('input');
    valueInput.setAttribute('list', 'values-list');

    valueInput.onfocus = function () {
        var f = self.getFeatureByTitle(titleInput.value);
        if (f) {
            var valuesList = document.createElement('datalist');
            valuesList.setAttribute('id', 'values-list');
            for (var i = 0; i < f.values.length; i++) {
                var option = document.createElement('option');
                option.setAttribute('selected', false);
                option.innerText = f.values[i];
                valuesList.appendChild(option);
            }
            valueWrapper.appendChild(valuesList);
        }
    }
    valueWrapper.appendChild(valueInput);

    var controlWrapper = document.createElement('div');
    controlWrapper.className = 'wrapper';
    var back = document.createElement('button');
    back.innerText = 'Назад';
    controlWrapper.appendChild(back);
    var params = document.createElement('button');
    params.innerText = 'Параметры';
    controlWrapper.appendChild(params);
    var next = document.createElement('button');
    next.innerText = 'Далее';
    controlWrapper.appendChild(next);
    var history = document.createElement('button');
    history.style = 'float:right;';
    history.innerText = 'История';
    controlWrapper.appendChild(history);

    frame.appendChild(titleWrapper);
    frame.appendChild(valueWrapper);
    frame.appendChild(controlWrapper);

    back.disabled = !(this.root && this.root.getLastStep() >= 1);

    var self = this;

    back.onclick = function () {
        self.stepBack();
    }

    next.onclick = function () {
        self.buildCanConclude(titleInput.value, valueInput.value, settings);
    }

    history.onclick = function () {
        var f = self.root ? AT_Feature.fromJSON(JSON.parse(JSON.stringify(self.root.toJSON()))) : new AT_Feature(titleInput.value);
        var step = self.position ? self.position.step : null;
        self.showHistory(f, step);
    }

    this.mainFrame.appendChild(frame);
    return frame;
}

AT_Interview.prototype.getFeatureByTitle = function (t) {
    for (var i = 0; i < this.features.length; i++) {
        if (this.features[i].title == t) {
            return this.features[i];
        }
    }
}

AT_Interview.prototype.createModal = function () {
    var modalLayer = document.createElement('div');
    modalLayer.className = 'modal-layer';
    var z = this.ZIndexes.length ? this.ZIndexes[this.ZIndexes.length - 1] + 1 : 1;
    modalLayer.style.zIndex = z;
    this.ZIndexes.push(z);
    var message = document.createElement('div');
    message.className = 'modal-message';
    modalLayer.appendChild(message);
    this.mainFrame.insertBefore(modalLayer, this.mainFrame.firstElementChild);
    message.setAttribute('z', z);
    document.getElementById('line').style.zIndex = z + 1;

    var self = this;

    return message;
}

AT_Interview.prototype.addModalFields = function (message) {
    var modalText = document.createElement('div');
    modalText.className = 'modal-text wrapper';
    message.appendChild(modalText);

    var modalControl = document.createElement('div');
    modalControl.className = 'modal-control wrapper';
    message.appendChild(modalControl);

    return [modalText, modalControl];
}

AT_Interview.prototype.removeModalByIndex = function (index) {
    var modals = document.getElementsByClassName('modal-message');
    for (var i = 0; i < modals.length; i++) {
        if (modals[i].getAttribute('z') == index) {
            modals[i].parentNode.remove();
        }
    }
    this.ZIndexes.remove(this.ZIndexes.indexOf(index));
}

AT_Interview.prototype.removeLastModal = function () {
    var z = this.ZIndexes.max();
    this.removeModalByIndex(z);
}

AT_Interview.prototype.buildCanConclude = function (title, name, setts) {
    var message = this.createModal();
    var fields = this.addModalFields(message);
    var modalText = fields[0];
    var modalControl = fields[1];
    var z = parseInt(message.getAttribute('z'));
    var self = this;

    if (title != '' && name != '') {

        var pre = self.position ? self.position.title : title;
        if (self.position) {
            self.position.title = title;
        }
        modalText.innerText = 'Можете ли вы сделать какой-либо вывод?';
        var yes = document.createElement('button');
        yes.innerText = 'Да';
        modalControl.appendChild(yes);
        var no = document.createElement('button');
        no.innerText = 'Нет';
        modalControl.appendChild(no);
        var back = document.createElement('button');
        back.innerText = 'Назад';
        modalControl.appendChild(back);
        var history = document.createElement('button');
        history.style = 'float:right;';
        history.innerText = 'История';
        modalControl.appendChild(history);

        back.onclick = function () {
            if (self.position) {
                self.position.title = pre;
            }
            self.ZIndexes.remove(self.ZIndexes.indexOf(z));
            message.parentNode.remove();
        };

        history.onclick = function () {
            var f = self.root ? AT_Feature.fromJSON(JSON.parse(JSON.stringify(self.root.toJSON()))) : new AT_Feature(title); //.getNodeByStep(self.root.getLastStep())
            var p = self.position ? f.getNodeByStep(self.position.step) : f;
            p.discourse('...', name, null);
            var step = self.position ? self.position.step : null;
            self.showHistory(f, step);
        }

        yes.onclick = function () {
            var f = self.getFeatureByTitle(title);
            if (!f) {
                self.features.push({
                    "title": title,
                    values: [name]
                });
            } else {
                if (f.values.indexOf(name) == -1) {
                    f.values.push(name);
                }
            }
            self.buildConclusion(title, name, setts);
        }

        no.onclick = function () {
            var f = self.getFeatureByTitle(title);
            if (!f) {
                self.features.push({
                    "title": title,
                    values: [name]
                });
            } else {
                if (f.values.indexOf(name) == -1) {
                    f.values.push(name);
                }
            }
            self.ZIndexes.remove(self.ZIndexes.indexOf(z));
            message.parentNode.remove();
            if (!self.root) {
                self.root = new AT_Feature(title);
                self.position = self.root;
            }
            self.position = self.position.discourse('...', name, setts).next;
            self.startFrame = self.buildFeatureInput();
            self.startFrame.getElementsByTagName('input')[0].disabled = false;
            self.startFrame.getElementsByTagName('input')[0].value = '';
            self.startFrame.getElementsByTagName('input')[1].value = '';

        }
    } else {
        modalText.innerText = 'Симптом/признак и его значения не должны быть пустыми';
        var back = document.createElement('button');
        back.innerText = 'Ок';
        modalControl.appendChild(back);

        back.onclick = function () {
            self.ZIndexes.remove(self.ZIndexes.indexOf(z));
            message.parentNode.remove();
        };
    }
}

AT_Interview.prototype.buildConclusion = function (t, n, s, fc, step) {
    var message = this.createModal();
    var z = parseInt(message.getAttribute('z'));

    var self = this;

    var diag = document.createElement('input');
    diag.setAttribute('type', 'radio');
    diag.setAttribute('id', 'diag' + (fc ? '-fc-' + step : ''));
    var diagLabel = document.createElement('label');
    diagLabel.innerText = 'Итоговый диагноз';

    message.appendChild(diag);
    message.appendChild(diagLabel);

    diagLabel.onclick = function () {
        diag.click();
    }

    var diagWrapper = document.createElement('div');
    diagWrapper.className = 'wrapper';
    var lbl = document.createElement('label');
    lbl.innerText = 'Поставьте итоговый диагноз';
    var diagInput = document.createElement('input');
    diagInput.setAttribute('list', 'diag-list' + (fc ? '-fc' : ''));
    var diagList = document.createElement('datalist');
    diagList.setAttribute('id', 'diag-list' + (fc ? '-fc' : ''));
    for (var i = 0; i < this.diagnoses.length; i++) {
        var option = document.createElement('option');
        option.setAttribute('selected', false);
        option.innerText = this.diagnoses[i];
        diagList.appendChild(option);
    }

    diagWrapper.appendChild(lbl);
    diagWrapper.appendChild(diagInput);
    diagWrapper.appendChild(diagList);

    message.appendChild(diagWrapper);

    var transit = document.createElement('input');
    transit.setAttribute('type', 'radio');
    transit.setAttribute('id', 'transit' + (fc ? '-fc-' + step : ''));
    var transLabel = document.createElement('label');
    transLabel.innerText = 'Промежуточный вывод';

    message.appendChild(transit);
    message.appendChild(transLabel);

    transLabel.onclick = function () {
        transit.click();
    }


    var transWrapper = document.createElement('div');
    transWrapper.className = 'wrapper';

    var ttlbl = document.createElement('label');
    ttlbl.innerText = 'Опишите название промежуточного вывода';
    var ttInput = document.createElement('input');
    var tvlbl = document.createElement('label');
    tvlbl.innerText = 'Задайте значение промежуточного вывода';
    var tvInput = document.createElement('input');

    transWrapper.appendChild(ttlbl);
    transWrapper.appendChild(ttInput);

    ttInput.setAttribute('list', 'tt-list' + (fc ? '-fc' : ''));

    var featureList = document.createElement('datalist');
    featureList.setAttribute('id', 'tt-list' + (fc ? '-fc' : ''));
    for (var i = 0; i < this.features.length; i++) {
        var option = document.createElement('option');
        option.setAttribute('selected', false);
        option.innerText = this.features[i].title;
        featureList.appendChild(option);
    }
    transWrapper.appendChild(featureList);

    transWrapper.appendChild(document.createElement('br'));
    transWrapper.appendChild(document.createElement('br'));
    transWrapper.appendChild(tvlbl);
    transWrapper.appendChild(tvInput);

    message.appendChild(transWrapper);

    diag.onclick = function () {
        transit.checked = false;
        ttInput.disabled = true;
        tvInput.disabled = true;
        diagInput.disabled = false;
    }

    transit.onclick = function () {
        diag.checked = false;
        ttInput.disabled = false;
        tvInput.disabled = false;
        diagInput.disabled = true;
    }

    diagInput.disabled = true;
    ttInput.disabled = true;
    tvInput.disabled = true;

    tvInput.setAttribute('list', 'tv-list' + (fc ? '-fc' : ''));

    ttInput.onfocus = function () {
        if (document.getElementById('tv-list' + (fc ? '-fc' : ''))) {
            document.getElementById('tv-list' + (fc ? '-fc' : '')).remove();
        }
    }

    tvInput.onfocus = function () {
        var f = self.getFeatureByTitle(ttInput.value);
        if (f) {
            var valuesList = document.createElement('datalist');
            valuesList.setAttribute('id', 'tv-list' + (fc ? '-fc' : ''));
            for (var i = 0; i < f.values.length; i++) {
                var option = document.createElement('option');
                option.setAttribute('selected', false);
                option.innerText = f.values[i];
                valuesList.appendChild(option);
            }
            transWrapper.appendChild(valuesList);
        }
    }

    var controlWrapper = document.createElement('div');
    controlWrapper.className = 'wrapper';
    var back = document.createElement('button');
    back.innerText = fc ? 'Отмена' : 'Назад';
    controlWrapper.appendChild(back);
    var params = document.createElement('button');
    params.innerText = 'Параметры';
    controlWrapper.appendChild(params);
    var next = document.createElement('button');
    next.innerText = fc ? 'Изменить' : 'Далее';
    controlWrapper.appendChild(next);
    var history = document.createElement('button');
    history.style = 'float:right;';
    history.innerText = 'История';
    controlWrapper.appendChild(history);

    message.appendChild(controlWrapper);

    var self = this;

    var conclSetts = {
        "belief": [50, 100],
        "accuracy": 0
    }

    back.onclick = function () {
        self.ZIndexes.remove(self.ZIndexes.indexOf(z));
        message.parentNode.remove();
    };

    history.onclick = function () {
        var f = self.root ? AT_Feature.fromJSON(JSON.parse(JSON.stringify(self.root.toJSON()))) : new AT_Feature(t); //.getNodeByStep(self.root.getLastStep())
        var p = self.position ? f.getNodeByStep(self.position.step) : f;
        if (p == self.position) {
            throw new Error('');
        }
        p.conclude({
            "value": '...'
        }, null, n);
        var step = self.position ? self.position.step : null;
        self.showHistory(f, step);
    }

    var getPos = true;
    var pos;
    next.onclick = function () {
        if (getPos) {
            if (self.position) {
                pos = self.position;
            } else if (!self.root) {
                pos = new AT_Feature(t);
                self.root = pos;
                self.position = pos;
            } else {
                alert('Ошибка');
                console.log('Ошибка');
            }
        }
        if (pos) {
            var f = self.getFeatureByTitle(t);
            if (!f) {
                self.features.push({
                    "title": t,
                    "values": [n]
                });
            } else {
                if (f.values.indexOf(n) == -1) {
                    f.values.push(n);
                }
            }
            if (diag.checked) {
                pos.conclude({
                    "type": "diagnos",
                    "value": diagInput.value
                }, conclSetts, n, s);
                if (self.diagnoses.indexOf(diagInput.value) == -1) {
                    self.diagnoses.push(diagInput.value);
                }
            }
            if (transit.checked) {
                pos.conclude({
                    "type": "transit",
                    "title": ttInput.value,
                    "value": tvInput.value
                }, conclSetts, n, s);
                var f = self.getFeatureByTitle(ttInput.value);
                if (!f) {
                    self.features.push({
                        "title": ttInput.value,
                        "values": [tvInput.value]
                    });
                } else {
                    if (f.values.indexOf(tvInput.value) == -1) {
                        f.values.push(tvInput.value);
                    }
                }
            }
            console.log("concluded");
            var message = self.createModal();
            var fields = self.addModalFields(message);
            fields[0].innerText = 'Можете ли вы сделать еще одно заключение?'
            var yes = document.createElement('button');
            var no = document.createElement('button');
            var back = document.createElement('button');
            var history = document.createElement('button');
            history.style = 'float:right;';
            history.innerText = 'История';
            fields[1].appendChild(yes);
            fields[1].appendChild(no);
            fields[1].appendChild(back);
            fields[1].appendChild(history);
            yes.innerText = 'Да';
            no.innerText = 'Нет';
            back.innerText = 'Назад';
            yes.onclick = function () {
                getPos = false;
                self.removeLastModal();
                self.removeLastModal();
                var mes = self.buildConclusion(t, n, s)

                var back = mes.getElementsByTagName('button')[0];
                back.innerText = 'Отмена';
                back.onclick = function () {
                    self.removeLastModal();
                    self.removeLastModal();
                    self.removeLastModal();
                    self.buildCanDiscourse(t, n, s);
                }
            }

            back.onclick = function () {
                self.stepBack();
            }

            history.onclick = function () {
                var f = self.root ? AT_Feature.fromJSON(JSON.parse(JSON.stringify(self.root.toJSON()))) : new AT_Feature(t); //.getNodeByStep(self.root.getLastStep())
                var p = self.position ? f.getNodeByStep(self.position.step) : f;
                if (p == self.position) {
                    throw new Error('');
                }
                p.conclude({
                    "value": '...'
                }, null, n);
                var step = self.position ? self.position.step : null;
                self.showHistory(f, step);
            }

            no.onclick = function () {
                self.removeLastModal();
                self.removeLastModal();
                self.removeLastModal();
                self.buildCanDiscourse(t, n, s);
            }

        }
        console.log('concl clicked');
    }
    return message;
}

AT_Interview.prototype.buildCanDiscourse = function (t, n, s) {
    var message = this.createModal();
    var fields = this.addModalFields(message);
    fields[0].innerText = 'Возможно ли какое-то еще значение симптома/признака "' + t + '"?';
    var yes = document.createElement('button');
    var no = document.createElement('button');

    yes.innerText = 'Да';
    no.innerText = 'Нет';

    var history = document.createElement('button');
    history.style = 'float:right;';
    history.innerText = 'История';

    var back = document.createElement('button');
    back.innerText = 'Назад';

    var self = this;

    fields[1].appendChild(yes);
    fields[1].appendChild(no);
    fields[1].appendChild(back);
    fields[1].appendChild(history);

    yes.onclick = function () {
        self.removeLastModal();
        self.startFrame = self.buildFeatureInput();
        var titleInput = self.startFrame.getElementsByTagName('input')[0];
        titleInput.disabled = true;
        titleInput.value = t;
        self.startFrame.getElementsByTagName('input')[0] = '';
    };

    history.onclick = function () {
        var f = self.root ? AT_Feature.fromJSON(JSON.parse(JSON.stringify(self.root.toJSON()))) : new AT_Feature(titleInput.value);
        var step = self.position ? self.position.step : null;
        self.showHistory(f, step);
    }

    no.onclick = function () {
        self.removeLastModal();
        self.startFrame.getElementsByTagName('input')[0].disabled = false;
        if (self.position && self.position.previouce) {
            self.position = self.position.previouce;
            self.buildCanDiscourse(self.position.title);
        }
    }

    back.onclick = function () {
        self.stepBack();
    }
}

AT_Interview.prototype.startFromPoint = function (n) {
    var self = this;
    if (n.branches) {
        self.position = n;
        while (self.ZIndexes.length > 1) {
            self.removeLastModal();
        }
        self.startFrame = self.buildFeatureInput();
        if (n.branches.length != 0) {
            self.buildCanDiscourse(n.title);
        } else {
            self.startFrame.getElementsByTagName('input')[0].value = n.title;
        }
    } else {
        while (self.ZIndexes.length > 1) {
            self.removeLastModal();
        }
        self.position = self.root.getParentNode(n[0]);
        var b = self.position.getBranch(n[0]);
        self.buildCanConclude(self.position.title, b.name, b.settings);
        var m = self.buildConclusion(self.position.title, b.name, b.settings);
        var message = self.createModal();
        var fields = self.addModalFields(message);
        fields[0].innerText = 'Можете ли вы сделать еще одно заключение?'
        var yes = document.createElement('button');
        var no = document.createElement('button');
        var back = document.createElement('button');
        var history = document.createElement('button');
        history.style = 'float:right;';
        history.innerText = 'История';
        fields[1].appendChild(yes);
        fields[1].appendChild(no);
        fields[1].appendChild(back);
        fields[1].appendChild(history);
        yes.innerText = 'Да';
        no.innerText = 'Нет';
        back.innerText = 'Назад';
        yes.onclick = function () {
            self.removeLastModal();
            self.removeLastModal();
            self.buildCanConclude(self.position.title, b.name, b.settings);
            var mes = self.buildConclusion(self.position.title, b.name, b.settings);

            var back = mes.getElementsByTagName('button')[0];
            back.innerText = 'Отмена';
            back.onclick = function () {
                self.removeLastModal();
                self.removeLastModal();
                self.removeLastModal();
                self.buildCanDiscourse(self.position.title);
            }
        }

        back.onclick = function () {
            self.stepBack();
        }

        history.onclick = function () {
            var f = self.root ? AT_Feature.fromJSON(JSON.parse(JSON.stringify(self.root.toJSON()))) : new AT_Feature(t); //.getNodeByStep(self.root.getLastStep())
            var p = self.position ? f.getNodeByStep(self.position.step) : f;
            if (p == self.position) {
                throw new Error('');
            }
            p.conclude({
                "value": '...'
            }, null, self.root.getParentNode(n[0]).getBranch(n[0]).name);
            var step = self.position ? self.position.step : null;
            self.showHistory(f, step);
        }
        no.onclick = function () {
            self.removeLastModal();
            self.removeLastModal();
            self.removeLastModal();
            self.buildCanDiscourse(self.position.title);
        }
    }
}

AT_Interview.prototype.stepBack = function () {

    var stp = this.root.getLastStep();
    var rn = this.root.getLastStepNode();
    this.root.rollback(stp - 1);
    var n = this.root.getLastStepNode();

    this.startFromPoint(n);
}

AT_Interview.prototype.clear = function () {
    while (this.position.step != 0) {
        this.stepBack();
    }
}

AT_Interview.prototype.showHistory = function (f, step) {
    var message = this.createModal();
    var mh = this.mainFrame.getBoundingClientRect().height - 100;
    message.style.maxHeight = mh + 'px';
    var z = parseInt(message.getAttribute('z'));
    var field = document.createElement('div');
    field.className = 'wrapper';
    field.style.overflowY = 'scroll';
    field.style.minWidth = '700px'

    var feature = this.root;
    if (f) {
        feature = f;
    }

    feature.toStructedHTML(field, null, step);
    message.appendChild(field);

    var modalControl = document.createElement('div');
    modalControl.className = 'modal-control wrapper';
    var back = document.createElement('button');
    back.innerText = 'Ок';
    modalControl.appendChild(back);

    message.appendChild(modalControl);

    var self = this;

    back.onclick = function () {
        self.hided = [];
        var brElems = message.getElementsByClassName('branch');
        for (var i = 0; i < brElems.length; i++) {
            if (brElems[i].getElementsByClassName('next')[0].style.display == 'none') {
                self.hided.push({
                    "step": parseInt(brElems[i].getAttribute('step')),
                    "name": brElems[i].getElementsByClassName('name')[0].textContent
                });
            }
        }
        self.historyScroll = field.scrollTop;
        self.removeLastModal()
    };

    var mainBack = back;

    if (message.getBoundingClientRect().y + this.mainFrame.scrollTop < 50) {
        message.style.transform = 'translate(-50%, 0%)'
        message.style.top = "65px";
    }
    for (var i = 0; i < message.getElementsByClassName('feature').length; i++) {
        var e = message.getElementsByClassName('feature')[i];
        if (e.getAttribute('step') && e.getAttribute('step') != 0) {
            e.getElementsByClassName('title')[0].onclick = function () {
                var step = parseInt(this.parentNode.getAttribute('step'));
                if (self.root.getNodeByStep(step)) {
                    self.showStepSettings(this, step, this.innerText, mainBack);
                }
            }
        }
    }

    for (var i = 0; i < message.getElementsByClassName('conclusion').length; i++) {
        var e = message.getElementsByClassName('conclusion')[i];
        if (e.getAttribute('step') && e.getAttribute('step') != 0) {
            e.onclick = function () {
                var step = parseInt(this.getAttribute('step'));
                var c = self.root.getNodeByStep(step);
                if (c && (self.root.getParentNode(c[0]) != self.position || self.position.branches.length > 1 || c[0].conclusion.length > 1)) {
                    self.showConclSettings(this, step, this.innerText, mainBack);
                }
            }
        }
    }

    for (var i = 0; i < message.getElementsByClassName('branch').length; i++) {
        var e = message.getElementsByClassName('branch')[i];
        e.getElementsByClassName('name')[0].onmouseover = function () {
            var stb = this.parentNode.getElementsByClassName('branch-stb')[0] == this.nextElementSibling ? this.parentNode.getElementsByClassName('branch-stb')[0] : this.parentNode.getElementsByClassName('visible-stb')[0];
            if (stb != this.nextElementSibling) {
                stb = document.createElement('label');
                stb.className = 'branch-stb';
                stb.innerHTML = '&#128736;';
                this.parentNode.insertBefore(stb, this.nextElementSibling);
                var step = parseInt(this.parentNode.getAttribute('step'));
                var name = this.innerText;
                stb.onclick = function () {
                    if (this.className == 'branch-stb') {
                        self.showBranchSettings(this, step, name, mainBack);
                    } else if (this.nextElementSibling.className == 'drop') {
                        this.nextElementSibling.remove();
                    }
                    this.className = this.className == 'branch-stb' ? 'visible-stb' : 'branch-stb';
                }
            }
            stb.style.display = 'inline';
        }
        e.getElementsByClassName('name')[0].onmouseout = function () {
            var stb = this.parentNode.getElementsByClassName('branch-stb')[0] == this.nextElementSibling ? this.parentNode.getElementsByClassName('branch-stb')[0] : this.parentNode.getElementsByClassName('visible-stb')[0];
            if (stb) {
                stb.setAttribute('style', 'z-index: 2;');
            }
        }
    }

    function isNone(el) {
        if (el.style.display == 'none') {
            return true;
        }
        var s = el.parentNode;
        while (s.parentNode) {
            if (s.style.display == 'none') {
                return true;
            }
            s = s.parentNode;
        }
        return false;
    }

    field.style.maxHeight = (mh - modalControl.getBoundingClientRect().height - 22) + "px";
    if (this.hided) {
        for (var i = 0; i < this.hided.length; i++) {
            var bs = message.getElementsByClassName('branch');
            for (var j = 0; j < bs.length; j++) {
                if (bs[j].getAttribute('step') == this.hided[i].step && bs[j].getElementsByClassName('name')[0].textContent == this.hided[i].name) {
                    if (!isNone(bs[j])) {
                        bs[j].getElementsByClassName('name')[0].click();
                    }
                }
            }
        }
    }
    if (this.historyScroll) {
        field.scrollTop = this.historyScroll;
    }
    return message;
}

AT_Interview.prototype.showBranchSettings = function (el, step, name, mainBack) {
    var self = this;
    if (self.root.getBranchByStep(step)) {
        if (el.nextElementSibling != el.parentNode.getElementsByClassName('drop')[0]) {
            var drop = document.createElement('div');
            drop.className = 'drop';
            drop.style.display = 'none';
            var change = document.createElement('span');
            change.className = 'drop-btn';
            change.innerText = 'Изменить';
            drop.appendChild(change);
            drop.style.display = 'inline';
            el.parentNode.insertBefore(drop, el.nextElementSibling);
            drop.style.paddingLeft = "40px";
            drop.style.zIndex = 1;
            drop.previousElementSibling.style.zIndex = 2;
            change.onclick = function () {
                self.changeBranch(step, name, mainBack);
            }
        }
    }

}

AT_Interview.prototype.changeBranch = function (step, name, mainBack) {
    var self = this;
    var message = self.createModal();
    var fields = self.addModalFields(message);
    var o = self.root.getBranchByStep(step, true);
    var n = o[1];
    var b = o[0];
    fields[0].innerText = 'Задайте новое значение симптома/признака "' + n.title + '" ';
    fields[0].appendChild(document.createElement('br'));
    var valueInput = document.createElement('input');
    valueInput.setAttribute('list', 'values-list-c-' + step);

    var f = this.getFeatureByTitle(n.title);
    var valuesList = document.createElement('datalist');
    valuesList.setAttribute('id', 'values-list-c-' + step);
    if (f) {
        for (var i = 0; i < f.values.length; i++) {
            var option = document.createElement('option');
            option.setAttribute('selected', false);
            option.innerText = f.values[i];
            valuesList.appendChild(option);
        }
    }
    fields[0].appendChild(valueInput);
    fields[0].appendChild(valuesList);

    var change = document.createElement('button');
    change.innerText = 'Изменить';
    var setts = document.createElement('button');
    setts.innerText = 'Параметры';
    var back = document.createElement('button');
    back.innerText = 'Отмена';
    back.onclick = function () {
        self.removeLastModal();
    }
    fields[1].appendChild(change);
    fields[1].appendChild(setts);
    fields[1].appendChild(back);

    change.onclick = function () {
        var message = self.createModal();
        var fields = self.addModalFields(message);
        if (valueInput.value == '') {
            fields[0].innerText = 'Значение симптома/признака не должно быть пустым';
            var back = document.createElement('button');
            back.innerText = 'Ок';
            back.onclick = function () {
                self.removeLastModal();
            }
            fields[1].appendChild(back);
        } else {
            b.name = valueInput.value;
            self.completeFD();
            self.removeLastModal();
            self.removeLastModal();
            mainBack.click();
            var tmp = AT_Feature.fromJSON(JSON.parse(JSON.stringify(self.root.toJSON())));
            self.showHistory(tmp, self.position.step);
        }
    }
}

AT_Interview.prototype.showConclSettings = function (el, step, text, mainBack) {
    var self = this;
    if (!el.nextElementSibling || el.nextElementSibling.className != 'drop') {
        var drop = document.createElement('div');
        drop.className = 'drop';
        drop.style.display = 'none';
        var change = document.createElement('span');
        change.className = 'drop-btn';
        change.innerText = 'Изменить';
        var deln = document.createElement('span');
        deln.className = 'drop-btn';
        deln.innerText = 'Удалить';
        drop.appendChild(change);
        drop.appendChild(deln);
        el.parentNode.insertBefore(drop, el.nextElementSibling);

        change.onclick = function () {
            self.changeConcl(step, text, mainBack);
        }

        deln.onclick = function () {
            self.deleteConcl(step, text, mainBack)
        }
    }
    var drop = el.nextElementSibling;
    drop.style.display = drop.style.display == 'none' ? 'inline-block' : 'none';
}

AT_Interview.prototype.changeConcl = function (step, text, mainBack) {
    var self = this;
    var message = this.buildConclusion(null, null, null, true, step);
    var c = this.root.getNodeByStep(step);
    if (c[2].value.title) {
        document.getElementById('transit-fc-' + step).click();
        message.getElementsByTagName('input')[3].value = c[2].value.title;
        message.getElementsByTagName('input')[4].value = c[2].value.value;
    } else {
        document.getElementById('diag-fc-' + step).click();
        message.getElementsByTagName('input')[1].value = c[2].value.value;
    }
    var setts = JSON.parse(JSON.stringify(c[2].settings));
    message.getElementsByTagName('button')[3].remove();
    var next = message.getElementsByTagName('button')[2];
    next.onclick = function () {
        var concl = {
            settings: setts
        };
        if (document.getElementById('transit-fc-' + step).checked) {
            concl.title = message.getElementsByTagName('input')[3].value;
            concl.value = message.getElementsByTagName('input')[4].value;
        } else {
            concl.value = message.getElementsByTagName('input')[1].value;
        }
        c[2].value = concl;
        self.completeFD();
        self.removeLastModal();
        mainBack.click();
        var tmp = AT_Feature.fromJSON(JSON.parse(JSON.stringify(self.root.toJSON())));
        self.showHistory(tmp, self.position.step);
    }
}

AT_Interview.prototype.deleteConcl = function (step, text, mainBack) {
    var self = this;
    var message = self.createModal();
    var fields = self.addModalFields(message);
    fields[0].innerText = 'Подтвердите удаление заключения "' + text + '"';
    var del = document.createElement('button');
    del.innerText = 'Удалить';
    var back = document.createElement('button');
    back.innerText = 'Отмена';
    back.onclick = function () {
        self.removeLastModal();
    }
    fields[1].appendChild(del);
    fields[1].appendChild(back);
    del.onclick = function () {
        var concl = self.root.getNodeByStep(step);
        var parent = self.root.getParentNode(concl[0]);
        concl[0].conclusion.remove(concl[1]);
        var name = parent.getBranch(concl[0]).name;
        if (concl[0].conclusion.length == 0) {
            parent.removeBranch(parent.getBranchIndex(concl[0]));
        }

        self.root.repairSteps();

        self.removeLastModal();
        mainBack.click();
        var tmp = AT_Feature.fromJSON(JSON.parse(JSON.stringify(self.root.toJSON())));
        self.showHistory(tmp, self.position.step);
    }
}

AT_Interview.prototype.showStepSettings = function (el, step, text, mainBack) {
    var self = this;
    if (!el.nextElementSibling || el.nextElementSibling.className != 'drop') {
        var drop = document.createElement('div');
        drop.className = 'drop';
        drop.style.display = 'none';
        var change = document.createElement('span');
        change.className = 'drop-btn';
        change.innerText = 'Изменить';
        var deln = document.createElement('span');
        deln.className = 'drop-btn';
        deln.innerText = 'Удалить';
        drop.appendChild(change);
        drop.appendChild(deln);
        el.parentNode.insertBefore(drop, el.nextElementSibling);

        change.onclick = function () {
            self.changeNode(step, text, mainBack);
        }

        deln.onclick = function () {
            self.deleteNode(step, text, mainBack)
        }
    }
    var drop = el.parentNode.getElementsByClassName('drop')[0];
    drop.style.display = drop.style.display == 'none' ? 'inline-block' : 'none';
}

AT_Interview.prototype.changeNode = function (step, text, mainBack) {
    var self = this;
    var message = self.createModal();
    var fields = self.addModalFields(message);
    fields[0].innerText = 'Задайте новое наименование симптома/признака "' + text + '" ';
    fields[0].appendChild(document.createElement('br'));
    var titleInput = document.createElement('input');
    titleInput.setAttribute('list', 'feature-list-c-' + step);
    var featureList = document.createElement('datalist');
    featureList.setAttribute('id', 'feature-list-c-' + step);
    for (var i = 0; i < this.features.length; i++) {
        var option = document.createElement('option');
        option.setAttribute('selected', false);
        option.innerText = this.features[i].title;
        featureList.appendChild(option);
    }

    fields[0].appendChild(titleInput);
    fields[0].appendChild(featureList);
    var change = document.createElement('button');
    change.innerText = 'Изменить';
    var back = document.createElement('button');
    back.innerText = 'Отмена';
    back.onclick = function () {
        self.removeLastModal();
    }
    fields[1].appendChild(change);
    fields[1].appendChild(back);

    change.onclick = function () {
        var message = self.createModal();
        var fields = self.addModalFields(message);
        if (titleInput.value == '') {
            fields[0].innerText = 'Имя симптома/признака не должно быть пустым';
            var back = document.createElement('button');
            back.innerText = 'Ок';
            back.onclick = function () {
                self.removeLastModal();
            }
            fields[1].appendChild(back);
        } else {
            var n = self.root.getNodeByStep(step);
            n.title = titleInput.value;
            self.removeLastModal();
            self.removeLastModal();
            self.completeFD();

            mainBack.click();
            var tmp = AT_Feature.fromJSON(JSON.parse(JSON.stringify(self.root.toJSON())));
            self.showHistory(tmp, self.position.step);

        }
    }
}

AT_Interview.prototype.deleteNode = function (step, text, mainBack) {
    var self = this;
    var message = self.createModal();
    var fields = self.addModalFields(message);
    fields[0].innerText = 'Подтвердите удаление шага "' + text + '"';
    var del = document.createElement('button');
    del.innerText = 'Удалить';
    var back = document.createElement('button');
    back.innerText = 'Отмена';
    back.onclick = function () {
        self.removeLastModal();
    }
    fields[1].appendChild(del);
    fields[1].appendChild(back);
    del.onclick = function () {
        if (self.root.getNodeByStep(step)) {
            if (self.position == self.root.getNodeByStep(step)) {
                var stp = self.position.step - 1;
                while (self.root.getNodeByStep(stp).length) {
                    stp--;
                }
                self.position = self.root.getNodeByStep(stp);
            }
            self.root.removeNode(step);
            mainBack.click();
            var tmp = AT_Feature.fromJSON(JSON.parse(JSON.stringify(self.root.toJSON())));
            var point = self.position.step;
            if (self.root.getNodeByStep(self.position.step + 1) && self.root.getNodeByStep(self.position.step + 1).length) {
                point = self.position.step + 1;
            }
            self.startFromPoint(self.root.getNodeByStep(point));
            self.showHistory(tmp, self.position.step);
        }
    }
}

AT_Interview.prototype.addFeature = function (title, value) {
    var f = this.getFeatureByTitle(title);
    if (f) {
        if (f.values.indexOf(value) == -1) {
            f.values.push(value);
        }
    } else {
        this.features.push({
            "title": title,
            "values": [value]
        });
    }
}

AT_Interview.prototype.completeFD = function () {
    var leafs = this.root.getLeafFeatures();
    for (var i = 0; i < leafs.length; i++) {
        var searcher = leafs[i];
        while (searcher) {
            for (var j = 0; j < searcher.branches.length; j++) {
                if (searcher.branches[j].next.conclusion) {
                    var c = searcher.branches[j].next.conclusion;
                    for (var k = 0; k < c.length; k++) {
                        if (c[k].value.title) {
                            this.addFeature(c[k].value.title, c[k].value.value);
                        } else if (this.diagnoses.indexOf(c[k].value.value) == -1) {
                            this.diagnoses.push(c[k].value.value);
                        }
                    }
                }
                this.addFeature(searcher.title, searcher.branches[j].name);
            }
            searcher = searcher.previouce;
        }
    }
}

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


var AT_Feature = function (title, previouce, step) {
    this.title = title || 'Признак';
    this.branches = [];
    this.previouce = previouce;
    this.step = step + 1 ? step : this.getThisBranch() ? this.getThisBranch().step : 0;
}

AT_Feature.prototype.getLastStep = function () {
    var searcher = this;
    while (searcher.previouce) {
        searcher = searcher.previouce;
    }
    return this._getLastStep(searcher);
}

AT_Feature.prototype._getLastStep = function (n) {
    var node = n || this;
    var steps = [];
    if (node.hasOwnProperty('step')) {
        steps = [node.step];
    }
    if (node.conclusion) {
        for (var i = 0; i < node.conclusion.length; i++) {
            steps.push(node.conclusion[i].step);
        }
    }
    if (node.branches) {
        for (var i = 0; i < node.branches.length; i++) {
            steps.push(node.branches[i].step);
            if (node.branches[i].next) {
                steps.push(node._getLastStep(node.branches[i].next))
            }
        }
    }
    return steps.max();
}

AT_Feature.prototype.getLastStepNode = function () {
    return this.getNodeByStep(this.getLastStep());
}

AT_Feature.prototype.getNodeByStep = function (step) {
    return this._getNodeByStep(step);
}

AT_Feature.prototype._getNodeByStep = function (step, n) {
    var node = n || this;
    if (node.step == step) {
        return node;
    }
    if (node.conclusion) {
        for (var i = 0; i < node.conclusion.length; i++) {
            if (node.conclusion[i].step == step) {
                return [node, i, node.conclusion[i]];
            }
        }
    }
    if (node.branches) {
        for (var i = 0; i < node.branches.length; i++) {
            var res = this._getNodeByStep(step, node.branches[i].next);
            if (res) {
                return res;
            }
        }
    }
    return null;
}

AT_Feature.prototype.startNewBranch = function (name, settings, next) {
    var branch = {
        "name": name,
        "settings": settings,
        "next": next,
        "step": this.getLastStep() + 1
    };
    this.branches.push(branch);
    return branch;
}

AT_Feature.prototype.conclude = function (conclEnt, conclSetts, name, settings) {
    var self = this;
    if (!this.getFirstConcludedBranchByName(name)) {
        return this.startNewBranch(name, settings, {
            "conclusion": [{
                "value": conclEnt,
                "settings": conclSetts,
                "step": self.getLastStep() + 1
            }]
        });
    } else {
        var b = this.getFirstConcludedBranchByName(name);
        b.next.conclusion.push({
            "value": conclEnt,
            "settings": conclSetts,
            "step": self.getLastStep() + 1
        });
    }
}

AT_Feature.prototype.discourse = function (title, name, settings) {
    var f = new AT_Feature(title, this, this.getLastStep() + 1);
    return this.startNewBranch(name, settings, f);
}

AT_Feature.prototype.concludedBranchesIS = function () {
    var bs = [];
    for (var i = 0; i < this.branches.length; i++) {
        if (this.branches[i].next.conclusion) {
            bs.push(i);
        }
    }
    return bs.length ? bs : null;

}

AT_Feature.prototype.conclusionNodesCount = function () {
    var searcher = this;
    while (searcher.previouce) {
        searcher = searcher.previouce;
    }
    return searcher._conclusionNodesCount();
}

AT_Feature.prototype._conclusionNodesCount = function (n) {
    var node = n || this;
    var res = 0;
    for (var i = 0; i < node.branches.length; i++) {
        if (node.branches[i].next.conclusion) {
            res++;
        } else {
            res += node.branches[i].next._conclusionNodesCount();
        }
    }
    return res;
}

AT_Feature.prototype.getConclusionNodes = function () {
    var searcher = this;
    while (searcher.previouce) {
        searcher = searcher.previouce;
    }
    return searcher._getConclusionNodes();
}

AT_Feature.prototype._getConclusionNodes = function (n) {
    var node = n || this;
    var res = [];
    for (var i = 0; i < node.branches.length; i++) {
        if (node.branches[i].next.conclusion) {
            res.push(node.branches[i].next);
        } else {
            res = res.concat(node.branches[i].next._getConclusionNodes());
        }
    }
    return res;
}

AT_Feature.prototype.toJSON = function () {
    var res = {
        "title": this.title,
        "step": this.step
    };
    var branches = [];
    for (var i = 0; i < this.branches.length; i++) {
        var b = {
            "name": this.branches[i].name,
            "settings": this.branches[i].settings,
            "step": this.branches[i].step
        };
        if (this.branches[i].next.toJSON) {
            b.next = this.branches[i].next.toJSON();
        } else {
            b.next = this.branches[i].next;
        }
        branches.push(b);
    }
    res.branches = branches;
    return res;
}

AT_Feature.prototype.getBranchIndexByName = function (name) {
    for (var i = 0; i < this.branches.length; i++) {
        if (this.branches[i].name == name) {
            return i;
        }
    }
    return -1;
}

AT_Feature.prototype.getBranchIndexByFeatureTitle = function (t) {
    for (var i = 0; i < this.branches.length; i++) {
        if (this.branches[i].next.title && this.branches[i].next.title == t) {
            return i;
        }
    }
    return -1;
}

AT_Feature.prototype.getLastBranchIndexByFeatureTitle = function (t) {
    for (var i = this.branches.length - 1; i >= 0; i--) {
        if (this.branches[i].next.title && this.branches[i].next.title == t) {
            return i;
        }
    }
    return -1;
}

AT_Feature.fromJSON = function (obj, prev) {
    var res = new AT_Feature(obj.title, prev);
    res.step = obj.step;
    var branches = [];
    for (var i = 0; i < obj.branches.length; i++) {
        var b = {
            "name": obj.branches[i].name,
            "settings": obj.branches[i].settings,
            "step": obj.branches[i].step
        }
        if (!obj.branches[i].next.conclusion) {
            b.next = AT_Feature.fromJSON(obj.branches[i].next, res);
        } else {
            b.next = obj.branches[i].next;
        }
        branches.push(b);
    }
    res.branches = branches;
    return res;
}

AT_Feature.prototype.getRoot = function () {
    var searcher = this;
    while (searcher.previouce) {
        searcher = searcher.previouce;
    }
    return searcher;
}

AT_Feature.prototype.getStep = function (index) {
    var root = this.getRoot();
    return this._getStep(index, root);
}

AT_Feature.prototype._getStep = function (index, node) {
    if (node.step == index) {
        return node;
    }
    var res = NaN;
    for (var i = 0; i < node.branches.length; i++) {
        if (node.branches[i].next._getStep) {
            res = this._getStep(index, node.branches[i].next);
            if (res.toString() != 'NaN') {
                return res;
            }
        }
    }
    return res;
}

AT_Feature.prototype.removeBranch = function (index) {
    this.branches.remove(index);
}

AT_Feature.prototype.getBranchIndex = function (f) {
    for (var i = 0; i < this.branches.length; i++) {
        if (!f.next && f == this.branches[i].next || f.next && f == this.branches[i]) {
            return i;
        }
    }
    return -1;
}

AT_Feature.prototype.getBranch = function (f) {
    if (this.getBranchIndex(f) != -1) {
        return this.branches[this.getBranchIndex(f)];
    }
}

AT_Feature.prototype.getThisBranch = function () {
    if (this.previouce) {
        return this.previouce.getBranch(this);
    }
}

AT_Feature.prototype.getLevel = function (n) {
    var node = n || this;
    var i = 0;
    while (node.previouce) {
        i++;
        node = node.previouce;
    }
    return i;
}

AT_Feature.prototype.getParentNode = function (n, f, s) {
    var node = n || this;
    if (node.hasOwnProperty('previouce')) {
        return node.previouce;
    }
    var searcher = f || this;
    while (s && searcher.previouce) {
        searcher = searcher.previouce;
    }
    var res = searcher.getBranch(node);
    if (res) {
        return searcher;
    }

    for (var i = 0; i < searcher.branches.length; i++) {
        if (searcher.branches[i].next.getParentNode) {
            var res = searcher.branches[i].next.getParentNode(node);
            if (res) {
                return res;
            }
        }
    }

}

AT_Feature.prototype.rollback = function (index, n) {
    var node = n || this;
    while (node.getLastStep() > index) {
        var f = node.getLastStepNode();
        if (f.branches) {
            if (f.previouce) {
                f.previouce.removeBranch(f.previouce.getBranchIndex(f))
            }
        } else {
            if (f[0].conclusion.length == 1) {
                var p = node.getParentNode(f[0]);
                p.removeBranch(p.getBranchIndex(f[0]))
            } else {
                f[0].conclusion.remove(f[1]);
            }
        }
    }
}

AT_Feature.prototype.toStructedHTML = function (e, n, step) {
    var node = n || this;
    var feature = document.createElement('div');
    feature.className = 'feature';
    feature.setAttribute('step', node.step);
    var title = document.createElement('label');
    title.className = 'title';
    title.innerHTML = node.title;
    if (node.step == step) {
        title.style.border = '2px solid orange';
        title.style.width = 'min-content';
    }
    feature.appendChild(title);
    for (var i = 0; i < node.branches.length; i++) {
        var branch = document.createElement('div');
        branch.className = 'branch';
        var name = document.createElement('label');
        name.className = 'name';
        name.innerText = node.branches[i].name;
        branch.setAttribute('step', node.branches[i].step);
        branch.appendChild(name);
        var next = document.createElement('div');
        next.className = 'next';
        name.onclick = function () {
            var next = this.parentNode.getElementsByClassName('next')[0];
            next.style.display = next.style.display != "none" ? "none" : "block";
            this.style = next.style.display != "none" ? "background:transparent;" : "background:#ffe48a;";
        }
        if (node.branches[i].next.toStructedHTML) {
            next.appendChild(node.branches[i].next.toStructedHTML(null, null, step));
        } else {
            var c = node.branches[i].next.conclusion;
            for (var s = 0; s < c.length; s++) {
                if (!c[s]) {
                    c.remove(s);
                }
            }
            for (var j = 0; j < c.length; j++) {
                var conclusion = document.createElement('div');
                conclusion.className = 'conclusion';
                conclusion.setAttribute('step', c[j].step);
                conclusion.innerText = c[j].value.title ? c[j].value.title + ' : ' + c[j].value.value : c[j].value.value;
                next.appendChild(conclusion);
            }
        }
        branch.appendChild(next);
        feature.appendChild(branch);
    }
    if (e) {
        e.appendChild(feature);
    }
    return feature;
}

AT_Feature.prototype.addStyle = function () {
    if (document.getElementById('feature-style')) {
        document.getElementById('feature-style').remove();
    }
    var style = document.createElement('style');
    style.setAttribute('id', 'feature-style');
    style.setAttribute('type', 'text/css');
    style.innerText = '.feature{position:relative} .name {cursor:pointer; text-decoration:none} .name:before{content: " "; display:block; position: relative; width: 17px; left: -20px; top: 10px; border: 1px dotted black} .name:hover {text-decoration: underline} .branch {position:relative; border-left: dotted black 1px; padding-left: 20px; display:block} .conclusion {background: #8fffb2; display:inline-block; position:relative; width:fit-content; margin-bottom:5px; cursor:pointer} .conclusion:hover {background: #cfffdd} .next{padding-left:20px; width:min-content;} .title {display:inline-block; position:relative; width:fit-content; cursor:pointer; background:transparent;} .title:hover{background:#f0feff}';
    document.head.appendChild(style);
}

AT_Feature.prototype.getBranchByStep = function (step, rn) {
    var searcher = this;
    if (searcher.previouce) {
        searcher = searcher.previouce;
    }
    return searcher._getBranchByStep(step, rn);
}

AT_Feature.prototype._getBranchByStep = function (step, rn) {
    for (var i = 0; i < this.branches.length; i++) {
        if (this.branches[i].step == step) {
            if (rn) {
                return [this.branches[i], this]
            }
            return this.branches[i];
        }
    }
    for (var i = 0; i < this.branches.length; i++) {
        if (this.branches[i].next._getBranchByStep) {
            var res = this.branches[i].next._getBranchByStep(step, rn);
            if (res) {
                return res;
            }
        }
    }
}

AT_Feature.prototype.removeNode = function (step) {
    var stp = step || this.step;
    var n = this.getNodeByStep(stp);

    for (var i = 0; i < n.branches.length; i++) {
        if (n.branches[i] && n.branches[i].next.title) {
            while (i != n.getLastBranchIndexByFeatureTitle(n.branches[i].next.title)) {
                var index = n.getLastBranchIndexByFeatureTitle(n.branches[i].next.title);
                var bs = n.branches[index].next.branches;
                n.branches[i].next.branches = n.branches[i].next.branches.concat(bs);
                n.removeBranch(index);
            }
        }
        if (!n.previouce) {
            n.branches[i].next.previouce = null;
        }
    }

    var res = [];
    for (var i = 0; i < n.branches.length; i++) {
        res.push(n.branches[i].next);
    }

    if (n.previouce) {
        var b = n.getThisBranch();
        var bs = b.step;
        for (var i = 0; i < n.branches.length; i++) {
            if (n.branches[i].next.conclusion) {
                var c = n.branches[i].next.conclusion;
                for (var j = 0; j < c.length; j++) {
                    n.previouce.conclude(c[j].value, c[j].settings, b.name, b.settings);
                }
            } else {
                n.previouce.startNewBranch(b.name, b.settings, n.branches[i].next);
                n.branches[i].next.previouce = n.previouce;
            }
        }
        var p = n.previouce;
        n.previouce.removeBranch(n.previouce.getBranchIndex(b));
        p.repairSteps();
        n.previouce = undefined;
        return p;
    }

    return res;
}

AT_Feature.prototype.repairSteps = function () {
    var searcher = this;
    while (searcher.previouce) {
        searcher = searcher.previouce;
    }
    searcher._repairSteps();
}

AT_Feature.prototype._repairSteps = function (start) {
    var step = start + 1 || 1;
    this.step = start || 0;
    for (var i = 0; i < this.branches.length; i++) {
        this.branches[i].step = step;
        if (this.branches[i].next._repairSteps) {
            step = this.branches[i].next._repairSteps(step);
        } else {
            var c = this.branches[i].next.conclusion;
            for (var s = 0; s < c.length; s++) {
                if (!c[s]) {
                    c.remove(s);
                }
            }
            for (var j = 0; j < c.length; j++) {
                c[j].step = step;
                step++;
            }
        }
    }
    return step;

}

AT_Feature.prototype.repairStepsForce = function () {
    for (var i = 0; i <= this.getLastStep(); i++) {
        if (!this.getNodeByStep(i)) {
            var j = i + 1;
            while (!this.getNodeByStep(j) && j <= this.getLastStep()) {
                j++;
            }
            if (this.getNodeByStep(j)) {
                var n = this.getNodeByStep(j);
                if (n.length) {
                    n[2].step = i;
                } else {
                    n.step = i;
                }
            }
        }
    }
    for (var i = 0; i <= this.getLastStep(); i++) {
        if (!this.getBranchByStep(i)) {
            var j = i + 1;
            while (!this.getBranchByStep(j) && j <= this.getLastStep()) {
                j++;
            }
            if (this.getBranchByStep(j)) {
                var b = this.getBranchByStep(j);
                if (i > 0) {
                    var pb = this.getBranchByStep(i - 1);
                    if (pb && pb.conclusion) {
                        b.step = pb.conclusion[pb.conclusion.length - 1].step;
                        i = pb.conclusion[pb.conclusion.length - 1].step - 1;
                    } else {
                        b.step = i;
                    }
                }
            }
        }
    }
}

AT_Feature.prototype.getLeafFeatures = function () {
    var searcher = this;
    while (searcher.previouce) {
        searcher = searcher.previouce;
    }
    return searcher._getLeafFeatures();
}

AT_Feature.prototype._getLeafFeatures = function (n) {
    var node = n || this;
    var res = [];
    var isLeaf = true;
    for (var i = 0; i < node.branches.length; i++) {
        isLeaf = isLeaf && node.branches[i].next.conclusion;
        if (!node.branches[i].next.conclusion) {
            res = res.concat(node.branches[i].next._getLeafFeatures());
        }
    }
    if (isLeaf) {
        res.push(node)
    }
    return res;
}

AT_Feature.prototype.mergeSameNamedBranchesC = function () {
    var searcher = this;
    while (searcher.previouce) {
        searcher = searcher.previouce;
    }
    searcher._mergeSameNamedBranchesC();
    searcher.repairSteps();
}

AT_Feature.prototype._mergeSameNamedBranchesC = function (n) {
    var node = this || n;
    for (var i = 0; i < node.branches.length; i++) {
        if (node.branches[i] && node.branches[i].next.conclusion) {
            for (var j = node.branches.length - 1; j > i; j--) {
                if (node.branches[j]) {
                    if (i != j && node.branches[i] && node.branches[j].name == node.branches[i].name && node.branches[j].next.conclusion) {
                        node.branches[i].next.conclusion = node.branches[i].next.conclusion.concat(node.branches[j].next.conclusion);
                        node.removeBranch(j);
                    }
                }
            }
        } else if (!node.branches[i].next.conclusion) {
            node.branches[i].next._mergeSameNamedBranchesC();
        }
    }
}

AT_Feature.prototype.getFirstConcludedBranchIndexByName = function (name) {
    for (var i = 0; i < this.branches.length; i++) {
        if (this.branches[i].name == name && this.branches[i].next.conclusion) {
            return i;
        }
    }
    return -1;
}

AT_Feature.prototype.getFirstConcludedBranchByName = function (name) {
    return this.branches[this.getFirstConcludedBranchIndexByName(name)];
}

AT_Feature.prototype.isDeeper = function (n) {
    var searcher = this;
    if (searcher == n) {
        return true;
    }
    while (searcher.previouce) {
        searcher = searcher.previouce;
        if (searcher == n) {
            return true;
        }
    }
    return false;
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