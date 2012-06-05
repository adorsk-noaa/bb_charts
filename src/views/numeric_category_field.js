define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./numeric_field",
	"text!./templates/numeric_category_field.html"
		],
function($, Backbone, _, ui, _s, NumericFieldView, template){

	var NumericCategoryFieldView = NumericFieldView.extend({

		events: _.extend({}, NumericFieldView.prototype.events, {
			'change .classes input[type="text"]': 'onNumBucketsChange'
		}),

		initialize: function(opts){
			if (! opts){
				opts = {};
			}
			$(this.el).addClass('field category-field numeric-category-field');
			opts.template = opts.template || template;
			NumericFieldView.prototype.initialize.call(this, opts);

			// Set initial properties on inputs.
			this.setNumBuckets();

			// Listen for changes in classes.
			this.entity.on('change:num_buckets', function(){this.setNumBuckets()}, this);

		},

		setNumBuckets: function(){
			$('.classes input[type="text"]', this.el).val(this.entity.get('num_buckets'));
		},

		onNumBucketsChange: function(e){
			var $text = $(e.target);
			var raw_val = $text.val();
			var val = parseFloat(raw_val);
			this.entity.set('num_buckets', val);
		}
	});

	return NumericCategoryFieldView;
});
		
