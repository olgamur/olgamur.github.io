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
}

Game.prototype.start = function () {
    this.matrix = this.generateGameMatrix();
    this.drawCells();
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
    var g, polygon, points, text, textNode, val;
    var arr = [];
    var svgns = "http://www.w3.org/2000/svg";
    var field = document.getElementById("field");
    var xoffset = (Cell.width - Cell.side) / 2;
    
    var count = -1;
    
    for(var i = 0; i<4; i++) {
        for(var j=0; j<4; j++) {
            count += 1;

            g = document.createElementNS(svgns, "g");
            g.setAttribute("id", "cell_" + count);
            //запоминаем индексы выбранной ячейки
            g.setAttribute("i", i);
            g.setAttribute("j", j);
            g.setAttribute("class", "cell");

            //вычисляем и запоминаем координаты левого верхнего угла 
            //нового шестиугольника внутри ячейки
            x_hex = 0;
            y_hex = 0;

            //вычисляем и запоминаем координаты левого верхнего угла самой ячейки
            x_cell = j*(Cell.width-xoffset) + (Cell.width-xoffset)*i;
            y_cell = field.clientHeight / 2 - j * Cell.h + i * Cell.h;

            g.setAttribute("x", x_cell);
            g.setAttribute("y", y_cell);

            // g.setAttribute("transform", "translate(" + x_cell + "," + y_cell + ")");
            g.setAttribute("style", "transform: translate(" + 
                x_cell + "px," + y_cell + "px)");

            //массив координат углов шестиугольника
            points = [];
            points.push([x_hex, y_hex]);
            points.push([x_hex + Cell.xOffset, y_hex - Cell.h]);
            points.push([x_hex + Cell.xOffset + Cell.width/2, y_hex - Cell.h]);
            points.push([x_hex + Cell.width, y_hex]);
            points.push([x_hex + Cell.xOffset + Cell.width/2, y_hex + Cell.h]);
            points.push([x_hex + Cell.xOffset, y_hex + Cell.h]);

            //создание шестиугольника
            polygon = document.createElementNS(svgns, "polygon");
            polygon.setAttribute("points", points);
            polygon.setAttribute("fill", "url(#cell)");

            //создаем объект текста с номером ячейки
            text = document.createElementNS(svgns, 'text');
            text.setAttribute("x", x_hex + 70);
            text.setAttribute("y", y_hex);

            val = this.matrix[i][j] == 0 ? "" : this.matrix[i][j];

            textNode = document.createTextNode(val);
            text.appendChild(textNode);
            text.setAttribute("class", "text");

            //меняем цвет при наведении мыши на ячейку
            (function(element){
                element.addEventListener('mouseover', function(evt) {
                    element.setAttribute("filter", "url(#hueRotate)");
                });
            })(g);

            //возвращаем обычный вид ячейки при потере фокуса
            (function(element){
                element.addEventListener('mouseout', function(evt) {
                    element.removeAttribute("filter");
                });
            })(g);

            //обрабатываем событие щелчок по ячейке
            (function(element, game){
                element.addEventListener('click', function(evt) {

                    //индексы выбранной ячейки
                    var cell_i = parseInt(element.getAttribute("i"));
                    var cell_j = parseInt(element.getAttribute("j"));
                    var number = game.matrix[cell_i][cell_j];

                    var empty_cell_i = parseInt(game.empty_cell.getAttribute("i"));
                    var empty_cell_j = parseInt(game.empty_cell.getAttribute("j"));
                    
                    //индексы соседних ячеек
                    var nearby_indexes = [{i : cell_i - 1, j : cell_j},
                        {i : cell_i - 1, j : cell_j + 1},
                        {i : cell_i, j : cell_j + 1},
                        {i : cell_i + 1, j: cell_j},
                        {i : cell_i + 1, j : cell_j - 1},
                        {i : cell_i, j : cell_j - 1}];

                    //среди соседних ячеек ищем пустую
                    for (var k in nearby_indexes) {
                        if((nearby_indexes[k].i == 
                                parseInt(game.empty_cell.getAttribute("i"))) &&
                                    nearby_indexes[k].j == 
                                        parseInt(game.empty_cell.getAttribute("j"))) {
                            game.matrix[cell_i][cell_j] = [0];
                            game.matrix[empty_cell_i][empty_cell_j] = number;
                            game.animate(element);
                            if(game.isWin())
                                //отложить на время анимации, чтобы последняя фишка встала на место
                                alert("YOU WIN!!!!!");
                            break;
                        }
                    }
                });
            })(g, this);

            //добавляем все элементы ячейки на страницу
            g.appendChild(polygon);
            g.appendChild(text);

            //запоминаем пустую ячейку
            if(val == "") {
                this.empty_cell = g;
                this.empty_cell.setAttribute("class", this.empty_cell.getAttribute("class") + " empty");
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

Game.prototype.animate = function (cell) {
        var svgns = "http://www.w3.org/2000/svg";
    var temp = {};
    temp.x = cell.getAttribute("x");
    temp.y = cell.getAttribute("y");
    temp.i = cell.getAttribute("i");
    temp.j = cell.getAttribute("j");

    cell.setAttribute("style", "transform: translate(" + 
        this.empty_cell.getAttribute("x") + "px," + 
        this.empty_cell.getAttribute("y") + "px)");

    this.empty_cell.setAttribute("style", "transform: translate(" + 
        temp.x + "px," + 
        temp.y + "px)");

    cell.setAttribute("x", this.empty_cell.getAttribute("x"));
    cell.setAttribute("y", this.empty_cell.getAttribute("y"));
    cell.setAttribute("i", this.empty_cell.getAttribute("i"));
    cell.setAttribute("j", this.empty_cell.getAttribute("j"));

    this.empty_cell.setAttribute("x", temp.x);
    this.empty_cell.setAttribute("y", temp.y);
    this.empty_cell.setAttribute("i", temp.i);
    this.empty_cell.setAttribute("j", temp.j);
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

window.onload = function () {
    // document.body.style.cursor = "http://wiki-devel.sugarlabs.org/images/e/e2/Arrow.cur";
    var game = new Game();
    game.start();
}

