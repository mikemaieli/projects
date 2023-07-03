var width = 800,
    height = 500,
    formatPercent = d3.format(".1%");

var color = d3.scale.quantize()
	.domain([0, 0.58])
		.range(["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"]);

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

d3.json("us.json", function (error, us) {
	d3.csv("data.csv", function (error, data) {
		var indicator = document.getElementById("varmenu").value;
		varName = "Itemized Deductions";
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

		function update(indicator){
			data.forEach(function (d) {
				rateById[d.id] = +d[indicator];
			});

			indicator = document.getElementById("varmenu").value;
			switch (indicator){
			case "itemized_pct": color = d3.scale.quantize().domain([0, 0.58]).range(["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"]); varName = "Itemized Deductions"; break;
			case "eitc_pct": color = d3.scale.quantize().domain([0, 0.55]).range(["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"]); varName = "Earned Income Credit"; break;
			case "mortgageded_pct": color = d3.scale.quantize().domain([0, 0.55]).range(["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"]); varName = "Mortgage Interest Deduction"; break;
			case "capgain_pct": color = d3.scale.quantize().domain([0, 0.4]).range(["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"]); varName = "Capital Gains"; break;
			case "interest_pct": color = d3.scale.quantize().domain([0, 0.72]).range(["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"]); varName = "Taxable Interest"; break;
			case "childcredit_pct": color = d3.scale.quantize().domain([0, 0.1]).range(["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"]); varName = "Child Credit"; break;
			case "prep_pct": color = d3.scale.quantize().domain([0.28, 0.91]).range(["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"]); varName = "Paid Tax Preparer"; break;
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
