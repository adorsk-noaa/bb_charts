define([
	"use!backbone",
], 
function(Backbone){

var SchemaModel = Backbone.Model.extend({

	defaults: {
		category_fields: {},
		value_fields: {}
	},

	initialize: function(){
	},

});

return SchemaModel;

});

