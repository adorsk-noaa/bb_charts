define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./categorical_category_field",
	"./numerical_quantity_field",
	"text!./templates/single_field_selector.html"
		],
function($, Backbone, _, ui, _s, CategoricalCategoryFieldView, NumericalQuantityFieldView, template){

	var SingleFieldSelectorView = Backbone.View.extend({

		events: {
			'change .field-picker-select': 'onFieldSelectChange'
		},

		initialize: function(opts){
			$(this.el).addClass('field-selector single-field-selector');
			this.rendered_field_definitions = {};

			this.render();
		},

		render: function(){
			this.clearFieldDefinitions();
			$(this.el).html(_.template(template));
			_.each(this.model.get('field_definitions'), function(field_definition){
				this.addFieldDefinition(field_definition);
			}, this);
		},

		addFieldDefinition: function(field_definition){
			if (! this.rendered_field_definitions.hasOwnProperty(field_definition['field_id'])){

				var field_option = $(_s.sprintf('<option value="%s">%s</option>', field_definition['field_id'], field_definition['label']));
				$('.field-picker-select', this.el).append(field_option);

				var field_model = new Backbone.Model(field_definition);

				var field_view = this.getFieldView(field_model);
				$('.field-options', this.el).append(field_view.el);

				this.rendered_field_definitions[field_definition['field_id']] = {
					'field_id': field_definition['field_id'],
					'option': field_option,
					'model': field_model,
					'view': field_view
				};
			}
		},

		removeFieldDefinition: function(field_definition){
			if (this.rendered_fields.hasOwnProperty(field_definition['field_id'])){
				rendered_field_definition.option.remove();
				rendered_field_definition.view.remove();
				rendered_field_definition.model = null;
				delete this.rendered_field_definitions[field_definition['field_id']];
			}
		},

		getFieldView: function(field_model){
			var field_type = field_model.get('field_type');
			var value_type = field_model.get('value_type');

			var fieldViewClass;
			if (field_type == 'quantity'){
				if (value_type == 'numerical'){
					fieldViewClass = NumericalQuantityFieldView;
				}
			}
			else if (field_type == 'category'){
				if (value_type == 'categorical'){
					fieldViewClass = CategoricalCategoryFieldView;
				}
			}

			return new fieldViewClass({
				model: field_model
			});
		},

		clearFieldDefinitions: function(){
			_.each(this.rendered_field_definitions, function(rendered_field_definition){
				this.removeFieldDefinition(rendered_field_definition);
			}, this);
		},

		onFieldSelectChange: function(e){
			if (this.model.get('selected_field')){
				var previously_selected_id = this.model.get('selected_field').get('field_id');
				$(this.rendered_field_definitions[previously_selected_id].view.el).removeClass('selected');
			}
			var selected_field_id = $('.field-picker-select option:selected', this.el).val();
			var selected_field_view = this.rendered_field_definitions[selected_field_id].view;
			$(selected_field_view.el).addClass('selected');
			this.model.set({'selected_field': this.rendered_field_definitions[selected_field_id].model});
		},

		setSelectedField: function(field_id){
			$('.field-picker-select', this.el).val(field_id).change();
		}

	});

	return SingleFieldSelectorView;
});
		
