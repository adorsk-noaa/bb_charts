define([
	"use!backbone",
], 
function(Backbone){

var DataSourceModel = Backbone.Model.extend({

	defaults: {
		schema: {},
		dataStore: {}
	},

	initialize: function(){
        if (! this.get('query')){
            this.set('query', new Backbone.Model({
                'data_entities': [],
                'grouping_entities': [],
                'filters': []
            }));
        }
	},

	getSchema: function(){
		return this.schema;
	},

	getData: function(opts){
	}

});

return DataSourceModel;

});

