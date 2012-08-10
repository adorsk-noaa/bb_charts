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
			this.fieldRegistry = {};
            this.initialRender();
			this.model.on("change:selected_field", this.onChangeSelectedField, this);

            this.on("ready", this.onReady, this);
            this.on("resizeStop", this.onResizeStop, this);
            this.on("remove", this.remove, this);
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

            // Render initial fields.
			this.renderFields();

            // Set selected field.
            this.onChangeSelectedField();

            this.field_select.model.on('change:selection', this.onFieldSelectChange, this);
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
			if (! this.fieldRegistry.hasOwnProperty(field_model.cid)){
				var field_choice = {
                    value: field_model.cid,
                    label: field_model.get('label'),
                    info: field_model.get('info')
                };
				var field_view = this.getFieldView(field_model);
				this.fieldRegistry[field_model.cid] = {
					'cid': field_model.cid,
					'choice': field_choice,
					'model': field_model,
					'view': field_view
				};
			}

            return this.fieldRegistry[field_model.cid];
		},

		unregisterFields: function(){
			_.each(this.fieldRegistry, function(field){
				this.unregisterField(field);
			}, this);
		},

		unregisterField: function(field){
			if (this.fieldRegistry.hasOwnProperty(field.model.cid)){
				field.view.trigger('remove');
				delete this.fieldRegistry[field.model.cid];
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
				$(this.fieldRegistry[previously_selected_cid].view.el).removeClass('selected');
			}
			var selected_cid = this.field_select.model.get('selection');
			var selected_field_view = this.fieldRegistry[selected_cid].view;
			$(selected_field_view.el).addClass('selected');
			this.model.set({'selected_field': this.fieldRegistry[selected_cid].model});
		},

		onChangeSelectedField: function(){
            this.field_select.model.set('selection', this.model.get('selected_field').cid);
		},

        onReady: function(){
            this.field_select.trigger("ready");
            // Trigger selection of field form.
            this.onFieldSelectChange();
        },

        onResizeStop: function(){
            // Resize fieldsets.
            var $field_picker = $('> .field-picker', this.el);
            $field_picker.children('fieldset').outerWidth($field_picker.width());
            this.field_select.trigger("resizeStop");
        },

        remove: function(){
	        Backbone.View.prototype.remove.apply(this, arguments);
            this.unregisterFields();
            this.model.off();
            this.off();
        }
        

	});

	return SingleFieldSelectorView;
});
		
