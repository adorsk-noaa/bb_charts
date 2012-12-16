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
        console.log("styles loaded");

        var generateNumericData = function(min, max, n){
          var data = [];
          n = n || 1;
          var range = (max - min)/n;
          for (var i = min; i < max; i += range){
            data.push([i, i]);
          }
          return data;
        };

        var generateCategoricalData = function(min, max, n){
          var numData = generateNumericData(min, max, n);
          var data = {};
          $.each(numData, function(i, v){
            data["Category_" + i] =  v;
          });
          return data;
        };

        var seriesId = 'Series';
        var series1 = new Backbone.Model({
          id: seriesId,
          data: []
        });
        var seriesModel = new Backbone.Collection([series1]);
        var xAxes = new Backbone.Collection();
        var yAxes = new Backbone.Collection();

        var chartModel = new Backbone.Model({
          title: "Testo",
          series: seriesModel,
          xAxes: xAxes,
          yAxes: yAxes
        });

        setAxis = function(xy){
          console.log("here");
          var attrs = ['min', 'max', 'n', 'type'];
          var vals = {};
          $.each(attrs, function(i, attr){
            var val = $('#' + xy + attr).val();
            if (attr != 'type'){
              val = parseFloat(val);
            }
            vals[attr] = val;
          });

          var axisId = xy + 'Axis';
          var seriesData;

          var newAxis = new Backbone.Model({
            id: axisId
          });

          if (vals.type == 'n'){
            data = generateNumericData(vals.min, vals.max, vals.n);
            newAxis.set({
              type: 'numeric',
              min: vals.min,
              max: vals.max
            });
            seriesData = data;
          }
          else if (vals.type == 'c'){
            data = generateCategoricalData(vals.min, vals.max, vals.n);
            ticks = [];
            seriesData = [];
            $.each(data, function(k,v){
              ticks.push(k);
              seriesData.push(v);
            });
            newAxis.set({
              type: 'categorical',
              ticks: ticks
            });
          }

          var axesModel = chartModel.get(xy + 'Axes');
          var oldAxis = axesModel.get(axisId);
          chartModel.set('lock_chart', true);
          if (oldAxis){
            axesModel.remove(oldAxis);
          }
          axesModel.add(newAxis);
          series1.set('data', seriesData);
          chartModel.set('lock_chart', false);
          chartModel.trigger('render');
        };

        setAxis('x');
        setAxis('y');

        var jqpChart = new jqplotChart.JqPlotChartView({
          el: $('#chart'),
          model: chartModel,
        });

        $.each(['x', 'y'], function(i, xy){
          $('#' + xy + 'set').on('click', function(){
            setAxis(xy);
          });
        });

        jqpChart.trigger('ready');
        console.log('done');
      });

    });
  }
);
