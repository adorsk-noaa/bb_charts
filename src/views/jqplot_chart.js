define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"use!jqplot",
	"use!jqp_bar",
	"use!jqp_cat_axis_renderer",
	"./chart",
	"../util/lumberjack_interpreter",
		],
function($, Backbone, _, ui, _s, JqPlot, JqpBar, JqpCatAxisRenderer, ChartView, LumberJackInterpreter){

	var JqPlotChartView = ChartView.extend({

		initialize: function(opts){
			$(this.el).addClass('jqplot-chart');
			this.render();
		},

		render: function(){

			// Render empty chart container.
			$(this.el).html('<div class="body-container"><div class="body"></div></div>');
			this.$b = $('.body-container > .body', this.el);

			// Parse data into flat list.
			var data = this.parseTreeData(this.model.get('data'));

			// Set size of chart to be proportional to number of data points.
			var row_height = this.$b.height() + 2;
			var chart_height = data.length * row_height + row_height;
			this.$b.css('minHeight', chart_height);
			
			

			// Format data for jqplot.	
			var filtered_series = [];
			var unfiltered_series = [];
			var labels = [];
			var i = 1;
			_.each(data, function(datum){
				filtered_series.push([datum.data[0].value, i])
				unfiltered_series.push([datum.data[0].value * 1.25, i])
				labels.push(this.formatDatumLabel(datum));
				i += 1;
			}, this);

			// Make plot.
			bar_width = row_height * .5;
			this.$b.jqplot(
				[unfiltered_series, filtered_series],
				{
				seriesDefaults:{
					renderer:$.jqplot.BarRenderer,
					rendererOptions: {
						barDirection: 'horizontal',
						barPadding: -1 * bar_width,
						barWidth: bar_width,
						fillToZero: true
					}
				},
				series:[] , 
				axes: {
					yaxis: {
						renderer: $.jqplot.CategoryAxisRenderer,
						ticks: labels
					},
					xaxis: {
						pad: 1.05,
						tickOptions:{
							formatter: this.formatQuantityLabel
						}
					}
				}
			});
		},

		parseTreeData: function(tree){
			var interpreter = new LumberJackInterpreter();
			var leafs = interpreter.parse(tree);
			return leafs;
		},

		formatDatumLabel: function(datum){
			return _s.sprintf('<span data-category-id="%s" class="datum-label">%s</span>', datum.id, datum.label);
		},

		formatQuantityLabel: function(formatString, value){
			return value.toExponential(1);
		}

	});

	return JqPlotChartView;
});
		