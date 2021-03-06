Array.range = function (start, count) {
    if (arguments.length == 1) {
        count = start;
        start = 0;
    }

    var a = new Array();

    for ( var i = start; i < start + count; i++) {
        a.push(i);
    }

    return a;
}

var Cell = {
    width : 140,
    height : 140,
    side : 70,
    // высота от верхнего края до центральной горизонтальной оси
    h : Math.sqrt(Math.pow(70, 2) - Math.pow(70/2,2)),
    // угловой коэффициент
    k : Math.tan(120 * (Math.PI / 180)),
    xOffset : 35
}

function Game () {
    this.matrix = {};
    this.empty_cell = {};
    this.moving = false;
    this.counter;
}

Game.prototype.start = function () {
    console.log(this)
    var game = this;
    this.matrix = this.generateGameMatrix();
    this.drawCells();
    this.secs = 0;
    document.getElementById('timer').innerHTML = '00 : 00';
    this.counter = setInterval(function() {
        game.countTime();
    }, 1000); 
}

Game.prototype.generateGameMatrix = function () {
    var matrix = new Array();
    var values = Array.range(0, 16);

    for ( var i = 0; i < 4; i++) {
        var vect = new Array();
        for ( var j = 0; j < 4; j++) {
            var val = values.splice(Math.floor(Math.random() * values.length), 1);
            vect.push(val);
        }
        matrix.push(vect);
    }

    return matrix;
}

Game.prototype.drawCells = function () {
    var g, 
        val,
        arr = [], 
        field = document.getElementById("field"), 
        xoffset = (Cell.width - Cell.side) / 2,
        svgelb = new SVGElementBuilder();

    this.clearField();

    for(var i = 0; i<4; i++) {
        for(var j=0; j<4; j++) {
            val = this.matrix[i][j] == 0 ? "" : this.matrix[i][j];
            x = j*(Cell.width-xoffset) + (Cell.width-xoffset)*i;
            y = field.clientHeight / 2 - j * Cell.h + i * Cell.h;

            g = svgelb.buildCell(i, j, x, y, val);

            this.setEventListeners(g);

            if(val == "") {
                this.empty_cell = g;
                arr.unshift(g);
            }
            else
                arr.push(g);
        }
    }

    for(var i in arr) {
        field.appendChild(arr[i]);
    }
}

Game.prototype.clearField = function () {
    var field = document.getElementById('field');
    var l = field.childNodes.length;
    while(l - 3) {
        l -= 1;
        field.removeChild(field.childNodes[l-1]);
    }
}

Game.prototype.getNearbyIndexes = function(cell_i, cell_j) {
    var nearby_indexes =
        [{
            i: cell_i - 1, //ячейка слева
            j: cell_j
        }, {
            i: cell_i - 1, //ячейка слева и снизу
            j: cell_j + 1
        }, {
            i: cell_i,     //ячейка снизу
            j: cell_j + 1
        }, {
            i: cell_i + 1, //ячейка справа
            j: cell_j
        }, {
            i: cell_i + 1, //ячейка слева и сверху
            j: cell_j - 1
        }, {
            i: cell_i,     //ячейка сверху
            j: cell_j - 1
        }];

    return nearby_indexes;
}

Game.prototype.setEventListeners = function(g) {
    (function(element, game){
        element.addEventListener('click', function(evt) {
            game.move(element);
        });
    })(g, this);
}

Game.prototype.move = function (cell) {
    //индексы выбранной ячейки
    var cell_i = parseInt(cell.getAttribute("i")),
        cell_j = parseInt(cell.getAttribute("j")),
        empty_cell_i = parseInt(this.empty_cell.getAttribute("i")),
        empty_cell_j = parseInt(this.empty_cell.getAttribute("j"));

    var number = this.matrix[cell_i][cell_j];
    
    //индексы соседних ячеек
    var nearby_indexes = this.getNearbyIndexes(cell_i, cell_j);

  //среди соседних ячеек ищем пустую
    for (var k in nearby_indexes) {
        if((nearby_indexes[k].i == empty_cell_i) &&
            (nearby_indexes[k].j == empty_cell_j)) {
                this.matrix[cell_i][cell_j] = [0];
                this.matrix[empty_cell_i][empty_cell_j] = number;
                this.animate(cell);
                setInterval(function(game) {
                    if(game.isWin())
                        showModal(game.counter);
                }(this), 8000);
                break;
        }
    }
}

Game.prototype.animate = function (cell) {
    var temp = new SVGElementBuilder().buildGroup(0, 0, 0, 0);

    this.copyElementAttributes(cell, temp);

    cell.setAttribute("style", "transform: translate(" + 
        this.empty_cell.getAttribute("x") + "px," + 
            this.empty_cell.getAttribute("y") + "px)");

    this.empty_cell.setAttribute("style", "transform: translate(" + 
        temp.getAttribute("x") + "px," + temp.getAttribute("y") + "px)");

    this.copyElementAttributes(this.empty_cell, cell);
    this.copyElementAttributes(temp, this.empty_cell);
}

Game.prototype.copyElementAttributes = function (src, dst) {
    for(var i in src.attributes) {
        if((src.attributes[i].name == "x") || (src.attributes[i].name == "y") || 
            (src.attributes[i].name == "i") || (src.attributes[i].name == "j")) {
                dst.setAttribute(src.attributes[i].name, 
                    src.getAttribute(src.attributes[i].name));
        }
    }
}

Game.prototype.isWin = function () {
    var win = true;
    
    for ( var i = 0, true_value = 1; i < 4; i++) {
        for (j = 0; j < 4; j++, true_value++) {
            if(i == 3 && j == 3)
                true_value = 0;
            if (this.matrix[i][j] != true_value) {
                win = false;
                break;
            }
        }
    }
    return win;
}

Game.prototype.countTime = function () {
    this.secs += 1;
    document.getElementById('timer').innerHTML = this.formatTime(this.secs);
}

Game.prototype.formatTime = function (secs) {
    var h, min, sec, temp, str, s_min, s_sec;
    h = Math.floor(secs / 3600);
    temp = secs - 3600 * h;
    min = Math.floor(temp / 60);
    s_min = min < 10 ? '0' + min : min;
    sec = temp % 60;
    s_sec = sec < 10 ? '0' + sec : sec;
    str = h ? h + " : " + s_min + " : " + s_sec : s_min + " : " + s_sec;
    return str;
}

showModal = function (counter) {
    var overlay = document.getElementById("overlay"),
        button_ok = document.getElementById("button-ok");
    overlay.className += " active"; 
    button_ok.removeAttribute("filter");  
    clearInterval(counter);
}

closeModal = function () {
    var overlay = document.getElementById("overlay");
    overlay.className = "overlay";
    document.removeEventListener('keydown');
    newGame();
}

setOkButton = function (id) {
    var button_ok = document.getElementById(id);
    var svgelb = new SVGElementBuilder();
    var cell = svgelb.buildCell(0, 0, 0, 70, "ок");
    cell.setAttribute("class", "");
    button_ok.appendChild(cell);

    document.addEventListener('keydown', function(evt) {
        if(evt.keyIdentifier == "Enter") {
            button_ok.setAttribute("filter", "url(#hueRotate)");
            closeModal();
        }
    });
}

var cur_game;

window.onload = function () {
    setOkButton("button-ok");
    newGame();
    console.log("onload")
}

function newGame () {
    if(cur_game)
        clearInterval(cur_game.counter);
    cur_game = new Game();
    cur_game.start();
}

