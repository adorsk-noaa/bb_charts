define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"./chart",
	"text!./templates/bar_chart.html"
		],
function($, Backbone, _, _s, ChartView, template){

	var BarChartView = ChartView.extend({

		initialize: function(){

			$(this.el).addClass('chart bar-chart');
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
			var $container = $('.chart-image', this.el);
			$container.html('');

			var vf = this.model.get('value_fields').models[0];
			this.vmin = vf.get('min');
			this.vmax = vf.get('max');

			if ((this.vmin == null) || (this.vmax == null)){
				return;
			}

			this.vrange = this.vmax - this.vmin;
			var zero_pos = (0 - this.vmin)/this.vrange;

			_.each(this.model.get('data'), function(datum){
				var datum_pos  = (datum - this.vmin)/this.vrange * 100;
				var left = 0;
				var right = 0;
				if ( datum_pos < zero_pos ){
					left = datum_pos;
					right = 100 - zero_pos;
				}
				else{
					left = zero_pos;
					right = 100 - datum_pos;
				}
				var datum_el = $(_s.sprintf("<div class=\"bar\" style=\"margin-left: %.1f%%; margin-right: %.1f%%\"></div>", left, right));

				$(datum_el).css('height', 10);
				$(datum.el).css('border', 'thin solid black');

				$container.append(datum_el);

			}, this);
			
			this.renderGrid();
		},

		renderGrid: function(){

			var $container = $('.chart-image', this.el);
			_.each(this.model.get('grid_line_positions'), function(pos){
				var label = _s.sprintf("%.1f", this.vmin + pos * this.vrange);
				var $grid_line = $(_s.sprintf('<div class="grid-line" style="right: %.1f%%;"><div class="label">%s</div></div>', (1 - pos) * 100, label ));
				$container.append($grid_line);
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
					_this.model.set({'data': data});
				},
				error: function(xhr, status, error){
				}
			});
		}

	});

	return BarChartView;
});
		
