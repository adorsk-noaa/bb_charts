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
      $(this.el).addClass('jqplot-chart');

      this.positions = ['left', 'top', 'bottom', 'right'];

      this.series = this.model.get('series');
      this.xAxes = this.model.get('xAxes');
      this.yAxes = this.model.get('yAxes');

      this.initialRender();
      this.postInitialize();
    },

    postInitialize: function(){
      var _this = this;
      this.on('remove', this.remove, this);
      $.each(['x', 'y'], function(i, xy){
        var axisCollection = _this[xy + 'Axes'];
        axisCollection.on('change remove', _this.renderChart, _this);
        axisCollection.on('add', function(){
          _this.renderTabElements(xy);
          _this.renderChart();
        }, _this)
      });
      this.series.on('change remove add', this.onSeriesChange, this);
      this.model.on('render', this.renderChart, this);
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

    renderTabElements: function(xy){
      // Add elements to tabble tabs.
      var _this = this;

      // Group elements by tab position.
      var tabEls = {};
      $.each(this.positions, function(i, pos){
        tabEls[pos] = [];
      });

      // Add axis elements to tabble tabs, e.g.
      // min/max editors for sequential axes.
      var axes = this[xy + 'Axes'].models;
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

      // Add els to to tabs.
      $.each(tabEls, function(pos, posEls){
        var $tab = _this.tabs[pos];
        var $h = $('> h3', $tab).eq(0);
        var $b = $('> div', $tab).eq(0);
        $.each(posEls, function(j, el){
          $b.append(el);
        });
        // If tab is empty, hide it.
        if (! $b.children().length){
          _this.$table.tabble('showHideTab', {pos: pos, showHide: 'hide', animate: false});
        }
        else{
          if ($tab.hasClass('hidden')){
            _this.$table.tabble('showHideTab', {pos: pos, showHide: 'show', animate: false});
          }
        }
      });

      setTimeout(function(){_this.resizeStop();}, 500);
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
      if (this.model.get('lock_chart')){
        return;
      }
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

      this.$chart.jqplot(data, chartOpts);
    },

    onReady: function(){
      this.renderTabElements('x');
      this.renderTabElements('y');
      this.renderChart();
    },

    resizeStop: function(){
      var _this = this;
      this.$table.tabble('resize');
      this.renderChart();
    }

  });

  return {
    JqPlotChartView: JqPlotChartView
  };

});

