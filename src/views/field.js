define([
	"jquery",
	"backbone",
	"underscore",
	"ui",
	"_s"
		],
function($, Backbone, _, ui, _s){

	var FieldView = Backbone.View.extend({
		initialize: function(opts){
			$(this.el).addClass('field');
            this.on('remove', this.remove, this);
		},

        remove: function(){
	        Backbone.View.prototype.remove.apply(this, arguments);
            this.model.off();
            this.off();
        }
	});

	return FieldView;
});
		
