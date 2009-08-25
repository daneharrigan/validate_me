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

	$.fn.validate = function()
	{
		$(this).submit(function(event){
			validates_required_fields();

			// temporary code
			var message = '';
			for(msg in validates_errors)
				message += msg+"\n";
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
							if(this.selected)
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