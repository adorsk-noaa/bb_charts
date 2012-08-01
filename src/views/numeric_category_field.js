define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./category_field",
	"./numeric_field",
	"text!./templates/numeric_category_field.html"
		],
function($, Backbone, _, ui, _s, CategoryFieldView, NumericFieldView, template){

	var NumericCategoryFieldView = CategoryFieldView.extend(NumericFieldView.prototype).extend({

		events: _.extend({}, NumericFieldView.prototype.events, {
			'change .classes input[type="text"]': 'onNumClassesChange'
		}),

		initialize: function(opts){

			if (! opts){
				opts = {};
			}
			$(this.el).addClass('numeric-category-field');
			opts.template = opts.template || template;

			CategoryFieldView.prototype.initialize.apply(this, arguments);
            console.log("calling numeric");
			NumericFieldView.prototype.initialize.apply(this, arguments);

			// Set initial properties on inputs.
			this.setNumClasses();

			// Listen for changes in classes.
			this.entity.on('change:num_classes', function(){this.setNumClasses()}, this);

		},

		setNumClasses: function(){
			$('.classes input[type="text"]', this.el).val(this.entity.get('num_classes'));
		},

		onNumClassesChange: function(e){
			var $text = $(e.target);
			var raw_val = $text.val();
			var val = parseFloat(raw_val);
			this.entity.set('num_classes', val);
		}
	});

	return NumericCategoryFieldView;
});
		
