define([
	"jquery",
	"backbone",
	"underscore",
	"ui",
	"_s",
	"Util/validators",
	"Util/qtipUtil",
	"text!./templates/numeric_field_form.html"
		],
function($, Backbone, _, ui, _s, validators, qtipUtil, form_template){

    var NumericFieldView = Backbone.View.extend({

		events: {
			'change .minmax input[type="text"]': 'onMinMaxTextChange',
			'change .minmax input[type="checkbox"]': 'onMinMaxCheckboxChange',
		},

		initialize: function(opts){
			$(this.el).addClass('numeric-field');
			this.entity = this.model.get('entity');
			this.initialRender();

			// Set initial properties on inputs.
			_.each(['min', 'max'], function(minmax){
				this.setMinMaxText(minmax);
				this.setMinMaxCheckbox(minmax);
			},this);

			this.entity.on('change', function(){this.model.trigger('change');}, this);
			this.entity.on('change:min', function(){this.setMinMaxText('min')}, this);
			this.entity.on('change:max', function(){this.setMinMaxText('max')}, this);
			this.entity.on('change:minauto', function(){this.setMinMaxCheckbox('min')}, this);
			this.entity.on('change:maxauto', function(){this.setMinMaxCheckbox('max')}, this);

		},

		initialRender: function(){
			$(this.el).html(
        _.template(
          form_template,
          {model: this.model, entity: this.entity})
      );
		},

		onMinMaxTextChange: function(e){
      var that = this;
      var mm = ['min', 'max'];
      var els = {};
      var rawVals = {};
      var valid = true;

      $.each(mm, function(i, minmax){
        els[minmax] = that.getMinMaxElements(minmax);
        rawVals[minmax] = els[minmax].$text.val();
        // Check for number.
        if (! validators.isNumber(rawVals[minmax])){
          var $errorMsg = $(_s.sprintf(
            '<span>"%s" is not a number. <a href="javascript:{}">undo</a></span>',
            rawVals[minmax]
          ));
          $('a', $errorMsg).on('click', function(){that.setMinMaxText(minmax)});
          els[minmax].$text.errorTip('show', $errorMsg);
          valid = false;
        }
        else{
          els[minmax].$text.errorTip('remove');
        }
      });

      if (! valid){
        return;
      }

      var parsedVals = {};
      $.each(mm, function(i, minmax){
        parsedVals[minmax] = parseFloat(rawVals[minmax], 10);
      });

      if (parsedVals['min'] > parsedVals['max']){
        // @TODO:error message here.
        console.log('badness');
        return;
      }

      this.entity.set(parsedVals);
		},

		setMinMaxText: function(minmax){
			var minmax_els = this.getMinMaxElements(minmax);
			minmax_els.$text.val(this.entity.get(minmax));
			minmax_els.$text.errorTip('remove');
		},

		getMinMaxElements: function(minmax){
			var $minmax_el = $('.minmax.' + minmax, this.el);
			var $cb = $('input[type="checkbox"]', $minmax_el);
			var $t = $('input[type="text"]', $minmax_el);
			return {
				$text: $t,
				$checkbox: $cb
			};
		},

		onMinMaxCheckboxChange: function(e){
			var minmax = $(e.target).data('minmax');
			var minmax_els = this.getMinMaxElements(minmax);
			var auto_attr = minmax + 'auto';
			if (minmax_els.$checkbox.is(':checked')){
				this.entity.set(auto_attr, true);
				minmax_els.$text.attr('disabled', 'true');
				minmax_els.$text.val(this.entity.get(minmax));
        minmax_els.$text.errorTip('remove');
			}
			else{
				minmax_els.$text.removeAttr('disabled');
				this.entity.set(auto_attr, false);
			}
		},

		setMinMaxCheckbox: function(minmax){
			var minmax_els = this.getMinMaxElements(minmax);
			var auto_attr = minmax + 'auto';
			if (this.entity.get(auto_attr)){
				minmax_els.$checkbox.attr('checked', 'checked');
				minmax_els.$text.attr('disabled', 'true');
			}
			else{
				minmax_els.$checkbox.removeAttr('checked');
				minmax_els.$text.removeAttr('disabled');
			}
		}

    });

	return NumericFieldView;
});
		
