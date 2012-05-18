define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./numeric_field",
		],
function($, Backbone, _, ui, _s, NumericFieldView){

	var NumericQuantityFieldView = NumericFieldView.extend({

		initialize: function(opts){
			$(this.el).addClass('field quantity-field numeric-quantity-field');
			NumericFieldView.prototype.initialize.apply(this, arguments);
		}
	});

	return NumericQuantityFieldView;
});
		