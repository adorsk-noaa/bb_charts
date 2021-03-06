define([
  "jquery",
  "backbone",
  "underscore",
  "ui",
  "_s",
  "tabble",
  "Util",
  "./single_field_selector",
  "./jqplot_chart",
  "text!./templates/chart_editor.html"
],
function($, Backbone, _, ui, _s, Tabble, Util, SingleFieldSelectorView, JqplotChartView, template){

  var ChartEditorView = Backbone.View.extend({

    initialize: function(opts){
      $(this.el).addClass('chart-editor');
      this.initialRender();
      this.showInstructions();

      var ds = this.model.get('datasource');
      var schema = ds.get('schema');

      // Fetch new data when the datasource query changes.
      ds.get('query').on('change', this.onDatasourceQueryChange, this);

      // Handle changes in datasource data.
      ds.on('change:data', this.onDatasourceDataChange, this);

      // Handle datasource loading events.
      ds.on('change:loading', this.onDatasourceLoadingChange, this);

      // Change the datasource query when the field selectors change.
      _.each(['category', 'quantity'], function(fieldCategory){
        var selector = this.fieldSelectors[fieldCategory];
        selector.model.on('change:selected_field', function(){
          this.onSelectedFieldChange({fieldCategory: fieldCategory});
        }, this);
      }, this);

      // Save subviews.
      this.subViews = [
        this.fieldSelectors['category'],
        this.fieldSelectors['quantity'],
        this.chart_view
      ];

      // Update the quantity field when the chart min/max attributes change.
      this.model.get('chart').on('change:bounds', this.onChartBoundsChange, this);

      // Listen for events.
      this.on('ready', this.onReady, this);
      this.on('resize', this.resize, this);
      this.on('resizeStop', this.resizeStop, this);
      this.on('activate', this.activate, this);
      this.on('deactivate', this.deactivate, this);
      this.on('pagePositionChange', this.onPagePositionChange, this);
      this.on('remove', this.remove, this);

    },


    getFieldSelectorClass: function(){
      return SingleFieldSelectorView;
    },

    initialRender: function(){
      $(this.el).html(_.template(template, {}));

      this.$table = $(this.el).find('> table').eq(0);
      this.$table.tabble({
        stretchTable: true
      });
      this.$loading_animation = $('.loading-animation', this.el);

      var ds = this.model.get('datasource');
      var schema = ds.get('schema');

      this.fieldSelectors = {};
      _.each(['category', 'quantity'], function(fieldCategory){

        var SelectorClass = this.getFieldSelectorClass();
        var selector = new SelectorClass({
          el: $('.' + fieldCategory + '-field', this.el),
          model: new Backbone.Model({
            fields: schema.get(fieldCategory + '_fields'),
            selected_field: this.model.get(fieldCategory + '_field')
          })
        });
        this.fieldSelectors[fieldCategory] = selector;
      }, this);

      // Add chart view.
      this.chart_view = new JqplotChartView({
        el: $('.chart', this.el),
        model: this.model.get('chart')
      });
    },

    resize: function(){
      Util.util.fillParent(this.$table);
    },

    resizeStop: function(){
      this.$table.tabble('resize');
      this.resizeChart();
      this.resizeLoadingAnimation();

      _.each(this.subViews, function(v){
        v.trigger('resizeStop');
      });
    },

    resizeChart: function(){
      this.chart_view.resize();
    },

    resizeLoadingAnimation: function(){
      var $container = this.$loading_animation.parent();	
      this.$loading_animation.css('left', $container.width()/2 - this.$loading_animation.width()/2);
      this.$loading_animation.css('top', $container.height()/2 - this.$loading_animation.height()/2);
    },

    onSelectedFieldChange: function(opts){
      opts = opts || {};
      // Get selector and (dis)connector functions.
      var selector = this.fieldSelectors[opts.fieldCategory];
      var capFieldCategory = _s.capitalize(opts.fieldCategory);
      var connect = this['connect' + capFieldCategory + 'Field'];
      var disconnect = this['disconnect' + capFieldCategory + 'Field'];

      // Get the old field (if any) and disconnect.
      var oldField = this.model.get(opts.fieldCategory + '_field');
      if (oldField){
        disconnect.call(this, oldField);
      }
      // Get the new new field and connect it.
      var newField = selector.model.get('selected_field');
      connect.call(this, newField);

      // Update the view.
      $('.' + opts.fieldCategory + '-field-name', this.el).html(newField.get('label'));
      this.model.set(opts.fieldCategory + '_field', newField);
      this.updateChartTitle();
      this.updateDatasourceQuery();
      this.resize();
      this.resizeStop();
    },

    connectCategoryField: function(field){
      field.get('entity').on('change', this.onCategoryFieldChange, this);
    },

    disconnectCategoryField: function(field){
      field.get('entity').off(null, null, this);
    },

    onCategoryFieldChange: function(){
      this.onDatasourceQueryChange();
    },

    connectQuantityField: function(field){
      field.get('entity').on('change', this.onQuantityFieldChange, this);
    },

    disconnectQuantityField: function(field){
      field.get('entity').off(null, null, this);
    },

    onQuantityFieldChange: function(){
      this.updateChartBounds();
    },

    updateChartBounds: function(){
      var cField = this.model.get('category_field');
      var qField = this.model.get('quantity_field');

      var set_data = {};
      _.each(['min', 'max'], function(minmax){
        set_data[minmax] = qField.get('entity').get(minmax);
        set_data[minmax + 'auto'] = qField.get('entity').get(minmax + 'auto');
      }, this);

      this.model.get('chart').set(set_data);
    },

    onChartBoundsChange: function(m, e){
      var cField = this.model.get('category_field');
      var qField = this.model.get('quantity_field');
      // Update quantity field to match chart bounds.
      var set_data = {};
      _.each(['min', 'max'], function(minmax){
        if (qField.get('entity').get(minmax + 'auto')){
          var autoValue = this.model.get('chart').get(minmax);
          set_data[minmax] = autoValue;
          qField.get('entity').set(minmax, autoValue);
        }
      }, this);

      qField.get('entity').set(set_data);
    },

    updateChartTitle: function(){
      var cField = this.model.get('category_field');
      var qField = this.model.get('quantity_field');

      if (cField && qField){
        var chart_title = _s.sprintf('%s, by %s', 
          qField.get('label'),
          cField.get('label')
        );
        this.model.get('chart').set('title', chart_title);
      }
    },


    updateDatasourceQuery: function(){
      var q = this.model.get('datasource').get('query');
      var cField = this.model.get('category_field');
      var qField = this.model.get('quantity_field');
      q.set({
        'category_field': cField,
        'quantity_field': qField
      });
    },

    onDatasourceQueryChange: function(){
      var ds = this.model.get('datasource');
      var cField = this.model.get('category_field');
      var qField = this.model.get('quantity_field');
      if (cField && qField){
        this.showChart();
        ds.set('loading', true);
        ds.getData();
      }
      else{
        this.showInstructions();
      }
    },


    onDatasourceDataChange: function(){
      // Update the chart's data.
      var data = this.model.get('datasource').get('data');
      this.model.get('chart').set('data', data);

      var cField = this.model.get('category_field');
      var qField = this.model.get('quantity_field');

      // Don't do anything else if data is blank.
      if (! data.length > 0){
        return;
      }

      // Otherwise...

      // If currently selected category field is numeric, update min/max if auto
      // is set.
      if (cField && cField.get('value_type') == 'numeric'){
        var entity = cField.get('entity');
        var setObj = {};
        $.each(['min', 'max'], function(i, minmax){
          if (entity.get(minmax + 'auto')){
            setObj[minmax] = (minmax == 'min') ? data[0].min : data[data.length - 1].max;
          }
        })
        // Update category field min/max.
        this.disconnectCategoryField(cField);
        cField.get('entity').set(setObj);
        this.connectCategoryField(cField);
      }

    },

    onDatasourceLoadingChange: function(){
      var loading = this.model.get('datasource').get('loading');
      var _this = this;
      if (loading){
        this.$loading_animation.fadeIn(400);
      }
      else{
        this.$loading_animation.fadeOut(800);
      }
    },

    showInstructions: function(){
      $('.chart-container > .chart',  this.el).css('visibility', 'hidden');
      $('.chart-container > .instructions',  this.el).css('visibility', 'visible');
    },

    showChart: function(){
      $('.chart-container > .chart',  this.el).css('visibility', 'visible');
      $('.chart-container > .instructions',  this.el).css('visibility', 'hidden');
    },

    onReady: function(){
      _.each(this.subViews, function(v){
        v.trigger('ready');
      });
      this.resize();
      this.resizeStop();

      // If there were fields, update their tabs.
      _.each(['category', 'quantity'], function(fieldCategory){
        var field = this.model.get(fieldCategory + '_field');
        if (field){
          $('.' + fieldCategory + '-field-name', this.el).html(field.get('label'));
        }
      }, this);

      // If there is data, show the chart.
      var data = this.model.get('datasource').get('data');
      if (data && data instanceof Array && data.length > 0){
        this.showChart();
      }
    },

    activate: function(){
    },

    deactivate: function(){
    },

    remove: function(){
      Backbone.View.prototype.remove.apply(this, arguments);
      _.each(this.subViews, function(v){
        v.trigger('remove');
      });

      _.each(['datasource'], function(subModelAttr){
        var subModel = this.model.get(subModelAttr);
        if (subModel){
          subModel.trigger('remove');
          subModel.off();
        }
      }, this);
      this.model.off();
      this.off();
    }

  });

  return ChartEditorView;
});

