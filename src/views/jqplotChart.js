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
      this.axes = this.model.get('axes');

      this.initialRender();
      this.on('remove', this.remove, this);
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

      this.renderTabElements();
      this.renderChart();
    },

    renderTabElements: function(){
      // Add elements to tabble tabs.
      var _this = this;

      // Group elements by tab position.
      tabEls = {
        'left': [],
        'bottom': []
      };

      // Add axis elements to tabble tabs, e.g.
      // min/max editors for sequential axes.
      $.each(this.axes.models, function(i, axisModel){
        var axisEls = {};
        $.each(_this.positions, function(j, pos){
          axisEls[pos] = [];
        });

        var axisType = axisModel.get('type');
        var axisPos = axisModel.get('pos');

        if (axisType == 'numeric'){
          var axisEditor = new NumericAxisEditorView({
            model: axisModel
          });
          axisEls[axisPos].push(axisEditor.el);
        }

        $.each(axisEls, function(pos, posEls){
          $.each(posEls, function(j, el){
            tabEls[pos].push(el);
          });
        });
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

