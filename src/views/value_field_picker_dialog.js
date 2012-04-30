define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"Dialogs",
	"./value_field_configurator",
	"text!./templates/field_picker_dialog_body.html",
	"text!./templates/field_picker.html"
		],
function($, Backbone, _, ui, _s, Dialogs, ValueFieldConfiguratorView, body_template, field_picker_template){

	ValueFieldPickerDialogView = Dialogs.views.ModalDialogView.extend({
		events: {
			'click .dialog-footer .close-button': 'hide',
			'click .dialog-footer .save-button': 'onSave',
			'change select.field-picker': 'onFieldPickerChange'
		},

		initialize: function(){
			Dialogs.views.ModalDialogView.prototype.initialize.call(this, arguments);
			this.model.on('change:selected_field', this.onSelectedFieldChange, this);
			this.setDefaultSelectedField();
		},

		setDefaultSelectedField: function(){
			if (this.model.get('fields')){
				this.setSelectedField(_.values(this.model.get('fields'))[0]['id']);
			}
		},

		renderDialogBody: function(){
			var body_html = _.template(body_template, {model: this.model.toJSON()});
			$('.dialog-body', this.el).html(body_html);

			$('.dialog-body .field-picker', this.el).html(_.template(field_picker_template, {model: {
				id: this.model.id,
				fields: this.model.get('fields')
			}}));


			return this;
		},
		renderDialogFooter: function(){
			var footer_html = '<button class="save-button button">Add field</button><button class="close-button button">Cancel</button>';
			$('.dialog-footer', this.el).html(footer_html);
			return this;
		},
		onFieldPickerChange: function(){
			var selected_field_id = $('select.field-picker option:selected', this.el).val();
			this.model.set({'selected_field': this.model.get('fields')[selected_field_id]});
		},

		setSelectedField: function(field_id){
			$('select.field-picker', this.el).val(field_id);
			this.model.set({'selected_field': this.model.get('fields')[field_id]});
		},

		onSelectedFieldChange: function(){
			this.configured_field_model = new Backbone.Model(this.model.get('selected_field'));

			if (this.field_configurator_view){
				this.field_configurator_view.remove();
			}
			this.field_configurator_view = new ValueFieldConfiguratorView({
				model: this.configured_field_model
			});
			$('.field-configurator', this.el).append(this.field_configurator_view.el);
		},

		onSave: function(){
			var chart_model = this.model.get('chart');
			var chart_value_fields = chart_model.get('value_fields');
			if (! chart_value_fields.get(this.configured_field_model.id)){
				chart_model.get('value_fields').add(this.configured_field_model);
				this.hide();
			}
			else{
				// @TODO: add error message to dialog.
				console.log('error: model has field already');
			}
		}

	});

	return ValueFieldPickerDialogView;
});
		
