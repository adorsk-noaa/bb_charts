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
    "text!./templates/jqplotChart.html",
    "./numericAxisEditor"
],
function($, Backbone, _, ui, _s, Tabble, JqPlot, jqpBarRenderer,
         jqpCategoryAxisRenderer, template, NumericAxisEditorView)
{
  var JqPlotChartView = Backbone.View.extend({

    initialize: function(opts){
      console.log("initialize");
      $(this.el).addClass('jqplot-chart');

      this.positions = ['left', 'top', 'bottom', 'right'];

      this.series = this.model.get('series');
      this.xAxes = this.model.get('xAxes');
      this.yAxes = this.model.get('yAxes');

      this.initialRender();
      this.postInitialize();
    },

    postInitialize: function(){
      this.on('remove', this.remove, this);
      this.xAxes.on('change remove add', this.onXAxesChange, this);
      this.yAxes.on('change remove add', this.onYAxesChange, this);
      this.series.on('change remove add', this.onSeriesChange, this);
      this.on('ready', this.onReady, this);
    },

    initialRender: function(){
      var _this = this;
      $(this.el).html(_.template(template, {model: this.model}));
      this.$table = $('> table', this.el).eq(0);
      this.$table.tabble();

      // Resize chart after tabs toggle.
      // @TODO: add events to tabble, then listen here.

      // Save shortcuts to tabs.
      this.tabs = {};
      $.each(this.positions, function(i, pos){
        var $tab = $('> tbody > tr > td > div.' + pos, _this.$table).eq(0);
        _this.tabs[pos] = $tab;
      });

      this.$chart = $('.chart-cell > .chart', this.el);
    },

    renderTabElements: function(){
      // Add elements to tabble tabs.
      var _this = this;

      // Group elements by tab position.
      var tabEls = {};
      $.each(this.positions, function(i, pos){
        tabEls[pos] = [];
      });

      // Add axis elements to tabble tabs, e.g.
      // min/max editors for sequential axes.
      $.each({x: this.xAxes.models, y: this.yAxes.models}, function(xy, axes){
        for (var i = 0; i < Math.min(axes.length,2); i++){
          var axisModel = axes[i];
          var axisEls = {};
          $.each(_this.positions, function(i, pos){
            axisEls[pos] = [];
          });
          var axisType = axisModel.get('type');
          if (axisType == 'numeric'){
            var axisEditor = new NumericAxisEditorView({
              model: axisModel
            });
            axisEditor.model.on('remove', axisEditor.remove, axisEditor);
            var pos = '';
            if (xy == 'x'){
              pos = (i % 2) ? 'top' : 'bottom';
            }
            else if (xy == 'y'){
              pos = (i % 2) ? 'right' : 'left';
            }
            axisEls[pos].push(axisEditor.el);
          }

          $.each(axisEls, function(pos, posEls){
            $.each(posEls, function(j, el){
              tabEls[pos].push(el);
            });
          });
        }
      });

      // Add els to to tabs.
      $.each(tabEls, function(pos, posEls){
        var $tab = _this.tabs[pos];
        var $h = $('> h3', $tab).eq(0);
        var $b = $('> div', $tab).eq(0);
        $.each(posEls, function(j, el){
          $b.append(el);
        });
      });
    },

    axisModelToAxisObj: function(axisModel){
      var _this = this;
      axisObj = {};
      $.extend(axisObj, axisModel.toJSON());
      if (axisModel.get('type') == 'categorical'){
        axisObj.renderer = $.jqplot.CategoryAxisRenderer
      }
      return axisObj;
    },

    renderChart: function(){
      var _this = this;

      this.$chart.empty();

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
      $.each({x: this.xAxes.models, y: this.yAxes.models}, function(xy, axes){
        for (var i = 0; i < Math.min(axes.length,2); i++){
          var axisModel = axes[i];

          // Set axis keys, per jqPlot
          var axisId = xy;
          if (i > 0){
            axisId += '' + (i + 1);
          }
          axisId += 'axis';

          axesObjs[axisId] = _this.axisModelToAxisObj(axisModel);
        }
      });

      var chartOpts = {
        seriesDefaults:{
          renderer:$.jqplot.BarRenderer,
          rendererOptions: {fillToZero: true}
        },
        series: seriesObjs,
        axes: axesObjs,
      }

      console.log("plotting: ", data, chartOpts);

      this.$chart.jqplot(data, chartOpts);
    },

    onReady: function(){
      console.log("ready");
      this.renderTabElements();
      this.renderChart();
    },

    onXAxesChange: function(){
      console.log("oxac");
      this.renderChart();
    },

    onYAxesChange: function(){
      console.log("oyac");
      this.renderChart();
    },

    onSeriesChange: function(){
      console.log("osc");
      this.renderChart();
    }

  });

  return {
    JqPlotChartView: JqPlotChartView
  };

});

