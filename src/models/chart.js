define([
	"backbone",
	"./field"
], 
function(Backbone, FieldModel){

var ChartModel = Backbone.Model.extend({

	defaults: {
		"category_fields": new Backbone.Collection(),
		"value_fields": new Backbone.Collection()
	},

	initialize: function(){
	},
	
	setCategoryFields: function(new_fields){
		this.get('category_fields').reset(new_fields);
	},

	setValueFields: function(new_fields){
		this.get('value_fields').reset(new_fields);
	}

});

return ChartModel;

});

