define([
		'./bar_chart',
		'./tree_chart',
		'./chart_editor',
		'./single_field_selector'
], 
function(BarChartView, TreeChartView, ChartEditorView, SingleFieldSelectorView){

	views = {
		'BarChartView': BarChartView,
		'TreeChartView': TreeChartView,
		'ChartEditorView': ChartEditorView,
		'SingleFieldSelectorView': SingleFieldSelectorView
	};

	return views;

});
