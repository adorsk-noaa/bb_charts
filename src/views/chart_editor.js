define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"text!./templates/chart_editor.html"
		],
function($, Backbone, _, ui, _s, template){

	var ChartEditorView = Backbone.View.extend({

		events: {
			'click .category-field-container .title': 'toggleCategoryField',
			'click .quantity-field-container .title': 'toggleQuantityField'
		},

		initialize: function(){
			$(this.el).addClass('chart-editor');
			this.render();
		},

		render: function(){
			$(this.el).html(_.template(template, {}));
			this.$lp_el = $('.left-panel', this.el);
			this.$qfc_el = $('.quantity-field-container', this.el);
		},

		toggleCategoryField: function(){
			if (! this.$lp_el.hasClass('changing')){
				this.expandContractLeftPanel({expand: ! this.$lp_el.hasClass('expanded')});
			}
		},

		toggleQuantityField: function(){
			if (! this.$qfc_el.hasClass('changing')){
				this.expandContractQuantityField({expand: ! this.$qfc_el.hasClass('expanded')});
			}
		},

		expandContractLeftPanel: function(opts){
			var expand = opts.expand;
			var $lp_el = $('.left-panel', this.el);
			var $rp_el = $('.right-panel', this.el);
			var width_attr = (expand) ? 'maxWidth' : 'minWidth';

			$lp_el.addClass('changing');
			$rp_el.animate(
					{
						left: $lp_el.css(width_attr)
					},
					{
						complete: function(){
							$lp_el.removeClass('changing');
							if (expand){
								$lp_el.addClass('expanded')
							}
							else{
								$lp_el.removeClass('expanded')
							}
						}
					}
			);
		},

		expandContractQuantityField: function(opts){
			var expand = opts.expand;
			var $qfc_el = $('.quantity-field-container', this.el);
			var $qfb_el = $('.body-container', $qfc_el);
			var height_attr = (expand) ? 'maxHeight' : 'minHeight';

			$qfb_el.addClass('changing');
			$qfb_el.animate(
					{
						height: $qfb_el.css(height_attr)
					},
					{
						complete: function(){
							$qfb_el.removeClass('changing');
							if (expand){
								$qfc_el.addClass('expanded')
							}
							else{
								$qfc_el.removeClass('expanded')
							}
						}
					}
			);
		}

	});

	return ChartEditorView;
});
		
