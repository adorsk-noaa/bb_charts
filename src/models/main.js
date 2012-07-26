define([
		'./chart',
        './xy_chart',
		'./data_source',
		'./schema'
], 
function(ChartModel, XYChartModel, DataSourceModel, SchemaModel){

	models = {
		'ChartModel': ChartModel,
        'XYChartModel': XYChartModel,
		'DataSourceModel': DataSourceModel,
		'SchemaModel': SchemaModel
	};

	return models;

});
