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

      this.opts = $.extend({}, {
        maxClasses: 10
      }, opts);

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
      var _this = this;
      var $text = $(e.target);
      var rawVal = $text.val();
      var parsedVal = parseInt(rawVal);
      var exceedsMax = false;
      var maxMsg = '';
      if (this.opts.maxClasses != null){
        exceedsMax = (parsedVal > this.opts.maxClasses);
        maxMsg = ', <= ' + this.opts.maxClasses;
      }

      if (! $.isNumeric(parsedVal) || parsedVal < 1 || exceedsMax){
        var $errorMsg = $('<span>Must be an integer > 1' + maxMsg + ' <a href="javascript:{}">undo</a></span>');
        $('a', $errorMsg).on('click', function(){
          _this.setNumClasses();
          $text.errorTip('remove');
        });
        $text.errorTip('show', $errorMsg);
        return;
      }
      $text.errorTip('remove');
      this.entity.set('num_classes', parsedVal);
    },

    remove: function(){
      NumericFieldView.prototype.remove.apply(this, arguments);
      CategoryFieldView.prototype.remove.apply(this, arguments);
    }
  });

  return NumericCategoryFieldView;
});
