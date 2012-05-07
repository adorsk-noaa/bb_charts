define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./chart",
	"./../util/simple_interpreter",
	"text!./templates/bar_chart.html",
	"text!./templates/bar_chart_row.html"
		],
function($, Backbone, _, ui, _s, ChartView, SimpleInterpreter, template, row_template){

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
			this.model.on('change:query', function(){console.log('query change')});
		},

		render: function(){
			$(this.el).html(_.template(template));
		},

		renderData: function(){
			$container = $('.chart-image', this.el);
			$container.html('');
	
			var value_fields = this.model.get('value_fields');
			if ( (! value_fields) || (value_fields.models.length <= 0) ){
				return;
			}

			var data = this.model.get('data');
			if (! data){
				return;
			}

			console.log('data is', data);

			var value_field = value_fields.models[0];
			this.vmin = value_field.get('min');
			this.vmax = value_field.get('max');

			if ((this.vmin == null) || (this.vmax == null)){
				return;
			}

			// Parse max/min parameters, and set to match data if 'auto'.
			_.each([
					{key:'vmin', func: _.min}, 
					{key:'vmax', func: _.max}
					],
					function(parameter){
						if (this[parameter.key] == 'auto'){
							var item = parameter.func(data, function(d){
								return d.data[0].value;
							});
							this[parameter.key]  = item.data[0].value;
						}
						this[parameter.key] = parseFloat(this[parameter.key]);
					},this);

			this.vrange = this.vmax - this.vmin;
			var zero_pos = (0 - this.vmin)/this.vrange * 100;

			_.each(data, function(datum){
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
						width = _s.sprintf('width: %.1f%%;', (Math.min(value, this.vmax) - left)/this.vrange * 100);
						position = _s.sprintf('left: %.1f%%;', (left - this.vmin)/this.vrange * 100);
					}
					else{
						var right = Math.min(this.vmax, 0);
						width = _s.sprintf('width: %.1f%%;', (right - Math.max(value, this.vmin))/this.vrange * 100);
						position = _s.sprintf('right: %.1f%%;', 100 - (right - this.vmin)/this.vrange * 100);
					}
				}

				$row = $(_.template(row_template, {
					'label': datum.label,
					'visibility': visibility,
					'width': width,
					'position': position,
					'value': value,
					'percent_of_selected': 12.3,
					'percent_of_total': 87.3
				}));
				$container.append($row);

			}, this);

			this.renderAxis();
			//this.renderGrid();
		},

		renderAxis: function(){
			var $axis = $('.chart-axis', this.el);
			$axis.html('');

			// Explicilty resize because scrollbars alter the chart width.
			var image_margin = $('.chart-image-wrapper', this.el).width() - $('.chart-image', this.el).width();
			$('.chart-axis-wrapper .inner', this.el).css('marginRight', image_margin);

			var minmax = [
				{
					name: 'min',
					pos: 0,
					value: this.vmin
				},
				{
					name: 'max',
					pos: 100,
					value: this.vmax
				},
			];
			_.each(minmax, function(m){
				var $el = $(_s.sprintf('<div class="axis-input-wrapper" style="right: %.1f%%;"><input class="axis-input %s" value="%s"/></div>', (1 - m.pos) * 100, m.name, m.value));
				$axis.append($el);
			}, this);
		},

		renderGrid: function(){
			var $grid = $('.chart-grid', this.el);
			$grid.html('');

			// Explicilty resize grid because scrollbars alter the chart width.
			var image_margin = $('.chart-image-wrapper', this.el).width() - $('.chart-image', this.el).width();
			$('.chart-grid-wrapper .inner', this.el).css('marginRight', image_margin);

			_.each(this.model.get('grid_line_positions'), function(pos){
				var value = this.vmin + pos * this.vrange; 
				var label = this.formatGridLabel(value);
				var $grid_line = $(_s.sprintf('<div class="line" style="right: %.1f%%;"><div class="label">%s</div></div>', (1 - pos) * 100, label ));
				$grid.append($grid_line);
			}, this);
		},

		formatGridLabel: function(value){
			return value.toExponential(1);
		},

		onCategoryFieldsChange: function(){
			this.updateDataQuery();
		},

		onValueFieldsChange: function(){
			this.renderData();
		},

		onValueFieldsAddRemove: function(){
			this.updateDataQuery();
		},

		onDataChange: function(){
			this.renderData();
		},

		updateDataQuery: function(){
			var query = this.model.get('query') || {};

			// @TODO
			// BELOW IS A BIT HACKY (ID vs. FIELD_ID).
			// REWORK LATER.

			// Set grouping fields.
			var category_fields = this.model.get('category_fields');
			if (category_fields && category_fields.models.length > 0){
				var category_field = category_fields.models[0].toJSON();
				category_field['id'] = category_field['field_id'];
				query['GROUPING_FIELDS'] = [category_field];
			}

			// Set value fields.
			var value_fields = this.model.get('value_fields');
			if (value_fields && value_fields.models.length > 0){
				var value_field = value_fields.models[0].toJSON();
				value_field['id'] = value_field['field_id'];
				query['VALUE_FIELDS'] = [value_field];
			}

			// Set filters.
			query['FILTERS'] = this.model.get('filters');
			this.model.set('query', query);

			this.fetchData();

		},

		fetchData: function(){
			var datasource = this.model.get('datasource');
			var _this = this;
			var query = this.model.get('query');

			if (! query || ! query.hasOwnProperty('VALUE_FIELDS')){
				return;
			}
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
		
