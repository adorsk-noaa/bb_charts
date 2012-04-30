define([
	"use!backbone",
], 
function(Backbone){

var ChartModel = Backbone.Model.extend({

	defaults: {
		"category_fields": new Backbone.Collection({}),
		"value_fields": new Backbone.Collection({})
	},

	initialize: function(){
	}

});

return ChartModel;

});

