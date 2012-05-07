define([
	"use!backbone",
], 
function(Backbone){

var DataSourceModel = Backbone.Model.extend({

	defaults: {
		schema: {},
		query: new Backbone.Model({
			'VALUE_FIELDS': {},
			'GROUPING_FIELDS': {},
			'FILTERS': {}
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

