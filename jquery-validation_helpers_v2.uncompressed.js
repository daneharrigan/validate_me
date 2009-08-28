(function($){
	var debug = true; // set to false before compressing
	var validate_options = {
		elements: {},
		presence_of: [],
		events: {}
	};
	
	var validates_options = { required: [] };
	var validates_errors = {};

	/**
	 * stores name value(s) in validates_options.required
	 * accepts string or array of strings
	 */
	$.validates_presence_of = function(name) {
		var names = [];
		for(i=0;arguments.length>i;i++)
			$.merge(names, [arguments[i]]);

		$.merge(validate_options.presence_of, names);
	}

	$.validates_numericality_of = function(name, options) { options['method'] = 'numericality'; store_values(name, options) }
	$.validates_length_of = function(name, options) { options['method'] = 'length'; store_values(name, options) }
	$.validates_format_of = function(name, options) { options['method'] = 'format'; store_values(name, options) }
	$.validates_confirmation_of = function(name, options) { options['method'] = 'confirmation'; store_values(name, options) }
	$.validates_uniqueness_of = function(name, options) { options['method'] = 'uniqueness'; store_values(name, options) }

	$.validates_exclusion_of = function(name, options) { options['method'] = 'exclusion'; store_values(name, options) }
	$.validates_inclusion_of = function(name, options) { options['method'] = 'inclusion'; store_values(name, options) }


	$.fn.validate = function()
	{
	}

	$.debug_validates_helpers = function()
	{
		if(!debug) { return null; }

		var msg = '';

		for(var i in validate_options)
		{
			msg += i+': ';

			if($.isArray(validate_options[i]))
				msg += ' [\''+validate_options[i].join('\', \'')+'\'] ';
			else
			{
				msg += "{\n";

				for(var n in validate_options[i])
				{
					msg += "\t"+n+": {\n";

					if($.isArray(validate_options[i][n]))
						msg += "\t\t"+validate_options[i][n].join(', ');

					msg += "\t}\n";
				}

				msg += "}";
			}

			msg+= "\n";
		}
		alert(msg);
	}

	// helpers
	var merge_objects = function(obj, obj2)
	{
		for(var i in obj2)
			obj[i] = obj2[i];
		return obj;
	}
	
	var store_values = function(name, options)
	{
		if(!options) options = {};
		if(!options['on']) options['on'] = ['submit'];
		var obj = {};
		obj[name] = options;
		for(var i=0;options.on.length>i;i++)
			validate_options.events[options.on[i]] = name;
		
		$.merge(validate_options.elements,obj);
	}
})(jQuery);


options = {
	elements: {},
	presence_of: [],
	events: {}
}