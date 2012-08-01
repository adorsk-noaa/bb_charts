define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"use!_s",
    "./field"
		],
function($, Backbone, _, ui, _s, FieldView){

	var QuantityFieldView = FieldView.extend({
		initialize: function(opts){
            FieldView.prototype.initialize.call(this, arguments);
			$(this.el).addClass('quantity-field');
		},
	});

	return QuantityFieldView;
});
		
