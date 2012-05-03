define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"./chart",
	"./../util/simple_interpreter",
	"text!./templates/bar_chart.html",
	"text!./templates/bar_chart_row.html"
		],
function($, Backbone, _, _s, ChartView, SimpleInterpreter, template, row_template){

	var BarChartView = ChartView.extend({

		initialize: function(opts){

			$(this.el).addClass('chart bar-chart');

			if (! opts.hasOwnProperty('dataInterpreter')){
				this.dataInterpreter = new SimpleInterpreter();
			}
			else{
				this.dataInterpreter = opts.dataInterpreter;
			}

			this.render();

			this.model.get('category_fields').on('change add remove reset', this.onCategoryFieldsChange, this);
			this.model.get('value_fields').on('change', this.onValueFieldsChange, this);
			this.model.get('value_fields').on('add remove reset', this.onValueFieldsAddRemove, this);
			this.model.on('change:data', this.onDataChange, this);
		},

		render: function(){
			$(this.el).html(_.template(template));
		},

		renderData: function(){
			$container = $('.chart-image', this.el);
			$container.html('');

			var vf = this.model.get('value_fields').models[0];
			this.vmin = vf.get('min');
			this.vmax = vf.get('max');

			if ((this.vmin == null) || (this.vmax == null)){
				return;
			}

			this.vrange = this.vmax - this.vmin;
			var zero_pos = (0 - this.vmin)/this.vrange * 100;

			_.each(this.model.get('data'), function(datum){
				var value = parseFloat(datum.data[0].value);
				var width = 'width: 0;';
				var visibility = 'visibility: hidden;';
				var position = '';
				var should_draw = false;

				// Zero is off-plot, to the left.
				if (this.vmin >= 0){
					if (value > this.vmin){
						should_draw = true;
					}
				}
				// Zero is in the plot.
				else if (this.vmin <= 0  && this.vmax >= 0){
					should_draw = true;
				}
				// Zero is off-plot, to the right.
				else if (this.vmax <= 0){
					if (value <= this.vmax){
						should_draw = true;
					}
				}

				if (should_draw){
					visibility = 'visibility: visible;';

					if (value > 0){
						var left = Math.max(this.vmin, 0);
						width = _s.sprintf('width: %.1f%%;', (value - left)/this.vrange * 100);
						position = _s.sprintf('left: %.1f%%;', (left - this.vmin)/this.vrange * 100);
					}
					else{
						var right = Math.min(this.vmax, 0);
						width = _s.sprintf('width: %.1f%%;', (right - value)/this.vrange * 100);
						position = _s.sprintf('right: %.1f%%;', 100 - (right - this.vmin)/this.vrange * 100);
					}
				}

				$row = $(_.template(row_template, {
					//'label': datum.label,
					'label': value,
					'visibility': visibility,
					'width': width,
					'position': position
				}));
				$container.append($row);

			}, this);

			this.renderGrid();
		},

		renderGrid: function(){
			var $grid = $('.chart-grid', this.el);
			$grid.html('');

			// Explicilty resize grid because scrollbars alter the chart width.
			var image_margin = $('.chart-image-wrapper', this.el).width() - $('.chart-image', this.el).width();
			$('.chart-grid-wrapper .inner', this.el).css('marginRight', image_margin);

			_.each(this.model.get('grid_line_positions'), function(pos){
				var label = _s.sprintf("%.1f", this.vmin + pos * this.vrange);
				var $grid_line = $(_s.sprintf('<div class="line" style="right: %.1f%%;"><div class="label">%s</div></div>', (1 - pos) * 100, label ));
				$grid.append($grid_line);
			}, this);
		},

		onCategoryFieldsChange: function(){
			this.fetchData();
		},

		onValueFieldsChange: function(){
			this.renderData();
		},

		onValueFieldsAddRemove: function(){
			this.fetchData();
		},

		onDataChange: function(){
			this.renderData();
		},

		fetchData: function(){
			var datasource = this.model.get('datasource');
			var _this = this;
			var query = {};
			datasource.getData({
				'query': query,
				success: function(data, status, xhr){
					_this.model.set({'data': _this.dataInterpreter.parse(data)});
				},
				error: function(xhr, status, error){
				}
			});
		}

	});

	return BarChartView;
});
		
