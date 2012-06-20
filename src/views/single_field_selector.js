define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./categorical_category_field",
	"./numeric_category_field",
	"./numeric_quantity_field",
	"text!./templates/single_field_selector.html"
		],
function($, Backbone, _, ui, _s, CategoricalCategoryFieldView, NumericCategoryFieldView, NumericQuantityFieldView, template){

	var SingleFieldSelectorView = Backbone.View.extend({

		events: {
			'change .field-picker-select': 'onFieldSelectChange'
		},

		initialize: function(opts){
			$(this.el).addClass('field-selector single-field-selector');
			this.field_registry = {};
			this.render();
			this.model.on("change:selected_field", this.onChangeSelectedField, this);
		},

		render: function(){
			this.clearFields();
			$(this.el).html(_.template(template));
			_.each(this.model.get('fields').models, function(field_model){
				this.addField(field_model);
			}, this);
		},

		addField: function(field_model){
			if (! this.field_registry.hasOwnProperty(field_model.cid)){

				var field_option = $(_s.sprintf('<option value="%s">%s</option>', field_model.cid, field_model.get('label')));
				$('.field-picker-select', this.el).append(field_option);

				var field_view = this.getFieldView(field_model);
				$('.field-options', this.el).append(field_view.el);

				this.field_registry[field_model.cid] = {
					'cid': field_model.cid,
					'option': field_option,
					'model': field_model,
					'view': field_view
				};
			}
		},

		getFieldView: function(field_model){
			var field_type = field_model.get('field_type');
			var value_type = field_model.get('value_type');

			var fieldViewClass;
			if (field_type == 'quantity'){
				if (value_type == 'numeric'){
					fieldViewClass = NumericQuantityFieldView;
				}
			}
			else if (field_type == 'category'){
				if (value_type == 'categorical'){
					fieldViewClass = CategoricalCategoryFieldView;
				}
				else if (value_type == 'numeric'){
					fieldViewClass = NumericCategoryFieldView;
				}
			}

			return new fieldViewClass({
				model: field_model
			});
		},

		clearFields: function(){
			_.each(this.field_registry, function(field){
				this.removeField(field);
			}, this);
		},

		removeField: function(field){
			if (this.field_registry.hasOwnProperty(field.model.cid)){
				field.option.remove();
				field.view.remove();
				delete this.field_registry[field.model.cid];
			}
		},

		onFieldSelectChange: function(e){
			if (! this.selectInitialized){
				$('.field-picker-select option:first', this.el).remove();
				this.selectInitialized = true;
			}
			if (this.model.get('selected_field')){
				var previously_selected_cid = this.model.get('selected_field').cid;
				$(this.field_registry[previously_selected_cid].view.el).removeClass('selected');
			}
			var selected_cid = $('.field-picker-select option:selected', this.el).val();
			var selected_field_view = this.field_registry[selected_cid].view;
			$(selected_field_view.el).addClass('selected');
			this.model.set({'selected_field': this.field_registry[selected_cid].model});
		},

		onChangeSelectedField: function(){
			this.setSelectedField(this.model.get('selected_field').cid);
		},

		setSelectedField: function(cid){
			$('.field-picker-select', this.el).val(cid).change();
		}

	});

	return SingleFieldSelectorView;
});
		
