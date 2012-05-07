define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./single_field_selector",
	"./value_field",
	"text!./templates/chart_editor.html"
		],
function($, Backbone, _, ui, _s, SingleFieldSelectorView, ValueFieldView, template){

	var ChartEditorView = Backbone.View.extend({

		events: {
		},

		initialize: function(){
			$(this.el).addClass('chart-editor');
			this.render();
		},

		render: function(){
			$(this.el).html(_.template(template, {}));

			// Add the chart.
			$('.chart-wrapper', this.el).append(this.model.get('chart').el);

			schema = this.model.get('chart').model.get('datasource').get('schema');

			this.left_panel_el = $('.left.panel', this.el);
			this.right_panel_el = $('.right.panel', this.el);

			// Make left panel resizable.
			var _this = this;
			$(this.left_panel_el).resizable({
				minWidth: $(_this.left_panel_el).css('minWidth'),
				handles: 'e',
				stop: function(event, ui) {
					$(_this.left_panel_el).css('height', '100%');
					_this.resizeRightPanel();
				},
				resize: function(event, ui){
					this.setRightPanelLeftEdge();
				}
			});

			//  Add category field selector.
			var category_field_model = new Backbone.Model({
				field_definitions: schema.get('category_fields')
			});
			var category_field_selector = new SingleFieldSelectorView({
				el: $('.category-field', this.el),
				model: category_field_model
			});

			//  Add value field selector.
			var value_field_model = new Backbone.Model({
				field_definitions: schema.get('value_fields')
			});
			var value_field_selector = new SingleFieldSelectorView({
				el: $('.value-field', this.el),
				model: value_field_model,
				fieldViewClass: ValueFieldView
			});

			// Change the chart fields when the field selectors change.
			category_field_model.on('change:selected_field', function(e){
				this.model.get('chart').model.setCategoryFields([category_field_model.get('selected_field')]);
			}, this);
			value_field_model.on('change:selected_field', function(e){
				this.model.get('chart').model.setValueFields([value_field_model.get('selected_field')]);
			}, this);

			// Set the initial default fields.
			var category_fields = schema.get('category_fields');
			if (category_fields && category_fields.length > 0){
				category_field_selector.setSelectedField(category_fields[0].id);
			}
			var value_fields = schema.get('value_fields');
			if (value_fields && value_fields.length > 0){
				value_field_selector.setSelectedField(value_fields[0].id);
			}

		},

		getBounds: function(el){
			var pos = $(el).position();
			var width = $(el).outerWidth(true);
			var height = $(el).outerHeight(true);
			return {
				top: pos.top, 
				right: pos.left + width, 
				bottom: pos.top + height, 
				left: pos.left,
				width: width,
				height: height
			};
		},

		resize: function(){
			// Resize inner container.
			var inner_el = $(this.el).children('.inner');
			var container = inner_el.parent();
			var totalHeight = container.height();
			inner_el.css('height', totalHeight);

			// Resize panels.
			this.resizeLeftPanel();
			this.resizeRightPanel();
		},

		resizeLeftPanel: function() {
			var el = this.left_panel_el;
			this.fillContainerHeight(el);

			var inner_el = $(this.el).children('.inner');
			var container = inner_el.parent();
			var totalHeight = container.height();

		},

		resizeRightPanel: function() {
			var el = this.right_panel_el
			this.fillContainerHeight(el);

			this.setRightPanelLeftEdge();

			var container = el.parent();
			var totalWidth = container.width();
			var left_panel_width = $(this.left_panel_el).width();
			el.css('width', totalWidth - left_panel_width);
		},

		setRightPanelLeftEdge: function(){
			var left_panel_bounds = this.getBounds(this.left_panel_el);
			$(this.right_panel_el).css('left', left_panel_bounds.right);
		},

		fillContainerHeight: function(el){
			var container = $(el).parent();
			$(el).css('height', container.height());
		},

	});

	return ChartEditorView;
});
		
