// This is called lumberjack because it flattens a tree, returning its leaves as a flat list.
define([
	'use!underscore',
	'_s'
], 
function(_, _s){

	var LumberjackInterpreter = function(){ };
	_.extend(LumberjackInterpreter.prototype, {

		parse: function(data_tree){
			var leafs = this._getLeafs(data_tree);

			// Post-process leafs, depending on label type.
			if (leafs.length > 0){
				var label_type = leafs[0].label_type  || 'alpha';
				
				if (label_type == 'numeric_histogram'){
					_.each(leafs, function(leaf){
						var matches = leaf.label.match(/(.*) to (.*)/);
						if (matches.length > 1){
							leaf.min = parseFloat(matches[1]);
							leaf.max = parseFloat(matches[2]);
							leaf.label = _s.sprintf("%.1f to %.1f", leaf.min, leaf.max);
						}
					}, this);

					var sorted_leafs = _.sortBy(leafs, function(leaf){
						return leaf.min;
					}, this);

					return sorted_leafs;
				}
				else{
					var sorted_leafs = _.sortBy(leafs, function(leaf){
						return leaf.label;
					}, this);

					return sorted_leafs;
				}
			}

			return leafs;
		},

		_getLeafs: function(node){
			var leafs = [];

			if (node.hasOwnProperty('children')){
				_.each(node.children, function(child){
					_.each(this._getLeafs(child), function(leaf){
						leafs.push(leaf);
					});
				}, this);
			}
			else{
				leafs.push(node);
			}

			return leafs;
		}
	});

	return LumberjackInterpreter;

});
