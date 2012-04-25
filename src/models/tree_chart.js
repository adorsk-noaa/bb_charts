define([
	"use!backbone",
	"use!underscore",
	"./chart"
], 
function(Backbone, _, ChartModel){

var TreeChartModel = ChartModel.extend({

	defaults: _.extend(ChartModel.prototype.defaults, {
		data_tree: {}
	}),

	initialize: function(){
	}

});

return TreeChartModel;

});

