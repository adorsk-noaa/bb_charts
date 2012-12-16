define(
  [
    'backbone'
],
function(Backbone){
  var ChartModel = Backbone.Model.extend({
    series: null,
    title: null
    // ... other chart properties.
  });

  var SeriesModel = Backbone.Model.extend({
    data: null,
    axis: null, // an axis id.
    // ... other series properties.
  });

  var AxisModel = Backbone.Model.extend({
    // min, max, etc.
  });

  return {
  };
});
