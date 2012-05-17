define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./quantity_field",
	"text!./templates/numerical_quantity_field.html"
		],
function($, Backbone, _, ui, _s, QuantityFieldView, template){

	var NumericalQuantityFieldView = QuantityFieldView.extend({

		events: {
			'change input[type="text"]': 'onMinMaxTextChange',
			'change input[type="checkbox"]': 'onMinMaxCheckboxChange',
		},

		initialize: function(opts){
			QuantityFieldView.prototype.initialize.apply(this, arguments);
			$(this.el).addClass('numerical-quantity-field');
			this.render();

			// Set initial properties on inputs.
			_.each(['min', 'max'], function(minmax){
				this.setMinMaxText(minmax);
				this.setMinMaxCheckbox(minmax);
			},this);


			this.model.on('change:min', function(){this.setMinMaxText('min')}, this);
			this.model.on('change:max', function(){this.setMinMaxText('max')}, this);
			this.model.on('change:minauto', function(){this.setMinMaxCheckbox('min')}, this);
			this.model.on('change:maxauto', function(){this.setMinMaxCheckbox('max')}, this);

		},

		render: function(){
			$(this.el).html(_.template(template, {model: this.model}));
		},

		onMinMaxTextChange: function(e){
			var minmax = $(e.target).data('minmax');
			var raw_val = this.getMinMaxElements(minmax).$text.val();
			var val = parseFloat(raw_val);
			this.model.set(minmax, val);
		},

		setMinMaxText: function(minmax){
			var minmax_els = this.getMinMaxElements(minmax);
			minmax_els.$text.val(this.model.get(minmax));
		},

		getMinMaxElements: function(minmax){
			var $minmax_el = $('.' + minmax, this.el);
			var $cb = $('input[type="checkbox"]', $minmax_el);
			var $t = $('input[type="text"]', $minmax_el);
			return {
				$text: $t,
				$checkbox: $cb
			};
		},

		onMinMaxCheckboxChange: function(e){
			var minmax = $(e.target).data('minmax');
			var minmax_els = this.getMinMaxElements(minmax);
			var auto_attr = minmax + 'auto';
			if (minmax_els.$checkbox.is(':checked')){
				this.model.set(auto_attr, true);
				minmax_els.$text.attr('disabled', 'true');
			}
			else{
				minmax_els.$text.removeAttr('disabled');
				this.model.set(auto_attr, false);
			}
		},

		setMinMaxCheckbox: function(minmax){
			var minmax_els = this.getMinMaxElements(minmax);
			var auto_attr = minmax + 'auto';
			if (this.model.get(auto_attr)){
				minmax_els.$checkbox.attr('checked', 'checked');
				minmax_els.$text.attr('disabled', 'true');
			}
			else{
				minmax_els.$checkbox.removeAttr('checked');
				minmax_els.$text.removeAttr('disabled');
			}
		}

	});

	return NumericalQuantityFieldView;
});
		
