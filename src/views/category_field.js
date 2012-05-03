define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"text!./templates/category_field.html"
		],
function($, Backbone, _, ui, _s, template){

	var CategoryFieldView = Backbone.View.extend({

		events: {
			'change .config-form': 'onConfigFormChange'
		},

		initialize: function(opts){
			$(this.el).addClass('field category-field');
			this.render();
		},

		render: function(){
			$(this.el).html(_.template(template, {model: this.model}));
		},

		onConfigFormChange: function(e){
			var attr_name = $(e.target).attr('name');
			var attr_value = $(e.target).attr('value');
			var set_obj = {};
			set_obj[attr_name] = attr_value;
			this.model.set(set_obj);
		}

	});

	return CategoryFieldView;
});
		
