var gameMatrix;
var steps;
var images;
var canvas;
var context;
var emptyCell;

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

window.onload = function () {
    init();
}

function initImages () {
    // debugger;
    var images_array = new Array();
    for (i = 0; i <= 15; i++) {
        var image = new Image();
        image.src = 'images/cell_' + i.toString() + '.gif';
        images_array.push(image);
    }
    return images_array;
}

function generateGameMatrix () {
    // debugger;
    var matrix = new Array();
    var values = Array.range(0, 16);
    for ( var i = 0; i < 4; i++) {
        var vect = new Array();
        for ( var j = 0; j < 4; j++)
            vect.push(values.splice(Math.floor(Math.random() * values.length), 1));
        matrix.push(vect);
    }
    return matrix;
}

/*function generateDefaultMatrix () {
    //debugger;
    var matrix = new Array();
    var values = Array.range(0, 16);
    for ( var i = 0; i < 4; i++) {
        var vect = new Array();
        for ( var j = 0; j < 4; j++)
            vect.push(4 * i + (j + 1))
        matrix.push(vect);
    }
    matrix[i-1][j-1] = 0;
    return matrix;
}*/

function isWin () {
    //debugger;
    win = true;
    
    for ( var i = 0, true_value = 1; i < 4; i++) {
        for (j = 0; j < 4; j++, true_value++) {
            if(i == 3 && j == 3)
                true_value = 0;
            if (gameMatrix[i][j] != true_value) {
                win = false;
                break;
            }
        }
    }
    
    return win;
}

function init () {
    // debugger;
	steps = 0;
    canvas = document.getElementById('field');
    context = canvas.getContext('2d');
    canvas.height = canvas.width = 560;
    gameMatrix = generateGameMatrix();
    images = initImages();
    drawCells(context);
    emptyCell = getEmptyCell();
    
    canvas.onclick = function (e) {
        // debugger;
        var clientWidth = !window.opera ? document.documentElement.clientWidth : document.body.clientWidth;
        var clientHeight = !window.opera ? document.documentElement.clientHeight : document.body.clientHeight;
        var x = e.pageX - (clientWidth / 2 - 560 / 2);
        var y = e.pageY - 145;
        var cell = getCurrentCell(x, y);
        a = cell.x;
        b = cell.y;
        move(a, b);
        if (isWin()) {
		    alert('You won!!! Victory by'+steps+'steps.');
            canvas.onclick = function (e) {
            }
        }
    }
}

function move (i, j) {
    // debugger;
    var nullX = emptyCell.x;
    var nullY = emptyCell.y;
    var moveToX = -1;
    var moveToY = -1;
    var find = false;
    
    Array([ i - 1, j ], [ i + 1, j ], [ i, j - 1 ], [ i, j + 1 ]).forEach(function (record) {
        if (find)
            return;
        var x = record[0];
        var y = record[1];
        if (x == nullX && y == nullY) {
            moveToX = x;
            moveToY = y;
            find = true;
            return;
        }
    });
    
    if (!find)
        return;
    
	steps++;
    var temp = gameMatrix[i][j];
    gameMatrix[i][j] = gameMatrix[moveToX][moveToY];
    gameMatrix[moveToX][moveToY] = temp;
	
    setCellView(i, j, context);
    setCellView(moveToX, moveToY, context);
	//context.clearRect(j*140,i*140,140,140);
    emptyCell = {
        "x" : i,
        "y" : j
    };
}

function getEmptyCell () {
    for ( var i = 0; i < 4; i++) {
        for ( var j = 0; j < 4; j++) {
            if (gameMatrix[i][j] == 0) {
                return {
                    "x" : i,
                    "y" : j
                };
            }
        }
    }
}

function getCurrentCell (x, y) {
    // debugger;
    return {
        "x" : Math.floor(y / 140),
        "y" : Math.floor(x / 140)
    };
}

function drawCells (context) {
    var img = images[gameMatrix[0][0]];
    context.drawImage(img, 10, 10, 140, 140);
    for ( var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++)
        {
          setCellView(i, j, context);
        }
    }
}

function setCellView (i, j, context) {
    var img = images[gameMatrix[0][0]];
    context.drawImage(img, 200, 200, 140, 140)
	// var img = images[gameMatrix[i][j]];
	// context.drawImage(img, j * 130, i * 120, 140, 140);
//		context.rotate(45); 
}
