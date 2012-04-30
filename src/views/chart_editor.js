define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"Dialogs",
	"./category_field_picker_dialog",
	"./value_field_picker_dialog",
	"text!./templates/chart_editor.html"
		],
function($, Backbone, _, ui, _s, Dialogs, CategoryFieldPickerDialogView, ValueFieldPickerDialogView, chart_editor_template){

	var ChartEditorView = Backbone.View.extend({

		events: {
			'click .add-category-field-button': 'onAddCategoryFieldButtonClick',
			'click .add-value-field-button': 'onAddValueFieldButtonClick'
		},

		initialize: function(){
			this.render();
			$(this.el).addClass('chart-editor');

			this.model.get('category_fields').on('add remove change', this.onCategoryFieldsChange, this);
			this.model.get('value_fields').on('add remove', this.onValueFieldsChange, this);
			this.model.on('change:data', this.onDataChange, this);
		},

		render: function(){
			schema = this.model.get('datasource').get('schema');

			$(this.el).html(_.template(chart_editor_template, {}));

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

			var cfpd_el = $('<div style="display: none;"></div>');
			$('body').append(cfpd_el);
			this.category_field_picker_dialog = new CategoryFieldPickerDialogView({
				el: cfpd_el,
				model: new Backbone.Model({
					chart: this.model,
					title: 'Add category field',
					zIndex: 0,
					fields: this.model.get('datasource').get('schema').get('category_fields')
				}),
			});

			var vfpd_el = $('<div style="display: none;"></div>');
			$('body').append(vfpd_el);
			this.value_field_picker_dialog = new ValueFieldPickerDialogView({
				el: vfpd_el,
				model: new Backbone.Model({
					chart: this.model,
					title: 'Add value field',
					zIndex: 0,
					fields: this.model.get('datasource').get('schema').get('value_fields')
				}),
			});
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

		onAddCategoryFieldButtonClick: function(){
			this.category_field_picker_dialog.show();
		},

		onCategoryFieldsChange: function(){
			this.renderCategoryFields();
			this.fetchData();
		},

		renderCategoryFields: function(){
			$('.category-fields', this.el).html(JSON.stringify(this.model.get('category_fields').toJSON()));
		},

		onAddValueFieldButtonClick: function(){
			this.value_field_picker_dialog.show();
		},

		onValueFieldsChange: function(){
			this.renderValueFields();
			this.fetchData();
		},

		renderValueFields: function(){
			$('.value-fields', this.el).html(JSON.stringify(this.model.get('value_fields').toJSON()));
		},

		fetchData: function(){
			console.log('fetch data');
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
		},

		onDataChange: function(){
			console.log('onDataChange');
			this.renderData();
		},

		renderData: function(){
			$('.chart', this.el).html('');
			if (! this.model.get('value_fields')){
				return;
			}

			var value_fields = this.model.get('value_fields');
			var vf = value_fields.models.pop();
			var min = vf.get('min');
			var max = vf.get('max');
			var range = max - min;
			var zero_pos = (0 - min)/range;

			_.each(this.model.get('data'), function(datum){
				var datum_pos  = (datum - min)/range * 100;
				if ( datum_pos < zero_pos ){
					var datum_el = $(_s.sprintf("<div class=\"bar\" style=\"width: %.1f%%; position: relative; right: 0px;\"></div>", zero_pos - datum_pos));
				}
				else{
					var datum_el = $(_s.sprintf("<div class=\"bar\" style=\"width: %.1f%%\"></div>", datum_pos - zero_pos));
				}

				$(datum_el).css('height', 10);
				$(datum.el).css('border', 'thin solid black');

				$('.chart', this.el).append(datum_el);

			}, this);
		}


	});

	return ChartEditorView;
});
		
