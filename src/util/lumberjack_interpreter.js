// This is called lumberjack because it flattens a tree, returning its leaves as a flat list.
define([
	'use!underscore'
], 
function(_){

	var LumberjackInterpreter = function(){ };
	_.extend(LumberjackInterpreter.prototype, {

		parse: function(data_tree){
			return this._getLeafs(data_tree);
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
