define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./numeric_field",
		],
function($, Backbone, _, ui, _s, NumericFieldView){

	var NumericCategoryFieldView = NumericFieldView.extend({

		initialize: function(opts){
			$(this.el).addClass('field category-field numeric-category-field');
			NumericFieldView.prototype.initialize.apply(this, arguments);
		}
	});

	return NumericCategoryFieldView;
});
		
