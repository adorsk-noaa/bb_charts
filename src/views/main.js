define([
		'./tree_chart',
		'./chart_editor'
], 
function(TreeChartView, ChartEditorView){

	views = {
		'TreeChartView': TreeChartView,
		'ChartEditorView': ChartEditorView
	};

	return views;

});
