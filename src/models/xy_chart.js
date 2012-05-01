define([
	"use!backbone",
	"use!underscore",
	"./chart"
], 
function(Backbone, _, ChartModel){

var XYChartModel = ChartModel.extend({

	defaults: _.extend(ChartModel.prototype.defaults, {
		grid_line_positions: [0, .25, .5, .75, 1]
	}),

});

return XYChartModel;

});

