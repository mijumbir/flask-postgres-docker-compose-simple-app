app.service('graphService', function() {

    //========================================================================//
    //---------------------------- Graphing Class ----------------------------//
    //========================================================================//
    //---------------------------- Graphing Class ----------------------------//
    this.GraphD3 = function(element, width, height, margin) {

        // Axes
        this.x = undefined;
        this.y = {};

        // Dimensions
        this.height = height;
        this.width = width;
        this.margin = margin;
        this.svg = element;

        // Tick Count
        this.tickCount = 8;
        
        // Viewbox dimensions.
        // var viewBoxWidth = Math.min(width + margin.left + margin.right, height + margin.top + margin.bottom);
        // var viewBoxHeight = Math.min(width + margin.left + margin.right, height + margin.top + margin.bottom);
        var viewBoxWidth = width + margin.left + margin.right;
        var viewBoxHeight = height + margin.top + margin.bottom;

        // Adding SVG element.
        this.svg = d3.select(element)
            .append("svg")
            .attr("width", '100%')//width + margin.left + margin.right)
            .attr("height", '100%')//height + margin.top + margin.bottom)
            .attr('viewBox','0 0 ' + viewBoxWidth +' '+ viewBoxHeight)
            .attr('preserveAspectRatio','xMinYMin')
            .style('display', 'block')
            .style('margin', '0 auto')
            .style("font-size","35px")
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }


    //------------------------------------------------------------------------//
    // Add integer labels to xAxis.
    this.GraphD3.prototype.addAxisX = function(xAxisValues, displayLabels){

        this.x = d3.scale.linear().range([0, this.width]);

        var xAxis = d3.svg.axis().scale(this.x).orient("bottom").ticks(this.tickCount);

        this.x.domain([xAxisValues[0], xAxisValues[xAxisValues.length-1]]);

        if (displayLabels) {
            this.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + this.height + ")")
                .call(xAxis);
        }
    };


    //------------------------------------------------------------------------//
    // Add integer labels to xAxis.
    this.GraphD3.prototype.addDateAxisX = function(xAxisLabels){

        //var parseDate = d3.time.format("%Y-%m-%d").parse;
        var minDate = xAxisLabels[0];
        var maxDate = xAxisLabels[xAxisLabels.length-1];

        this.x = d3.time.scale().domain([minDate, maxDate]).range([0, this.width]); 

        var xAxis = d3.svg.axis().scale(this.x).orient("bottom").ticks(this.tickCount);

        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(xAxis);
    };

    //------------------------------------------------------------------------//
    // Add integer labels to xAxis.
    this.GraphD3.prototype.addAxisLabelsDailyToWeekly = function(xAxisLabels){

        var x = d3.scale.linear().range([0, this.width]);

        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(this.tickCount);

        x.domain([parseInt(xAxisLabels[0] / 7), parseInt(xAxisLabels[xAxisLabels.length-1] / 7)]);

        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(xAxis);
    };


    //------------------------------------------------------------------------//
    // Add integer labels to xAxis.
    this.GraphD3.prototype.addAxisTitleX = function(text){

        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", this.height + (this.margin.bottom))
            .attr("text-anchor", "middle")
            // .style("font-weight", "bold")
            .style("font-size", "35")
            .style('fill', 'darkOrange')
            .text(text);
    };


    //------------------------------------------------------------------------//
    // Add integer labels to xAxis.
    this.GraphD3.prototype.addGraphTitle = function(text){

        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", 0 - (this.margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "40")
            .style('font-weight', 'bold') 
            .style('fill', 'darkOrange')
            .text(text);

    };

    this.GraphD3.prototype.addAxisTitleY = function(text){

        this.svg.append("text")
            .attr("y", 0)
            .attr("x", 0)
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (-this.margin.left/1.5) +","+(this.height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .style("font-size", "40") 
            .style('fill', 'darkOrange')
            .text(text);

    };

    // this.GraphD3.prototype.addDownloadButtons =function(downloadPdf, downloadPng){
    //     //PDF Button
    //     this.svg.append("rect")
    //         .attr("x", this.width - 125)
    //         .attr("y", 0 - (this.margin.top / 2 + 17))
    //         .attr("width",110)
    //         .attr("height",25)
    //         .style("fill", "rgb(18,65,145)")
    //         .on('click', downloadPdf)
    //         .on('mouseover',function(d){d3.select(this).style("cursor","pointer")});
    //
    //     this.svg.append("text")
    //         .attr("x", this.width-70)
    //         .attr("y", 0 - (this.margin.top / 2))
    //         .attr("text-anchor", "middle")
    //         .style("font-size", "15")
    //         .style('font-weight', 'bold')
    //         .style("fill", "white")
    //         .text("Download PDF")
    //         .on('click', downloadPdf)
    //         .on('mouseover',function(d){d3.select(this).style("cursor","pointer")});
    //
    //     //PNG Button
    //     this.svg.append("rect")
    //         .attr("x", this.width - 125 - 120)
    //         .attr("y", 0 - (this.margin.top / 2 + 17))
    //         .attr("width",110)
    //         .attr("height",25)
    //         .style("fill", "rgb(18,65,145)")
    //         .on('click', downloadPdf)
    //         .on('mouseover',function(d){d3.select(this).style("cursor","pointer")});
    //
    //     this.svg.append("text")
    //         .attr("x", this.width-70 - 120)
    //         .attr("y", 0 - (this.margin.top / 2))
    //         .attr("text-anchor", "middle")
    //         .style("font-size", "15")
    //         .style('font-weight', 'bold')
    //         .style("fill", "white")
    //         .text("Download PNG")
    //         .on('click', downloadPng)
    //         .on('mouseover',function(d){d3.select(this).style("cursor","pointer")});
    // };
    //

    //------------------------------------------------------------------------//
    // Add yAxis
    this.GraphD3.prototype.addAxisY = function(name, orientation, colour, dataset, lower_offset, upper_offset){

        this.y[name] = d3.scale.linear().range([this.height, 0]);

        var yAxis = d3.svg.axis().scale(this.y[name]).orient(orientation).ticks(this.tickCount);

        this.y[name].domain([lower_offset*d3.min(dataset, function(d) { return Math.max(d.value); }), upper_offset * d3.max(dataset, function(d) { return Math.max(d.value); })]); 

        var yTranslation = orientation === 'right' ? this.width : 0;

        this.svg.append("g")
            .attr("class", "y axis")
            .style("fill", colour)
            .attr("transform", "translate(" + yTranslation + " ,0)")
            .call(yAxis);
    };


    //------------------------------------------------------------------------//
    // Add dataset
    this.GraphD3.prototype.addDataset = function(axisName, colour, dataset, dashed){
        var svg = this.svg;
        var xFunc = this.x;
        var yFunc = this.y[axisName];

        var line = d3.svg.line()
            .x(function(d) {var circle = svg.append("circle");
                                // adding one circle to every point on the graph(used for hovering)
                                // TODO find a better place to add the listeners
                                circle.attr("r", 25)
                                .attr("cx",xFunc(d.date))
                                .attr("cy",yFunc(d.value))
                                .style("opacity",0)
                                .on("mouseover", function(data) {
                                                    circle.style("opacity",.5);
                                                    div.transition()
                                                    .duration(400)
                                                    .style("opacity", .9);
                                                    // for the EDP1 graph the x axis displays the number of weeks from p7, so a check has to be done to determine the label
                                                    div.html("Value: "+ d.value + "<br/>"+ (d.date.toString().includes(" ")?"Date: "+d.date.toString().substring(4,16):"Weeks: "+d.date))
                                                    .style("left", (d3.event.pageX) + "px")
                                                    .style("top", (d3.event.pageY - 28) + "px");
                                                    console.log("dofff",d.date);
                                                })
                                .on("mouseout", function(d) {
                                                    circle.style("opacity",0)
                                                    div.transition()
                                                    .duration(500)
                                                    .style("opacity", 0);
                                                });
                            return xFunc(d.date); })
            .x(function(d) {var circle = svg.append("circle");
                                // adding one circle to every point on the graph(used for hovering)
                                // TODO find a better place to add the listeners
                                circle.attr("r", 15)
                                .attr("cx",xFunc(d.date))
                                .attr("cy",yFunc(d.value))
                                .style("opacity",0)
                                .on("mouseover", function(data) {
                                                    circle.style("opacity",.5);
                                                    div.transition()
                                                    .duration(200)
                                                    .style("opacity", .9);
                                                    // for the EDP1 graph the x axis displays the number of weeks from p7, so a check has to be done to determine the label
                                                    div.html("Value: "+ d.value + "<br/>"+ (d.date.toString().includes(" ")?"Date: "+d.date.toString().substring(4,16):"Weeks: "+d.date/7))
                                                    .style("left", (d3.event.pageX) + "px")
                                                    .style("top", (d3.event.pageY - 28) + "px");
                                                })
                                .on("mouseout", function(d) {
                                                    circle.style("opacity",0)
                                                    div.transition()
                                                    .duration(500)
                                                    .style("opacity", 0);
                                                });
                            return xFunc(d.date); })
            .y(function(d) { return yFunc(d.value); });

        var dashSize = dashed ? 5 : 0;
        var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
        this.svg.append("path")
            .style("stroke", colour)
            .style("stroke-width", 3)
            .style('stroke-dasharray', dashSize + ',' + dashSize)
            .attr("d", line(dataset));
    };


    //------------------------------------------------------------------------//
    // Add background.
    this.GraphD3.prototype.addBackground = function(colour){

        this.svg.append("rect")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("fill", colour);
    };


    //------------------------------------------------------------------------//
    // Add yAxis grid.
    this.GraphD3.prototype.addAxisGridY = function(axisName, colour){

        var make_y_axis = function(axis) {   
            return d3.svg.axis()
                .scale(axis)
                .orient("left")
                .ticks(this.tickCount);
        }

        this.svg.append("g")         
            .style("stroke", colour)
            .call(make_y_axis(this.y[axisName])
                .tickSize(-this.width, 100, 100)
                .tickFormat("")
            )
    };


        // Add yAxis grid.
    this.GraphD3.prototype.addAxisGridX = function(colour){

        var make_x_axis = function(axis) {   
            return d3.svg.axis()
                .scale(axis)
                .orient("bottom")
                .ticks(this.tickCount);
        }

        this.svg.append("g")         
            .style("stroke", colour)
            .call(make_x_axis(this.x)
                .tickSize(this.height, 100, 100)
                .tickFormat("")
            )
    };



    // this.GraphD3.prototype.addTitle = function(title){

    //     this.svg.append("text")
    //         .attr("x",this.width/2)
    //         .attr("y", 0-40)
    //         .attr("text-anchor", "middle")
    //         .style("font","35px cabin")
    //         .style('fill', 'darkOrange')
    //         .text(title);

    // };

    //------------------------------------------------------------------------//
    // Add dashed line.
    this.GraphD3.prototype.addLine = function(index, colour, text){

        this.svg.append("line")
            .attr("y1", 0)
            .attr("y2", this.height)
            .attr("x1", this.x(index))
            .attr("x2", this.x(index))
            .style("stroke-width", 4)
            .style("stroke", colour)
            .style("opacity", '0.8')
            .style("fill", "none")
            .style('stroke-dasharray', '8,8');

        this.svg.append("rect")
            .attr("x", this.x(index) - 15)
            .attr("y", 30)
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("width", 30)
            .attr("height", 30)
            .attr("fill", colour);

        this.svg.append("text")
            .attr("x", this.x(index))
            .attr("y", 45)
            .attr("text-anchor", 'middle')
            .attr("alignment-baseline", 'central')
            .style("font-weight", "bold")
            .style("font-size", "12")
            .style("fill", "white")
            .text(text);
    };


    //------------------------------------------------------------------------//
    // Add solid line.
    this.GraphD3.prototype.addP7P8 = function(index, colour, text){

        this.svg.append("line")
            .attr("y1", 0)
            .attr("y2", this.height)
            .attr("x1", this.x(index))
            .attr("x2", this.x(index))
            .style("stroke-width", 6)
            .style("stroke", colour)
            .style("opacity", '1')
            .style("fill", "none");

        this.svg.append("rect")
            .attr("x", this.x(index) - 22.5)
            .attr("y", 45)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("width", 45)
            .attr("height", 35)
            .attr("fill", colour);

        this.svg.append("text")
            .attr("x", this.x(index))
            .attr("y", 61.5)
            .attr("text-anchor", 'middle')
            .attr("alignment-baseline", 'central')
            .style("font-weight", "bold")
            .style("font-size", "20")
            .style("fill", "white")
            .text(text);
    };




    this.GraphD3.prototype.addOccurence = function(index, colour){

        this.svg.append("line")
            .attr("y1", 0)
            .attr("y2", this.height)
            .attr("x1", this.x(index))
            .attr("x2", this.x(index))
            .style("stroke-width", 6)
            .style("stroke", colour)
            .style("opacity", '1')
            .style("fill", "none");

    };


    this.createVerticalLegend = function(element, datasets) {
        // Adding SVG element.
        var svg = d3.select(element)
            .append("svg")
            .attr("width", '100%')//width + margin.left + margin.right)
            .attr("height", '100%')//height + margin.top + margin.bottom)
            .attr('viewBox','0 0 ' + 400 +' '+ 500)
            .attr('preserveAspectRatio','xMinYMin')
            .style('display', 'block')
            .style('margin', '0 auto');

        for (var i = 0; i < datasets.length; i++) {

            var dashSize = datasets[i].dashed ? 5 : 0;

            var y = 25 + (i * 75);

            svg.append("line")
                .attr("y1", y)
                .attr("y2", y)
                .attr("x1", 0)
                .attr("x2", 75)
                .style("stroke-width", 5)
                .style("stroke", datasets[i].colour)
                .style('stroke-dasharray', dashSize + ',' + dashSize)
                .style("fill", "none");

            svg.append("text")
                .attr("x", 100)
                .attr("y", y)
                // .attr("text-anchor", 'middle')
                .attr("alignment-baseline", 'central')
                // .style("font-weight", "bold")
                .style("font-size", "25")
                .style("fill", "black") 
                .text(datasets[i].name);
        }
    }


    this.createHorizontalLegend = function(element, datasets) {
        // Adding SVG element.
        var svg = d3.select(element)
            .append("svg")
            .attr("width", '600px')//width + margin.left + margin.right)
            .attr("height", '100%')//height + margin.top + margin.bottom)
            .attr('viewBox','0 0 ' + 1000 +' '+ 50)
            .attr('preserveAspectRatio','xMinYMin')
            .style('display', 'block')
            .style('margin', '0 auto');

        for (var i = 0; i < datasets.length; i++) {

            var dashSize = datasets[i].dashed ? 5 : 0;

            var x = 25 + (i * 350);

            svg.append("line")
                .attr("x1", x)
                .attr("x2", x + 50)
                .attr("y1", 12.5)
                .attr("y2", 12.5)
                .style("stroke-width", 5)
                .style("stroke", datasets[i].colour)
                .style('stroke-dasharray', dashSize + ',' + dashSize)
                .style("fill", "none");

            svg.append("text")
               .attr("x", x + 60)
                .attr("y", 12.5)
                // .attr("text-anchor", 'middle')
                .attr("alignment-baseline", 'central')
                // .style("font-weight", "bold")
                .style("font-size", "20px")
                // .style("fill", datasets[i].colour) 
                .text(datasets[i].name);
        }
    }

});