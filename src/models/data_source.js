define([
	"use!backbone",
], 
function(Backbone){

var DataSourceModel = Backbone.Model.extend({

	defaults: {
		schema: {},
		query: new Backbone.Model({
			'data_entities': [],
			'grouping_entities': [],
			'filters': []
		}),
		dataStore: {}
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

