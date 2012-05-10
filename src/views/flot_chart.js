define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"flot",
	"./chart"
		],
function($, Backbone, _, ui, _s, flot, ChartView){

	var FlotChartView = ChartView.extend({

		initialize: function(opts){
			this.render();
		},

		render: function(){
			var w = $(this.el).width();
			var h = $(this.el).height();
			console.log(w,h);

			$(this.el).html(_s.sprintf('<div class="chart-image" style="width:%spx; height: %spx;"></div>', w, h));
			$.plot($('.chart-image', this.el), [ [[0, 0], [1, 1]] ], { yaxis: { max: 1 } });
		},

		resize: function(){
			this.render();
		}

	});

	return FlotChartView;
});
		
