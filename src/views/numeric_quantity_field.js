define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./quantity_field",
	"./numeric_field",
		],
function($, Backbone, _, ui, _s, QuantityFieldView, NumericFieldView){

	var NumericQuantityFieldView = QuantityFieldView.extend(NumericFieldView.prototype).extend({

        initialize: function(opts){
			$(this.el).addClass('field quantity-field numeric-quantity-field');
			NumericFieldView.prototype.initialize.apply(this, arguments);
			QuantityFieldView.prototype.initialize.apply(this, arguments);
		},

        remove: function(){
            NumericFieldView.prototype.remove.apply(this, arguments);
            QuantityFieldView.prototype.remove.apply(this, arguments);
        }
	});

	return NumericQuantityFieldView;
});
		
