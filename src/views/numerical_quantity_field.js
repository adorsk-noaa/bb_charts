define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./quantity_field",
	"text!./templates/numerical_quantity_field.html"
		],
function($, Backbone, _, ui, _s, QuantityFieldView, template){

	var NumericalQuantityFieldView = QuantityFieldView.extend({

		events: {
		},

		initialize: function(opts){
			QuantityFieldView.prototype.initialize.apply(this, arguments);
			$(this.el).addClass('numerical-quantity-field');
			this.render();
		},

		render: function(){
			$(this.el).html(_.template(template, {model: this.model}));
		}

	});

	return NumericalQuantityFieldView;
});
		
