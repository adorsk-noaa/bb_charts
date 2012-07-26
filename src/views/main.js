define([
		'./chart_editor',
		'./single_field_selector',
		'./jqplot_chart',
], 
function(ChartEditorView, SingleFieldSelectorView, JqPlotChartView){

	views = {
		'ChartEditorView': ChartEditorView,
		'SingleFieldSelectorView': SingleFieldSelectorView,
		'JqPlotChartView': JqPlotChartView
	};

	return views;

});
