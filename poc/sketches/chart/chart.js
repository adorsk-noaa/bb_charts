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
        var generateCategoricalData = function(){
          var data = {};
          for (var i=0; i < 10; i++){
            data["Category_" + i] =  i;
          }
          return data;
        };

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

        var yaxis1 = new Backbone.Model({
          id: 'yaxis',
          type: 'numeric',
          min: 0,
          min_auto: true,
          max: 20,
          max_auto: null
        });

        var xaxis1 = new Backbone.Model({
          id: 'xaxis',
          type: 'numeric',
          min: 0,
          min_auto: true,
          max: 10,
          max_auto: null
        });
        xaxis1.on('all', function(){
          console.log('xaxis1', arguments);
        });

        var xAxes= new Backbone.Collection([xaxis1]);
        var yAxes= new Backbone.Collection([yaxis1]);

        var chartModel = new Backbone.Model({
          title: "Testo",
          series: seriesModel,
          xAxes: xAxes,
          yAxes: yAxes
        });

        var jqpChart = new jqplotChart.JqPlotChartView({
          el: $('#chart'),
          model: chartModel,
        });

        $('#b1').on('click', function(){
          var data = generateCategoricalData();
          var ticks = [];
          var seriesData = [];
          var i = 0;
          $.each(data, function(k, v){
            i += 1;
            ticks.push(k);
            seriesData.push([i, v]);
          });
          var newXAxis = new Backbone.Model({
            'id': 'newXAxis',
            'type': 'categorical',
            'ticks': ticks
          });
          var newSeries = new Backbone.Model({
            data: seriesData
          });
          xAxes.remove(xaxis1, {silent: true});
          xaxis1.trigger('remove');
          xAxes.add(newAxis, {silent: true});
          seriesModel.remove(series1, {silent: true});
          series1.trigger('remove');
          seriesModel.add(newSeries);
        });

        console.log('done');
      });

    });
  }
);
