define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
		],
function($, Backbone, _, ui, _s){

	var QuantityFieldView = Backbone.View.extend({

		initialize: function(opts){
			$(this.el).addClass('field quantity-field');
		}

	});

	return QuantityFieldView;
});
		
