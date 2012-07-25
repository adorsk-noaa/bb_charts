define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"Util",
	"./categorical_category_field",
	"./numeric_category_field",
	"./numeric_quantity_field",
	"text!./templates/single_field_selector.html"
		],
function($, Backbone, _, ui, _s, Util, CategoricalCategoryFieldView, NumericCategoryFieldView, NumericQuantityFieldView, template){

	var SingleFieldSelectorView = Backbone.View.extend({

		events: {
			'change .field-picker-select': 'onFieldSelectChange'
		},

		initialize: function(opts){
			$(this.el).addClass('field-selector single-field-selector');
			this.field_registry = {};
            this.initialRender();
			this.model.on("change:selected_field", this.onChangeSelectedField, this);
		},

        initialRender: function(){
			$(this.el).html(_.template(template));

            // Setup the field selector.
            this.field_select = new Util.views.InfoSelectView({
                el: $('.field-picker-info-select', this.el),
                model: new Backbone.Model({
                    choices: []
                })
            });
            this.field_select.model.on('change:selection', this.onFieldSelectChange, this);
            
			this.renderFields();
        },

		renderFields: function(){
			this.unregisterFields();
            var choices = [];
			_.each(this.model.get('fields').models, function(field_model){
				var field = this.getRegisteredField(field_model);
				$('.field-options', this.el).append(field.view.el);
                choices.push(field.choice);
			}, this);

            this.field_select.model.set('choices', choices); 
		},

		getRegisteredField: function(field_model){
			if (! this.field_registry.hasOwnProperty(field_model.cid)){
				var field_choice = {
                    value: field_model.cid,
                    label: field_model.get('label'),
                    info: field_model.get('info')
                };
				var field_view = this.getFieldView(field_model);
				this.field_registry[field_model.cid] = {
					'cid': field_model.cid,
					'choice': field_choice,
					'model': field_model,
					'view': field_view
				};
			}

            return this.field_registry[field_model.cid];
		},

		unregisterFields: function(){
			_.each(this.field_registry, function(field){
				this.unregisterField(field);
			}, this);
		},

		unregisterField: function(field){
			if (this.field_registry.hasOwnProperty(field.model.cid)){
				field.view.remove();
				delete this.field_registry[field.model.cid];
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


		onFieldSelectChange: function(e){
			if (this.model.get('selected_field')){
				var previously_selected_cid = this.model.get('selected_field').cid;
				$(this.field_registry[previously_selected_cid].view.el).removeClass('selected');
			}
			var selected_cid = this.field_select.model.get('selection');
			var selected_field_view = this.field_registry[selected_cid].view;
			$(selected_field_view.el).addClass('selected');
			this.model.set({'selected_field': this.field_registry[selected_cid].model});
		},

		onChangeSelectedField: function(){
            this.field_select.model.set('selection', this.model.get('selected_field').cid);
		}

	});

	return SingleFieldSelectorView;
});
		
