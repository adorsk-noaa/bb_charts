define(
  [
    "jquery",
    "backbone",
    "underscore",
    "ui",
    "_s",
    "jqplot",
    "jqp_bar",
    "jqp_cat_axis_renderer",
],
function($, Backbone, _, ui, _s, JqPlot, JqpBar, JqpCatAxisRenderer){

  var JqPlotChartView = Backbone.View.extend({

    initialize: function(opts){
      $(this.el).addClass('jqplot-chart');
      this.initialRender();

      // Axis padding (as percent of range).
      this.padding = 0;

      this.model.on('change', this.onChange, this);
      this.on('ready', this.onReady, this);
      this.on('remove', this.remove, this);
    },

    initialRender: function(){
      this.$body_container = $('<div class="body-container"></div>');
      $(this.el).append(this.$body_container);
    },

    onReady: function(){
      this.offsets = this.getBodyOffsets();
      this.row_h = this.getRowHeight();
      this.xaxis_h = this.getXAxisHeight();
      this.title_h = this.getTitleHeight();

      this.render();
    },

    // Get body container offsets (scrollbars).
    getBodyOffsets: function(){
      var offsets = {};
      var $tmp_body = $('<div style="visibility: hidden; position: absolute; left:0; right: 0; bottom: 0; top: 0;"></div>');
      this.$body_container.css('overflow', 'scroll');
      this.$body_container.append($tmp_body);
      offsets.w = this.$body_container.width() - $tmp_body.outerWidth();
      offsets.h = this.$body_container.height() - $tmp_body.outerHeight();
      $tmp_body.remove();
      this.$body_container.css('overflow', '');
      return offsets;
    },

    // Calculate height of the xaxis by making a fake axis.
    getRowHeight: function(){
      var $tmp_body = $('<div class="body jqplot-target" style="visibility: hidden; position: absolute; height: 100%;"></div>');
      var $tmp_yaxis = $('<div class="jqplot-axis jqplot-yaxis"></div>');
      var $tmp_tick = $('<div class="jqplot-yaxis-tick" style="position: absolute;"></div>');
      var $tmp_label = $(this.formatDatumLabel({id: '', label: '&nbsp;'}));

      this.$body_container.append($tmp_body);
      $tmp_body.append($tmp_yaxis);
      $tmp_yaxis.append($tmp_tick);
      $tmp_tick.append($tmp_label);
      row_h = $tmp_tick.outerHeight();
      $tmp_body.remove();
      return row_h;
    },

    // Calculate height of a row by making a fake axis.
    getXAxisHeight: function(){
      var $tmp_body = $('<div class="body jqplot-target" style="visibility: hidden; position: absolute; height: 100%;"></div>');
      var $tmp_xaxis = $('<div class="jqplot-axis jqplot-xaxis" style="position: absolute;"></div>');
      var $tmp_tick = $('<div class="jqplot-xaxis-tick" style="position: absolute;">&nbsp;</div>');

      this.$body_container.append($tmp_body);
      $tmp_body.append($tmp_xaxis);
      $tmp_xaxis.append($tmp_tick);
      xaxis_h = Math.max($tmp_xaxis.outerHeight(), $tmp_tick.outerHeight());
      $tmp_body.remove();
      return xaxis_h;
    },

    // Calculate height of the plot title by making a fake title.
    getTitleHeight: function(){
      var $tmp_body = $('<div class="body jqplot-target" style="visibility: hidden; position: absolute; height: 100%;"></div>');
      var $tmp_title = $('<div class="jqplot-title" style="position: absolute;">&nbsp;</div>');
      this.$body_container.append($tmp_body);
      $tmp_body.append($tmp_title);
      title_h = $tmp_title.outerHeight();
      $tmp_body.remove();
      return title_h;
    },

    onChange: function(){
      this.render();
    },

    render: function(){
      var data = this.model.get('data');

      // Do nothing if there is no data.
      if ( ! (data instanceof Array) || (data.length < 1)){
        return;
      }

      // Clone the data, to avoid overwriting the original.
      data = data.slice(0);

      // Reverse the data to go from top-to-bottom.
      data.reverse();

      // Render empty chart container.
      if (this.$b){
        this.$b.remove();
      }
      this.$body_container.html('');
      this.$b = $('<div class="body"></div>');
      this.$body_container.append(this.$b);

      // Set chart height to max of (rows * row height + xaxis_height, parent container height)
      var calculated_height = data.length * this.row_h + this.xaxis_h + this.title_h;
      var chart_height = Math.max(calculated_height, this.$body_container.height() - this.offsets.h);
      this.$b.css('minHeight', chart_height);

      // Define bar width.
      var bar_width = this.row_h * .5;

      // Define default renderer options.
      var renderer_options = {
        shadow: false,
        barDirection: 'horizontal',
        barWidth: bar_width,
        barPadding: -1 * bar_width,
        fillToZero: true,
      };

      // Format data for jqplot.	
      series = {};
      var labels = [];
      var i = 1;
      var data_bounds = {
        min: null,
        max: null
      }
      _.each(data, function(datum){
        _.each(datum.data, function(v, k){
          if (! series.hasOwnProperty(k)){
            series[k] = [];
          }
          // Format value and point.
          v.value = parseFloat(v.value);
          var formatted_point = [v.value, i];
          series[k].push(formatted_point);

          // If v is a value, update min/max.
          if (! isNaN(v.value)){
            if (! (data_bounds.min < v.value) || data_bounds.min == null){
              data_bounds.min = v.value;	
            }
            if (! (data_bounds.max > v.value) || data_bounds.max == null){
              data_bounds.max = v.value;
            }
          }
        }, this);

        labels.push(this.formatDatumLabel(datum));
        i += 1;
      }, this);


      // Collect min/max data to set on chart.
      var set_data = {};
      _.each(['min', 'max'], function(minmax){

        // Use padded value from data bounds
        // if using auto.
        if (this.model.get(minmax) == null || this.model.get(minmax + "auto")){
          var minmaxVal = data_bounds[minmax];
          var padPct = .03;
          // Don't pad across 0.
          if (minmax == 'min' && minmaxVal >= 0){
            var padMin = minmaxVal - Math.abs(minmaxVal) * padPct
            if (padMin < 0){
              set_data['min'] = 0;
            }
          }
          else if (minmax == 'max' && minmaxVal <= 0){
            var padMax = minmaxVal + Math.abs(minmaxVal) * padPct
            if (padMax > 0){
              set_data['max'] = 0;
            }
          }
          // Otherwise pad by padFactor.
          else{
            var sign = (minmax == 'min') ? -1.0 : 1.0;
            var padValue = minmaxVal + (Math.abs(minmaxVal) * padPct * sign);
            set_data[minmax] = padValue;
          }
        }
      }, this);

      if (set_data){
        this.model.set(set_data, {silent:true});
        var bounds_have_changed = false;
        var changed_attrs = this.model.changedAttributes();
        if (changed_attrs){
          _.each(['min', 'max'], function(minmax){
            if (changed_attrs.hasOwnProperty(minmax) || changed_attrs.hasOwnProperty(minmax + 'auto')){
              bounds_have_changed = true;
            }
          }, this);
        }

        if (bounds_have_changed){
          this.model.trigger('change:bounds');
        }
      }

      // Break out series into list.
      series_lists = _.values(series) || [];

      // Initialize empty series options objects, one per series.
      var series_options = [];
      _.each(series_lists, function(series_list){
        series_options.push({});
      }, this);

      // Set last series to be transparent (we assume it's the reference series).
      if (series_options.length > 0){
        var ref_bar_width = this.row_h * .75;
        series_options[1] = {
          color: 'rgba(255,255,255,0)',
          rendererOptions: _.extend({}, renderer_options, {
            shadow: true,
            shadowOffset: 0,
            highlightMouseOver: false,
            highlightMouseDown: false
          })
        };
      }

      series_lists.reverse();
      series_options.reverse();

      // Set xaxis properties.
      var xaxis = {
        tickOptions:{
          formatter: this.formatQuantityLabel
        },
        min: this.model.get('min'),
        max: this.model.get('max'),
      };

      // Make plot definition.
      this.plotDef = {
        data: series_lists,
        title: this.model.get('title'),
        seriesDefaults:{
          renderer:$.jqplot.BarRenderer,
          rendererOptions: renderer_options,
        },
        series: series_options,
        axes: {
          yaxis: {
            renderer: $.jqplot.CategoryAxisRenderer,
            ticks: labels
          },
          xaxis: xaxis
        }
      };

      // Create the plot.
      this.$b.jqplot(this.plotDef);
    },

    formatDatumLabel: function(datum){
      return _s.sprintf('<span class="datum-label-container"><span data-category-id="%s" class="datum-label">%s</span></span>', datum.id, datum.label);
    },

    formatQuantityLabel: function(formatString, value){
      return value;
    },

    onDataChange: function(){
      this.render();
    },

    resize: function(){
      this.render();
    },

    remove: function(){
      if (this.$b){
        this.$b.remove();
      }
      Backbone.View.prototype.remove.call(this, arguments);
      this.model.off();
      this.off();
    }

  });

  return JqPlotChartView;
});

