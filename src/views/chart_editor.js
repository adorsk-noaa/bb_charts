define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"Util",
	"./single_field_selector",
	"./quantity_field",
	"./raw_chart",
	"./jqplot_chart",
	"text!./templates/chart_editor.html"
		],
function($, Backbone, _, ui, _s, Util, SingleFieldSelectorView, QuantityFieldView, RawChartView, JqplotChartView, template){

	var ChartEditorView = Backbone.View.extend({

		events: {
			'click .category-field-container .title': 'toggleCategoryField',
			'click .quantity-field-container .title': 'toggleQuantityField'
		},

		initialize: function(opts){
			$(this.el).addClass('chart-editor');
			this.render();
			this.showInstructions();
			this.resize();
			this.resizeStop();

			var ds = this.model.get('datasource');
			var schema = ds.get('schema');

			// Fetch new data when the datasource query changes.
			ds.get('query').on('change', this.onDatasourceQueryChange, this);
			
			// Handle changes in datasource data.
			ds.on('change:data', this.onDatasourceDataChange, this);

			// Handle datasource loading events.
			ds.on('change:loading', this.onDatasourceLoadingChange, this);
			
			// Change the datasource query when the field selectors change.
			this.category_field_selector.model.on('change:selected_field', this.onSelectedCategoryFieldChange, this);
			this.quantity_field_selector.model.on('change:selected_field', this.onSelectedQuantityFieldChange, this);

			// Update the quantity field when the chart min/max attributes change.
			this.model.get('chart').on('change:bounds', this.onChartBoundsChange, this);

			// Listen for the ready event.
			this.on('ready', this.onReady, this);
			
		},

		render: function(){
			$(this.el).html(_.template(template, {}));

			this.$table = $(this.el).children('table.body');
			this.$cfc = $('.category-field-container', this.el);
			this.$qfc = $('.quantity-field-container', this.el);
			this.$loading_animation = $('.loading-animation', this.el);

			var ds = this.model.get('datasource');
			var schema = ds.get('schema');

			this.category_field_selector = new SingleFieldSelectorView({
				el: $('.category-field', this.el),
				model: new Backbone.Model({
					fields: schema.get('category_fields'),
					selected_field: null
				})
			});

			this.quantity_field_selector = new SingleFieldSelectorView({
				el: $('.quantity-field', this.el),
				model: new Backbone.Model({
					fields: schema.get('quantity_fields'),
					selected_field: null
				})
			});

			// Add chart view.
			this.chart_view = new JqplotChartView({
				el: $('.chart', this.el),
				model: this.model.get('chart')
			});
		},

		resize: function(){
			Util.util.fillParent(this.$table);
			this.resizeVerticalTab();
		},

		resizeStop: function(){
			this.resizeChart();
			this.resizeLoadingAnimation();
		},

		resizeVerticalTab: function(){
			var $rc = $('.rotate-container', this.el);
			$rc.css('width', $rc.parent().height());
			$rc.css('height', $rc.parent().width());
		},

		resizeChart: function(){
			this.chart_view.resize();
		},

		resizeLoadingAnimation: function(){
			var $container = this.$loading_animation.parent();	
			this.$loading_animation.css('left', $container.width()/2 - this.$loading_animation.width()/2);
			this.$loading_animation.css('top', $container.height()/2 - this.$loading_animation.height()/2);
		},

		toggleCategoryField: function(){
			if (! this.$cfc.hasClass('changing')){
				this.expandContractFieldContainer({
					expand: ! this.$cfc.hasClass('expanded'),
					field_container: this.$cfc,
					dimension: 'width'
				});
			}
		},

		toggleQuantityField: function(){
			if (! this.$qfc.hasClass('changing')){
				this.expandContractFieldContainer({
					expand: ! this.$qfc.hasClass('expanded'),
					field_container: this.$qfc,
					dimension: 'height'
				});
			}
		},

		expandContractFieldContainer: function(opts){
			var _this = this;
			var expand = opts.expand;
			var $fc = opts.field_container;
			var dim = opts.dimension;

			// Calculate how much to change dimension.
			var delta = parseInt($fc.css('max' + _s.capitalize(dim)), 10) - parseInt($fc.css('min' + _s.capitalize(dim)), 10);
			if (! expand){
				delta = -1 * delta;
			}

			// Animate field container dimension.
			$fc.addClass('changing');

			// Toggle button text
			var button_text = ($('button.toggle', $fc).html() == '\u25B2') ? '\u25BC' : '\u25B2';
			$('button.toggle', $fc).html(button_text);

			// Execute the animation.
			var fc_dim_opts = {};
			fc_dim_opts[dim] = parseInt($fc.css(dim),10) + delta;
			$fc.animate(
					fc_dim_opts,
					{
						complete: function(){
							$fc.removeClass('changing');

							if (expand){
								$fc.addClass('expanded')
							}
							else{
								$fc.removeClass('expanded')
								_this.resize();
								_this.resizeStop();
							}
						}
					}
			);

			// Animate cell dimension.
			$fc.parent().animate(fc_dim_opts);
			

			// Animate table dimension.
			var table_dim_opts = {};
			table_dim_opts[dim] = parseInt(this.$table.css(dim),10) + delta;
			this.$table.animate(table_dim_opts);
		},


		onSelectedCategoryFieldChange: function(){
			if (this.selected_category_field){
				this.disconnectCategoryField(this.selected_category_field);
			}
			this.selected_category_field = this.category_field_selector.model.get('selected_field');
			this.connectCategoryField(this.selected_category_field);
			$('.category-field-name', this.el).html(this.selected_category_field.get('label'));
			this.updateChartTitle();
			this.updateDatasourceQuery();
		},

		onSelectedQuantityFieldChange: function(){
			if (this.selected_quantity_field){
				this.disconnectQuantityField(this.selected_quantity_field);
			}
			this.selected_quantity_field = this.quantity_field_selector.model.get('selected_field');
			this.connectQuantityField(this.selected_quantity_field);
			$('.quantity-field-name', this.el).html(this.selected_quantity_field.get('label'));
			this.updateChartTitle();
			this.updateDatasourceQuery();
		},

		connectCategoryField: function(field){
			field.on('change', this.onCategoryFieldChange, this);
		},

		disconnectCategoryField: function(field){
			field.off(null, null, this);
		},

		onCategoryFieldChange: function(){
			this.updateDatasourceQuery();
		},

		connectQuantityField: function(field){
			field.on('change', this.onQuantityFieldChange, this);
		},

		disconnectQuantityField: function(field){
			field.off(null, null, this);
		},

		onQuantityFieldChange: function(){
			this.updateChartBounds();
		},

		updateChartBounds: function(){
			var set_data = {};
			_.each(['min', 'max'], function(minmax){
				set_data[minmax] = this.selected_quantity_field.get('entity').get(minmax);
				set_data[minmax + 'auto'] = this.selected_quantity_field.get('entity').get(minmax + 'auto');
			}, this);

			this.model.get('chart').set(set_data);
		},

		onChartBoundsChange: function(m, e){
			// Update quantity field to match chart bounds.
			var set_data = {};
			_.each(['min', 'max'], function(minmax){
				set_data[minmax] = this.model.get('chart').get(minmax);
			}, this);

			this.selected_quantity_field.get('entity').set(set_data);
		},

		updateChartTitle: function(){
			if (this.selected_category_field && this.selected_quantity_field){
				var chart_title = _s.sprintf('%s, by %s', 
						this.selected_quantity_field.get('label'),
						this.selected_category_field.get('label')
						);
				this.model.get('chart').set('title', chart_title);
			}
		},


		updateDatasourceQuery: function(){
			var q = this.model.get('datasource').get('query');

			var grouping_entity;
			if (this.selected_category_field){
				grouping_entity = this.selected_category_field.get('entity').toJSON();
				// If minauto or maxauto is enabled, don't send min/max.
				_.each(['min', 'max'], function(minmax){
					if (grouping_entity[minmax + 'auto']){
						delete grouping_entity[minmax];
					}
				}, this);
			}

			var data_entity;
			if (this.selected_quantity_field){
				data_entity =this.selected_quantity_field.get('entity').toJSON();
			}

			q.set({
				'grouping_entities': (grouping_entity) ? [grouping_entity] : [],
				'data_entities': (data_entity) ? [data_entity] : []
			});

		},

		onDatasourceQueryChange: function(){
			var ds = this.model.get('datasource');
			if (this.selected_category_field && this.selected_quantity_field){
				this.showChart();
				ds.set('loading', true);
				ds.getData();
			}
			else{
				this.showInstructions();
			}
		},


		onDatasourceDataChange: function(){
			// Update the chart's data.
			var data = this.model.get('datasource').get('data');
			this.model.get('chart').set('data', data);
			
			// If currently selected category field is numeric, update is min/max.
			if (this.selected_category_field && this.selected_category_field.get('value_type') == 'numeric'){

				// Get min/max from data.
				if (data.length > 1){
					var dmin = data[0].min;
					var dmax = data[data.length - 1].min;

					// Update category field min/max.
					this.disconnectCategoryField(this.selected_category_field);
					this.selected_category_field.get('entity').set({
						min: dmin,
						max: dmax
					});
					this.connectCategoryField(this.selected_category_field);
				}
			}

		},

		onDatasourceLoadingChange: function(){
			var loading = this.model.get('datasource').get('loading');
			var _this = this;
			if (loading){
				this.$loading_animation.fadeIn(400);
			}
			else{
				this.$loading_animation.fadeOut(800);
			}
		},

		showInstructions: function(){
			$('.chart-container > .chart',  this.el).css('visibility', 'hidden');
			$('.chart-container > .instructions',  this.el).css('visibility', 'visible');
		},

		showChart: function(){
			$('.chart-container > .chart',  this.el).css('visibility', 'visible');
			$('.chart-container > .instructions',  this.el).css('visibility', 'hidden');
		},

		onReady: function(){
			this.chart_view.trigger('ready');
		},

		activate: function(){
		},

		deactivate: function(){
		},

	});

	return ChartEditorView;
});
		
