define(
  [
    "jquery",
    "backbone",
    "underscore",
    "ui",
    "_s",
    "tabble",
    "jqplot",
    "jqplot/plugins/jqplot.barRenderer.min",
    "jqplot/plugins/jqplot.categoryAxisRenderer.min",
    "text!./templates/jqplotChart.html"
],
function($, Backbone, _, ui, _s, Tabble, JqPlot, jqpBarRenderer,
         jqpCategoryAxisRenderer, template)
{

  var JqPlotChartView = Backbone.View.extend({

    initialize: function(opts){
      console.log("initialize");
      $(this.el).addClass('jqplot-chart');

      this.series = this.model.get('series');
      this.axes = this.model.get('axes');

      this.initialRender();
      this.on('remove', this.remove, this);
    },

    initialRender: function(){
      $(this.el).html(_.template(template, {model: this.model}));
      this.$table = $('> table', this.el).eq(0);
      this.$table.tabble();
      this.$chart = $('.chart-cell > .chart', this.el);
      this.renderChart();
    },

    renderChart: function(){
      var _this = this;

      // Get series data.
      var data = [];
      $.each(this.series.models, function(i, seriesModel){
        data.push(seriesModel.get('data'));
      });

      // Format series objects
      var seriesObjs = [];
      $.each(this.series.models, function(i, seriesModel){
        seriesObjs.push(seriesModel.toJSON());
      });

      // Format axis objects.
      var axesObjs = {};
      $.each(this.axes.models, function(i, axisModel){
        axesObjs[axisModel.id] = axisModel.toJSON();
      });

      this.$chart.jqplot(
        data,
        {
          seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            rendererOptions: {fillToZero: true}
          },
          series: seriesObjs,
          axes: axesObjs,
        }
      );
    },

    onReady: function(){
    }

  });

  return {
    JqPlotChartView: JqPlotChartView
  };
});

