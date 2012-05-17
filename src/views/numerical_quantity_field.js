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
			'change .min': 'onMinChange',
			'change .max': 'onMaxChange',
		},

		initialize: function(opts){
			QuantityFieldView.prototype.initialize.apply(this, arguments);
			$(this.el).addClass('numerical-quantity-field');
			this.render();
			this.model.on('change:min', this.setMin, this);
			this.model.on('change:max', this.setMax, this);
		},

		render: function(){
			$(this.el).html(_.template(template, {model: this.model}));

			// Set initial values for min/max.
			_.each(['min', 'max'], function(minmax){
				var val = this.model.get(minmax);
				if (val == null){
					this.model.set(minmax, 'auto');
				}
				this.setMinMax(minmax);
			}, this);

		},

		onMinChange: function(){ this.onMinMaxChange('min'); },
		onMaxChange: function(){ this.onMinMaxChange('max'); },
		onMinMaxChange: function(minmax){
			var $e = $('.' + minmax, this.el);
			var $t = $('input[type="text"]', $e);
			var $auto_cb = $('input[type="checkbox"]', $e);
			if ($auto_cb.is(':checked')){
				this.model.set(minmax, 'auto');
				$t.attr('disabled', 'true');
			}
			else{
				$t.removeAttr('disabled');
				this.model.set(minmax, $t.val());
			}
		},

		setMin: function(){this.setMinMax('min');},
		setMax: function(){this.setMinMax('max');},
		setMinMax: function(minmax){
			var $e = $('.' + minmax, this.el);
			var $t = $('input[type="text"]', $e);
			var $auto_cb = $('input[type="checkbox"]', $e);
			var val = this.model.get(minmax);
			if (val == 'auto'){
				$auto_cb.attr('checked', 'checked');
				$t.attr('disabled', 'true');
			}
			else{
				$t.removeAttr('disabled');
				$t.val(val);
			}
		}


	});

	return NumericalQuantityFieldView;
});
		
