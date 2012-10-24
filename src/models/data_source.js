define([
	"backbone",
], 
function(Backbone){

var DataSourceModel = Backbone.Model.extend({

	initialize: function(){
        if (! this.get('query')){
            this.set('query', new Backbone.Model({
                'data_entities': [],
                'grouping_entities': [],
                'filters': []
            }));
        }

        this.on('remove', this.remove, this);
	},

    remove: function(){
        _.each(['query', 'schema'], function(subModelAttr){
            var subModel = this.get(subModelAttr);
            subModel.trigger('remove');
            subModel.off();
        }, this);
        this.off();
    }

});

return DataSourceModel;

});

