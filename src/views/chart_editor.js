define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./single_field_selector",
	"./quantity_field",
	"./raw_chart",
	"./jqplot_chart",
	"text!./templates/chart_editor.html"
		],
function($, Backbone, _, ui, _s, SingleFieldSelectorView, QuantityFieldView, RawChartView, JqplotChartView, template){

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
			this.model.get('category_field').on('change:selected_field', this.onCategoryFieldChange, this);
			this.model.get('quantity_field').on('change:selected_field', this.onQuantityFieldChange, this);
			
		},

		render: function(){
			$(this.el).html(_.template(template, {}));

			this.$table = $(this.el).children('table.body');
			this.$cfc = $('.category-field-container', this.el);
			this.$qfc = $('.quantity-field-container', this.el);
			this.$loading_animation = $('.loading-animation', this.el);

			var ds = this.model.get('datasource');
			var schema = ds.get('schema');

			// Add category field selector.
			var category_field_model = new Backbone.Model({
				field_definitions: schema.get('category_fields')
			});
			this.model.set('category_field', category_field_model);

			var category_field_selector = new SingleFieldSelectorView({
				el: $('.category-field', this.el),
				model: category_field_model
			});
			
			// Add value field selector.
			var quantity_field_model = new Backbone.Model({
			field_definitions: schema.get('quantity_fields')
			});
			this.model.set('quantity_field', quantity_field_model);
			var quantity_field_selector = new SingleFieldSelectorView({
				el: $('.quantity-field', this.el),
				model: quantity_field_model,
				fieldViewClass: QuantityFieldView
			});

			// Add chart view.
			this.chart_view = new JqplotChartView({
				el: $('.chart', this.el),
				model: this.model.get('chart')
			});
		},

		resize: function(){
			var $c = this.$table.parent();
			this.$table.css('width', $c.css('width'));
			this.$table.css('height', $c.css('height'));
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

		expandContractQuantityField: function(opts){
			var _this = this;
			var expand = opts.expand;
			var delta = parseInt(this.$qfc.css('maxHeight'),10) - parseInt(this.$cfc.css('minHeight'),10);
			if (! expand){
				delta = -1 * delta;
			}

			this.$cfc.addClass('changing');
			this.$cfc.animate(
					{
						width: parseInt(this.$cfc.css('width'),10) + delta
					},
					{
						complete: function(){
							_this.$cfc.removeClass('changing');
							if (expand){
								_this.$cfc.addClass('expanded')
							}
							else{
								_this.$cfc.removeClass('expanded')
							}
						}
					}
			);
			this.$table.animate(
					{
						width: parseInt(this.$table.css('width'),10) + delta
					}
			);

			var expand = opts.expand;
			var $qfc_el = $('.quantity-field-container', this.el);
			var $qfb_el = $('.body-container', $qfc_el);
			var $bc_el = $(this.el).children('.body-container');
			var height_attr = (expand) ? 'maxHeight' : 'minHeight';

			var original_height = parseInt($qfb_el.css('height'),10);
			var delta = parseInt($qfb_el.css('maxHeight'),10) - parseInt($qfb_el.css('minHeight'),10);
			if (! expand){
				delta = -1 * delta;
			}
			var target_height = original_height + delta;
			var target_scrolltop = $bc_el.scrollTop() + delta;

			$qfb_el.addClass('changing');
			$qfb_el.animate(
					{
						height: $qfb_el.css(height_attr)
					},
					{
						complete: function(){
							$qfb_el.removeClass('changing');
							if (expand){
								$qfc_el.addClass('expanded')
							}
							else{
								$qfc_el.removeClass('expanded')
							}
						}
					}
			);

			$bc_el.animate({
				scrollTop: target_scrolltop
			});
			
		},

		onCategoryFieldChange: function(){
			this.selected_category_field = this.model.get('category_field').get('selected_field');
			$('.category-field-name', this.el).html(this.selected_category_field.get('label'));
			this.updateChartTitle();
			this.updateDatasourceQuery();
		},

		onQuantityFieldChange: function(){
			this.selected_quantity_field = this.model.get('quantity_field').get('selected_field');
			$('.quantity-field-name', this.el).html(this.selected_quantity_field.get('label'));
			this.updateChartTitle();
			this.updateDatasourceQuery();
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
			var category_field = this.model.get('category_field').get('selected_field');
			var quantity_field = this.model.get('quantity_field').get('selected_field');
			var q = this.model.get('datasource').get('query');

			q.set({
				'GROUPING_FIELDS': (category_field) ? [category_field] : [],
				'VALUE_FIELDS': (quantity_field) ? [quantity_field] : []
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
			this.model.get('chart').set('data', this.model.get('datasource').get('data'));
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
		}

	});

	return ChartEditorView;
});
		
