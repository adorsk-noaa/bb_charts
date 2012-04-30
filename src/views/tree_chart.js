define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"./chart"
		],
function($, Backbone, _, _s, ChartView){

	var TreeChartView = ChartView.extend({

		initialize: function(){
			this.render();
		},

		render: function(){
			this._data_tree = this.model.get('data_tree');
			$(this.el).html(this.renderDataTreeNode(this._data_tree));
			console.log(this.el);
		},

		renderDataTreeNode: function(node, parent_node){
			// If at root, use root node as its own parent.
			if (! parent_node){
				parent_node = node;
				node.depth = 0;
			}
			else{
				node.depth = parent_node.depth + 1;
			}

			var node_el = $(_s.sprintf("<div class=\"node depth%d\"></div>", node.depth));

			// Render node data.
			var data_el = $('<div class="data"></div>');
			node_el.append(data_el);
			data_el.append(this.renderNodeData(node, parent_node));

			// Recursively render node children.
			if (node.hasOwnProperty('children')){
				var children_el = $('<div class="children"></div>');
				node_el.append(children_el);
				_.each(node.children, function(child_node){
					children_el.append(this.renderDataTreeNode(child_node, node));
				}, this);
			}

			return node_el;
		},

		renderNodeData: function(node, parent_node){
			// If at root, use root node as its own parent.
			if (! parent_node){
				parent_node = node;
			}

			var inner_el = $('<div class="data-inner"></div>');

			// Calculate data values as percentages of parent values.
			_.each(node.data, function(d, i){
				var parent_d = parent_node.data[i];
				d.pct = d['value']/parent_d['value'];
				var d_el = $(_s.sprintf("<div class=\"bar\" style=\"width: %.1f%%; opacity: %.2f;\"></div>", d.pct * 100.0 * parent_d.pct , 1.0 - node.depth * 0.2));
				inner_el.append(d_el);
			});

			return inner_el;
			
		}

	});

	return TreeChartView;
});
		
