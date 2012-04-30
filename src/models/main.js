define([
		'./chart',
		'./tree_chart',
		'./data_source',
		'./schema'
], 
function(ChartModel, TreeChartModel, DataSourceModel, SchemaModel){

	models = {
		'ChartModel': ChartModel,
		'TreeChartModel': TreeChartModel,
		'DataSourceModel': DataSourceModel,
		'SchemaModel': SchemaModel
	};

	return models;

});
