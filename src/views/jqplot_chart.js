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
		],
function($, Backbone, _, ui, _s, JqPlot, JqpBar, JqpCatAxisRenderer, ChartView){

	var JqPlotChartView = ChartView.extend({

		initialize: function(opts){
			$(this.el).addClass('jqplot-chart');
			this.initialRender();

			//this.model.on('change:data', this.onDataChange, this);
			this.model.on('change', this.render, this);
		},

		initialRender: function(){
			$(this.el).html('foo');
		},

		render: function(){
			var data = this.model.get('data');

			// Do nothing if there is no data.
			if (data.length < 1){
				return;
			}

			// Render empty chart container.
			$(this.el).html('<div class="body-container"><div class="body"></div></div>');
			this.$b = $('.body-container > .body', this.el);

			// Set size of chart to be proportional to number of data points.
			var row_height = this.$b.height() + 2;
			var chart_height = data.length * row_height + row_height;
			this.$b.css('minHeight', chart_height);

			// Format data for jqplot.	
			series = {};
			var labels = [];
			var i = 1;
			var dmin, dmax, drange;
			_.each(data, function(datum){
				_.each(datum.data, function(v, k){
					if (! series.hasOwnProperty(k)){
						series[k] = [];
					}
					var formatted_point = [v.value, i];
					series[k].push(formatted_point);

					// Update max/min.
					if (! (dmin < v.value)){
						dmin = v.value;	
					}
					if (! (dmax > v.value)){
						dmax = v.value;
					}
				}, this);

				labels.push(this.formatDatumLabel(datum));
				i += 1;
			}, this);
			
			drange = dmax - dmin;

			// Break out series into list.
			series_list = _.values(series) || [];

			// configure xaxis.
			var padding = .05;
			var xaxis = {
				padMin: padding,
				padMax: padding,
				tickOptions:{
					formatter: this.formatQuantityLabel
				},
				min: (this.model.get('min') == null) ? dmin - padding * drange: this.model.get('min'),
				max: (this.model.get('max') == null) ? dmax + padding * drange : this.model.get('max')
			};

			// Make plot.
			bar_width = row_height * .5;
			this.$b.jqplot(
				series_list,
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
				axes: {
					yaxis: {
						renderer: $.jqplot.CategoryAxisRenderer,
						ticks: labels
					},
					xaxis: xaxis
				}
			});
		},

		formatDatumLabel: function(datum){
			return _s.sprintf('<span data-category-id="%s" class="datum-label">%s</span>', datum.id, datum.label);
		},

		formatQuantityLabel: function(formatString, value){
			return value.toExponential(1);
		},

		onDataChange: function(){
			console.log('chart onDatachange');
			this.render();
		},

		resize: function(){
		}

	});

	return JqPlotChartView;
});
		
