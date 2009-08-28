(function($){
	var validates_options = { required: [] };
	var validates_errors = {};

	/**
	 * stores name value(s) in validates_options.required
	 * accepts string or array of strings
	 */
	$.validates_presence_of = function(name) {
		if (typeof name != 'array')
			name = [name];
		$.merge(validates_options.required, name);
	}

	$.validates_numericality_of = function(name, options) {
		if(!options)
			options = {};
		if(!options['on'])
			options['on'] = ['submit'];

		$(options['on']).each(function(i, option){
			var required = '*';
			if($.inArray(name, validates_options.required))
				required = '+';

			var field = $('input[name='+name+']').get(0);
			var element = field;
			if(option == 'submit')
			{
				while(element = $(field).parent())
				{
					if(element.get(0).tagName.toLowerCase() == 'form')
						break;
				}
			}
			$(element).bind(option, function(){
				if(field.value.match('/^[\d]'+required+'$/') == -1)
					add_validation_message(name, 'value was not a number');

				if( (options['greater_than'] && field.value < options['greater_than']) || (options['greater_than_or_equal_to'] && field.value <= options['greater_than_or_equal_to']) )
					add_validation_message(name, 'value was too small');

				if( (options['less_than'] && field.value > options['less_than']) || (options['less_than_or_equal_to'] && field.value >= options['less_than_or_equal_to']) )
					add_validation_message(name, 'value was too large');

				if(options['equal_to'] && field.value != options['equal_to'])
					add_validation_message(name, 'value was not equal to '+options['equal_to']);

				if(options['even'] && options['even'] == true && field.value%2!=0)
					add_validation_message(name, 'value was not even');

				if(options['odd'] && options['odd'] == true && field.value%2==0)
					add_validation_message(name, 'value was not odd');
			});
		});
	}

	$.fn.validate = function()
	{
		$(this).submit(function(event){
			validates_required_fields();

			// temporary code
			var message = '';
			for(msg in validates_errors)
			{
				message += msg+"\n";
				$(validates_errors[msg]).each(function(){
					message += this + "\n";
				});
			}
			alert(message); // temporary

			if($(validates_errors).length>0)
				event.preventDefault();
		});

		/* protected methods */

		/**
		 * processes all elements in validates_options.required
		 * sets values error values if invalid.
		 */
		var validates_required_fields = function()
		{
			var radio_values = {};
			$(validates_options.required).each(function(){
				var name = this;
				$('input[name='+name+'],textarea[name='+name+'],select[name='+name+']').each(function(){
					var tag = this.tagName.toLowerCase();
					if( (tag == 'input' && this.type.toLowerCase() == 'text') || tag == 'textarea' )
					{
						if(!this.value.length>0)
							add_validation_message(name, 'must be provided');
					}
					else if(tag == 'input' && this.type.toLowerCase() == 'radio')
					{
						if(!radio_values[name])
							radio_values[name] = [];
						$.merge(radio_values[name], [this.checked]);

						if($(radio_values[name]).length == $('input[name='+name+']').length && $.inArray(true, radio_values[name]) == -1)
							add_validation_message(name, 'must be provided');
					}
					else if(tag == 'select')
					{
						var selected = false;
						$(this).find('option').each(function(){
							if(this.selected && this.value.length>0)
								selected = true;
						});

						if(!selected)
							add_validation_message(name, 'must be provided');
					}
				});
			});
		}

		var add_validation_message = function(name, message)
		{
			if(!validates_errors[name])
				validates_errors[name] = [];
			$.merge(validates_errors[name], [message]);
		}
	}
	/*
	validates_confirmation_of (ActiveRecord::Validations::ClassMethods)
	validates_exclusion_of (ActiveRecord::Validations::ClassMethods)
	validates_format_of (ActiveRecord::Validations::ClassMethods)
	validates_inclusion_of (ActiveRecord::Validations::ClassMethods)
	validates_length_of (ActiveRecord::Validations::ClassMethods)
	validates_numericality_of (ActiveRecord::Validations::ClassMethods)
	validates_uniqueness_of (ActiveRecord::Validations::ClassMethods)
	*/
})(jQuery);
