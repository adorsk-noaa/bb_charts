define([
		'./simple_interpreter',
		'./lumberjack_interpreter',
], 
function(SimpleInterpreter, LumberjackInterpreter){

	util = {
		'SimpleInterpreter': SimpleInterpreter,
		'LumberjackInterpreter': LumberjackInterpreter
	};

	return util;

});
