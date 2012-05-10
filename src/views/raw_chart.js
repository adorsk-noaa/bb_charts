define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"./chart"
		],
function($, Backbone, ChartView){

	var RawChartView = Backbone.View.extend({

		initialize: function(){
			this.render();
			this.model.on('change', this.render, this);
		},

		render: function(){
			$(this.el).html(JSON.stringify(this.model.toJSON()));
		}

	});

	return RawChartView;
});
		
