define([
	"jquery",
	"backbone",
	"underscore",
	"ui",
	"_s",
	"./category_field",
		],
function($, Backbone, _, ui, _s, CategoryFieldView){

	var CategoricalCategoryFieldView = CategoryFieldView.extend({

		initialize: function(opts){
			CategoryFieldView.prototype.initialize.apply(this, arguments);
			$(this.el).addClass('categorical-category-field');
			this.render();
		},

		render: function(){
			$(this.el).html('No options for this field');
		},

	});

	return CategoricalCategoryFieldView;
});
		
