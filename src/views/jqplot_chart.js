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
			this.$body_container = $('<div class="body-container"></div>');
			$(this.el).append(this.$body_container);
			this.offsets = this.getBodyOffsets();
			this.row_h = this.getRowHeight();
			this.xaxis_h = this.getXAxisHeight();
			this.title_h = this.getTitleHeight();
		},

		// Get body container offsets (scrollbars).
		getBodyOffsets: function(){
			var offsets = {};
			var $tmp_body = $('<div style="visibility: hidden; position: absolute; left:0; right: 0; bottom: 0; top: 0;"></div>');
			this.$body_container.css('overflow', 'scroll');
			this.$body_container.append($tmp_body);
			offsets.w = this.$body_container.width() - $tmp_body.outerWidth();
			offsets.h = this.$body_container.height() - $tmp_body.outerHeight();
			$tmp_body.remove();
			this.$body_container.css('overflow', '');
			return offsets;
		},

		// Calculate height of the xaxis by making a fake axis.
		getRowHeight: function(){
			var $tmp_body = $('<div class="body jqplot-target" style="visibility: hidden; position: absolute; height: 100%;"></div>');
			var $tmp_yaxis = $('<div class="jqplot-axis jqplot-yaxis"></div>');
			var $tmp_tick = $('<div class="jqplot-yaxis-tick" style="position: absolute;"></div>');
			var $tmp_label = $(this.formatDatumLabel({id: '', label: '&nbsp;'}));

			this.$body_container.append($tmp_body);
			$tmp_body.append($tmp_yaxis);
			$tmp_yaxis.append($tmp_tick);
			$tmp_tick.append($tmp_label);
			row_h = $tmp_tick.outerHeight();
			$tmp_body.remove();
			return row_h;
		},
		
		// Calculate height of a row by making a fake axis.
		getXAxisHeight: function(){
			var $tmp_body = $('<div class="body jqplot-target" style="visibility: hidden; position: absolute; height: 100%;"></div>');
			var $tmp_xaxis = $('<div class="jqplot-axis jqplot-xaxis" style="position: absolute;"></div>');
			var $tmp_tick = $('<div class="jqplot-xaxis-tick" style="position: absolute;">&nbsp;</div>');

			this.$body_container.append($tmp_body);
			$tmp_body.append($tmp_xaxis);
			$tmp_xaxis.append($tmp_tick);
			xaxis_h = Math.max($tmp_xaxis.outerHeight(), $tmp_tick.outerHeight());
			$tmp_body.remove();
			return xaxis_h;
		},

		// Calculate height of the plot title by making a fake title.
		getTitleHeight: function(){
			var $tmp_body = $('<div class="body jqplot-target" style="visibility: hidden; position: absolute; height: 100%;"></div>');
			var $tmp_title = $('<div class="jqplot-title" style="position: absolute;">&nbsp;</div>');
			this.$body_container.append($tmp_body);
			$tmp_body.append($tmp_title);
			title_h = $tmp_title.outerHeight();
			$tmp_body.remove();
			return title_h;
		},

		render: function(){
			var data = this.model.get('data');

			// Do nothing if there is no data.
			if ( ! (data instanceof Array) || (data.length < 1)){
				return;
			}

			// Render empty chart container.
			this.$body_container.html('');
			this.$b = $('<div class="body"></div>');
			this.$body_container.append(this.$b);

			// Set chart height to max of (rows * row height + xaxis_height, parent container height)
			var calculated_height = data.length * this.row_h + this.xaxis_h + this.title_h;
			var chart_height = Math.max(calculated_height, this.$body_container.height() - this.offsets.h);
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
			bar_width = this.row_h * .5;
			this.$b.jqplot(
				series_list,
				{
				title: this.model.get('title'),
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
			return _s.sprintf('<span class="datum-label-container"><span data-category-id="%s" class="datum-label">%s</span></span>', datum.id, datum.label);
		},

		formatQuantityLabel: function(formatString, value){
			return value.toExponential(1);
		},

		onDataChange: function(){
			console.log('chart onDatachange');
			this.render();
		},

		resize: function(){
			this.render();
		}

	});

	return JqPlotChartView;
});
		
