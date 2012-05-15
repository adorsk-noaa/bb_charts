define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s"
		],
function($, Backbone, _, ui, _s, template){

	var CategoryFieldView = Backbone.View.extend({

		initialize: function(opts){
			$(this.el).addClass('field category-field');
		},

	});

	return CategoryFieldView;
});
		
