require(
  [
    "jquery",
    "Charts/views/jqplotChart",
    "rless!Charts/styles/jqplotChart.less"
  ],
  function($, jqplotChart, jqplotChartCSS){
    $(document).ready(function(){
      $(document.body).append('<p id="stylesLoaded" style="display: none;"></p>');
      var cssEl = document.createElement('style');
      cssEl.id = 'rless';
      cssEl.type = 'text/css';

      var stylesLoadedCSS = '#stylesLoaded {position: fixed;}\n';
      cssText = jqplotChartCSS + "\n" + stylesLoadedCSS;
      if (cssEl.styleSheet){
        cssEl.styleSheet.cssText = cssText;
      }
      else{
        cssEl.appendChild(document.createTextNode(cssText));
      }
      document.getElementsByTagName("head")[0].appendChild(cssEl);

      var cssDeferred = $.Deferred();
      var cssInterval = setInterval(function(){
        $testEl = $('#stylesLoaded');
        var pos = $testEl.css('position');
        if (pos == 'fixed'){
          clearInterval(cssInterval);
          cssDeferred.resolve();
        }
        else{
          console.log('loading styles...', pos);
        }
      }, 500);

      cssDeferred.done(function(){
        var generateSequentialData = function(){
          var data = [];
          for (var i=0; i < 10; i++){
            data.push([i, i]);
          }
          return data;
        };

        var series1 = new Backbone.Model({
          label: 'series1',
          data: generateSequentialData()
        });
        var seriesModel = new Backbone.Collection([series1]);

        var xaxis = new Backbone.Model({
          id: 'xaxis',
          min: 0,
          minauto: null,
          max: 10,
          maxauto: null
        });

        var axesModel = new Backbone.Collection([xaxis]);

        var chartModel = new Backbone.Model({
          title: "Testo",
          series: seriesModel,
          axes: axesModel
        });

        var jqpChart = new jqplotChart.JqPlotChartView({
          el: $('#chart'),
          model: chartModel,
        });

        console.log('done');
      });

    });
  }
);
