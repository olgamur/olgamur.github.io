function SVGElementBuilder() {
    this.svgns = "http://www.w3.org/2000/svg";
}

SVGElementBuilder.prototype.create = function(name, attrs) {
    var element = document.createElementNS(this.svgns, name);

    for(var i in attrs) {
        element.setAttribute(i, attrs[i]);
    }

    return element;
}

SVGElementBuilder.prototype.buildCell = function (i, j, x, y, val) {
    var g = this.buildGroup(i, j, x, y);
    var polygon = this.buildPolygon(0, 0);
    var text = this.buildText(0, 0);
    var textNode = document.createTextNode(val);
           
    text.appendChild(textNode);
    g.appendChild(polygon);
    g.appendChild(text);

    return g;
}

SVGElementBuilder.prototype.buildPolygon = function(x, y) {
    var points = [];

    points.push([x, y]);
    points.push([x + Cell.xOffset, y - Cell.h]);
    points.push([x + Cell.xOffset + Cell.width/2, y - Cell.h]);
    points.push([x + Cell.width, y]);
    points.push([x + Cell.xOffset + Cell.width/2, y + Cell.h]);
    points.push([x + Cell.xOffset, y + Cell.h]);

    var attrs = {"points" : points, "fill" : "url(#cell)"};

    return this.create("polygon", attrs);
};

SVGElementBuilder.prototype.buildGroup = function(i, j, x, y) {
    var attrs = {"class" : "cell",
                "i" : i, "j" : j, "x" : x, "y" : y,
                "style" : "transform: translate(" + 
                    x + "px," + y + "px)"};

    var element = this.create("g", attrs);

    element.addEventListener('mouseover', function(evt) {
        element.setAttribute("filter", "url(#hueRotate)");
    });

    element.addEventListener('mouseout', function(evt) {
        element.removeAttribute("filter");
    });


    return element;
}

SVGElementBuilder.prototype.buildText = function(x, y) {
    var attrs = {"x" : x + Cell.width/2, "y" : y, "class" : "text"};

    return this.create("text", attrs);
}