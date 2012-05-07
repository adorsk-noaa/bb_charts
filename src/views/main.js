define([
		'./bar_chart',
		'./tree_chart',
		'./chart_editor',
		'./single_field_selector',
		'./jqplot_chart',
		'./flot_chart'
], 
function(BarChartView, TreeChartView, ChartEditorView, SingleFieldSelectorView, JqPlotChartView, FlotChartView){

	views = {
		'BarChartView': BarChartView,
		'TreeChartView': TreeChartView,
		'ChartEditorView': ChartEditorView,
		'SingleFieldSelectorView': SingleFieldSelectorView,
		'JqPlotChartView': JqPlotChartView,
		'FlotChartView': FlotChartView
	};

	return views;

});
