define([
	"use!backbone",
], 
function(Backbone){

var DataSourceModel = Backbone.Model.extend({

	defaults: {
		schema: {}
	},

	initialize: function(){
	},

	getSchema: function(){
		return this.schema;
	},

	getData: function(opts){
	}

});

return DataSourceModel;

});

