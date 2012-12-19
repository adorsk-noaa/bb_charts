define(
  [
    "jquery",
    "backbone",
    "underscore",
    "ui",
    "_s",
    "text!./templates/numericAxisEditor.html"
],
function($, Backbone, _, ui, _s, template){
  var NumericAxisEditorView = Backbone.View.extend({
    events: {
      'change .input': 'onInputChange'
    },

    inputAttrs: ['min', 'max', 'min_auto', 'max_auto'],

    initialize: function(opts){
      $(this.el).addClass("numeric-axis-editor");
      this.initialRender();
    },

    initialRender: function(){
      var _this = this;
      $(this.el).html(_.template(template, {model: this.model}));

      // Update inputs.
      $.each(this.inputAttrs, function(i,attr){
        _this.setInput(attr);
      });
    },

    onInputChange: function(e){
      var _this = this;
      var $input = $(e.currentTarget);
      var attr = $input.data('attr');
      var value = null;
      if (attr.indexOf('_auto') !== -1){
        var minmax = attr.substr(0,3);
        var value = $input.is(':checked');
        $('input[type="text"].' + minmax, this.el).each(
          function(i, textEl){
          $(textEl).prop('disabled', value);
        });
      }
      else{
        value = parseFloat($input.val());
      }
      this.model.set(attr, value);
    },

    setInput: function(attr){
      var _this = this;
      var value = this.model.get(attr);
      var $input = $(_s.sprintf('.input.%s', attr), this.el);
      if ($input.length){
        if ($input.attr('type') == 'checkbox'){
          $input.prop('checked', value);
        }
        else{
          $input.val(value);
        }
      }
    }

  });
  return NumericAxisEditorView;
});
