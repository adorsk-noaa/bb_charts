define(
  [
    "jquery",
    "backbone",
    "underscore",
    "ui",
    "_s",
    "./category_field",
    "./numeric_field",
],
function($, Backbone, _, ui, _s, CategoryFieldView, NumericFieldView){

  var NumericCategoryFieldView = CategoryFieldView.extend(NumericFieldView.prototype).extend({

    events: _.extend({}, NumericFieldView.prototype.events, {
      'change .classes-form input[type="text"]': 'onNumClassesChange'
    }),

    initialize: function(opts){

      if (! opts){
        opts = {};
      }
      $(this.el).addClass('numeric-category-field');

      CategoryFieldView.prototype.initialize.apply(this, arguments);
      NumericFieldView.prototype.initialize.apply(this, arguments);

      // Set initial properties on inputs.
      this.setNumClasses();

      // Listen for changes in classes.
      this.entity.on('change:num_classes', function(){this.setNumClasses()}, this);

    },

    initialRender: function(){
      NumericFieldView.prototype.initialRender.apply(this, arguments);
      // Add classes section to form body.
      $classesForm = $('<div class="classes-form"><label>Num. classes: </label><input type="text"></div>');
      $(this.el).append($classesForm);
    },

    setNumClasses: function(){
      $('.classes-form input[type="text"]', this.el).val(this.entity.get('num_classes'));
    },

    onNumClassesChange: function(e){
      var $text = $(e.target);
      var raw_val = $text.val();
      var val = parseFloat(raw_val);
      this.entity.set('num_classes', val);
    },

    remove: function(){
      NumericFieldView.prototype.remove.apply(this, arguments);
      CategoryFieldView.prototype.remove.apply(this, arguments);
    }
  });

  return NumericCategoryFieldView;
});
