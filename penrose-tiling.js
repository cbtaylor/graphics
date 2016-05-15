function penroseTiling() {
    var _width = 1200;
    var _height = 750;
    var _chart = {};
    var _iterations = 12;
    var _svg;
    var _parentElement = d3.select("body");
    var _bodyG;
    var _data = getInitialData();

    function getInitialData() {
        var firstIterationData = [{
            elementType: "hk",
            iteration: 0,
            parent: null,
            points: [
                {x: -_width, y: _height},
                {x: _width * 2, y: _height},
                {x: -_width + 3 * _width * Math.cos(Math.PI / 5.0), y: _height - 3 * _width * Math.sin(Math.PI / 5.0)}
            ]
        }]
        var allIterationData = firstIterationData;
        var tmp = firstIterationData;
        for (var i=1; i<_iterations; i++) {
            var nextIterationData = iterate(tmp);
            allIterationData = allIterationData.concat(nextIterationData);
            tmp = nextIterationData;
        }
        return allIterationData;
    };
    
    function interpolatePoints(p1, p2, ratio) {
        var x = p1.x * (1.0 - ratio) + p2.x * (ratio);
        var y = p1.y * (1.0 - ratio) + p2.y * (ratio);
        return {x: x, y: y};
    };

    function createTriangle(elementType, iteration, parent, points) {
        return {
            elementType: elementType,
            iteration: iteration,
            parent: parent,
            points: points
        };
    };
    
    function iterate(data) {
        var PHI = (1.0 + Math.sqrt(5)) / 2.0;
        var newData = [];
        for (var i=0; i<data.length; i++) {
            d = data[i];
            if (d.elementType == "hk") {
                console.log("Dividing a half-kite");
                var p1 = interpolatePoints(d.points[0], d.points[2], 1.0 - 1.0 / PHI);
                var p2 = interpolatePoints(d.points[0], d.points[1], 1.0 / PHI);
                newData.push(createTriangle("hd", d.iteration + 1, d, [p1, d.points[0], p2]));
                newData.push(createTriangle("hk", d.iteration + 1, d, [d.points[2], p2, p1]));
                newData.push(createTriangle("hk", d.iteration + 1, d, [d.points[2], p2, d.points[1]]));
            } else if (d.elementType == "hd") {
                console.log("Dividing a half-dart");
                var p1 = interpolatePoints(d.points[1], d.points[2], 1.0 / PHI);
                newData.push(createTriangle("hk", d.iteration + 1, d, [d.points[1], d.points[0], p1]));
                newData.push(createTriangle("hd", d.iteration + 1, d, [p1, d.points[2], d.points[0]]));
            }
        }
        return newData;
    }
    
    _chart.render = function () {
        if (!_svg) {
            _svg = _parentElement.append("svg")
                .attr("height", _height)
                .attr("width", _width);
            
            defineBodyClip(_svg);
        }
        renderBody(_svg);
    };
    
    function defineBodyClip(svg) {
        svg.append("defs")
                .append("clipPath")
                .attr("id", "body-clip")
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", _width)
                .attr("height", _height);
    }
    
    function renderBody(svg) {
        if (!_bodyG)
            _bodyG = svg.append("g")
                    .attr("clip-path", "url(#body-clip)");        
        renderTiling();
    }
    
    function renderTiling() {
        var triangles = _bodyG.selectAll("path")
            .data(_data);

        triangles.exit().remove();
    
        triangles.enter().append("path");
    
        triangles
            .attr("fill", function (d) {return (d.elementType == "hk" ? "#008B8B" : "#00CED1");})
            .attr("stroke", "#fff")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", "1px")
            .attr("fill-opacity", 0)
            .attr("d", function(d) { return "M" + d.points.map(function (point) {return [point.x, point.y]}).join("L") + "Z"; });
        
        for (var i=0; i<_iterations; i++) {
            triangles
            .filter(function (d) {return d.iteration == i;})
            .classed("iteration-" + i, true)
            .transition()
            .delay(1000 * i)
            .duration(1000)
            .attr("stroke-opacity", 1.0)
            .attr("fill-opacity", 1.0);
        }
    }
    
    _chart.width = function (w) {
        if (!arguments.length) return _width;
        _width = w;
        return _chart;
    };
    
    _chart.height = function (h) {
        if (!arguments.length) return _height;
        _height = h;
        return _chart;
    };

    return _chart;
}