define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"./chart"
		],
function($, Backbone, _, ChartView){

	var TreeChartView = ChartView.extend({

		initialize: function(){
			this.render();
		},

		render: function(){
			console.log(this.model.get('data_tree'));
			$(this.el).append(this.renderDataTreeNode(this.model.get('data_tree')));
		},

		renderDataTreeNode: function(node){
			var node_el = $('<div class="node"></div>');

			// Render node data.
			node_el.append('<div class="data">' + JSON.stringify(node.data) + '</div>');

			// Recursively render node children.
			if (node.hasOwnProperty('children')){
				var children_el = $('<div class="children"></div>');
				node_el.append(children_el);
				_.each(node.children, function(child_node){
					children_el.append(this.renderDataTreeNode(child_node));
				}, this);
			}

			console.log(node_el);
			return node_el;
		}

	});

	return TreeChartView;
});
		
