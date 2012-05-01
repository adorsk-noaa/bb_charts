define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"text!./templates/value_field.html"
		],
function($, Backbone, _, ui, _s, template){

	var ValueFieldView = Backbone.View.extend({

		events: {
			'change .config-form': 'onConfigFormChange'
		},

		initialize: function(opts){
			$(this.el).addClass('field value-field');
			this.render();
		},

		render: function(){
			$(this.el).html(_.template(template, {model: this.model}));
		},

		onConfigFormChange: function(e){
			var attr_name = $(e.target).attr('name');
			var attr_value = $(e.target).attr('value');

			var value_type = $(e.target).attr('value_type');
			if (value_type == 'numeric'){
				attr_value = parseFloat(attr_value);
			}

			var set_obj = {};
			set_obj[attr_name] = attr_value;
			this.model.set(set_obj);
		}

	});

	return ValueFieldView;
});
		
