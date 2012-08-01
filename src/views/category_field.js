define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./field"
		],
function($, Backbone, _, ui, _s, FieldView){

	var CategoryFieldView = FieldView.extend({
		initialize: function(opts){
            FieldView.prototype.initialize.call(this, arguments);
			$(this.el).addClass('category-field');
		},
	});

	return CategoryFieldView;
});
		
