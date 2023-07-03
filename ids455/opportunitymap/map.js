var width = 800,
    height = 500,
    formatPercent = d3.format(".1%");

var color = d3.scale.quantize()
	.domain([0, 0.25])
		.range(['#fee5d9','#fcae91','#fb6a4a','#de2d26','#a50f15']);

var projection = d3.geo.albersUsa()
	.translate([width / 2, height / 2]);

var path = d3.geo.path()
	.projection(projection);

var svg = d3.select("#map").append("svg")
	.attr("width", width)
	.attr("height", height);

var tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

var legendText = ["Low", "", "", "", "High"];
var legendColors = ['#fee5d9','#fcae91','#fb6a4a','#de2d26','#a50f15'];	

d3.json("https://raw.githubusercontent.com/mikemaieli/d3/master/ids455/opportunitymap/us.json", function (error, us) {
	d3.csv("https://raw.githubusercontent.com/mikemaieli/d3/master/ids455/opportunitymap/data.csv", function (error, data) {
		var indicator = document.getElementById("varmenu").value;
		varName = "Unemployment rate";
		var countyById = {};
		var stateById = {};
		var rateById = {};

		data.forEach(function (d) {
			countyById[d.id] = d.countyname;
			stateById[d.id] = d.state;
			rateById[d.id] = +d[indicator];
           });

		svg.append("g")
			.attr("class", "counties")
			.selectAll("path")
				.data(topojson.feature(us, us.objects.counties).features)
				.enter().append("path")
				.attr("class", "county")
				.attr("d", path)
				.style("fill", function (d) {
					return color(rateById[d.id]);
				});

		svg.selectAll(".county")
		.on("mouseover", function(d) {
			tooltip.transition()
			.duration(250)
			.style("opacity", 1);
			tooltip.html(
			"<p><strong>" + countyById[d.id] + ", " + stateById[d.id] + "</strong></p>" +
			"<p>" + varName + ": " + formatPercent(rateById[d.id]) + "</p>"
			)
			.style("left", (d3.event.pageX + 15) + "px")
			.style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout", function(d) {
			tooltip.transition()
			.duration(250)
			.style("opacity", 0);
		});

		svg.append("path")
			.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
			.attr("class", "states")
			.attr("d", path);

		var legend = svg.append("g")
			.attr("id", "legend");
	
		var legenditem = legend.selectAll(".legenditem")
			.data(d3.range(5))
			.enter()
			.append("g")
				.attr("class", "legenditem")
				.attr("transform", function(d, i) { return "translate(" + i * 31 + ",0)"; });
	
		legenditem.append("rect")
			.attr("x", 640)
			.attr("y", 19)
			.attr("width", 30)
			.attr("height", 6)
			.attr("class", "rect")
			.style("fill", function(d, i) { return legendColors[i]; });
	
		legenditem.append("text")
			.attr("x", 654)
			.attr("y", 12)
			.style("text-anchor", "middle")
			.text(function(d, i) { return legendText[i]; });		
		
		function update(indicator){
			data.forEach(function (d) {
				rateById[d.id] = +d[indicator];
			});

			indicator = document.getElementById("varmenu").value;
			switch (indicator){
			case "unemploymentrate": color = d3.scale.quantize().domain([0, 0.25]).range(['#fee5d9','#fcae91','#fb6a4a','#de2d26','#a50f15']); varName = "Unemployment rate"; break;
			case "povertyrate": color = d3.scale.quantize().domain([0, 0.55]).range(['#fee5d9','#fcae91','#fb6a4a','#de2d26','#a50f15']); varName = "Percent of residents below the poverty line"; break;
			case "nobachdegreerate": color = d3.scale.quantize().domain([0.7, 1]).range(['#fee5d9','#fcae91','#fb6a4a','#de2d26','#a50f15']); varName = "Residents 25 and over without a Bachelor's degree"; break;
			}

			d3.selectAll(".counties").selectAll("path")
				.style("fill", function (d) {
					return color(rateById[d.id]);
				});
		}

		d3.select("#varmenu")
			.on("change", function() {
				indicator = this.value;
				update(indicator);
			});
	});
});

d3.select(self.frameElement).style("height", "670px");
