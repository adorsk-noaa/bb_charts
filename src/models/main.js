define([
		'./chart',
		'./xy_chart',
		'./tree_chart',
		'./data_source',
		'./schema'
], 
function(ChartModel, XYChartModel, TreeChartModel, DataSourceModel, SchemaModel){

	models = {
		'ChartModel': ChartModel,
		'XYChartModel': XYChartModel,
		'TreeChartModel': TreeChartModel,
		'DataSourceModel': DataSourceModel,
		'SchemaModel': SchemaModel
	};

	return models;

});
