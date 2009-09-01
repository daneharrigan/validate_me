(function($){
	var validate_options = {
		elements: {},
		presence_of: [],
		events: {},
		perform_actions_on: {}
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

	$.validates_numericality_of = function(name, options) { store_values(name, options, 'numericality') }
	$.validates_length_of = function(name, options) { store_values(name, options, 'length') }
	$.validates_format_of = function(name, options) { store_values(name, options, 'format') }
	$.validates_confirmation_of = function(name, options) { store_values(name, options, 'confirmation') }
	$.validates_uniqueness_of = function(name, options) { store_values(name, options, 'uniqueness') }
	$.validates_exclusion_of = function(name, options) { store_values(name, options, 'exclusion') }
	$.validates_inclusion_of = function(name, options) { store_values(name, options, 'inclusion') }


	$.fn.validate = function()
	{
		for(var i in validate_options.events)
		{
			$(this).each(function(){
				var obj;
				alert(this+':'+i);
			});
		}
	}

	$.debug_validates_helpers = function()
	{
		var msg = '';

		for(var a in validate_options)
		{
			msg += a+': ';

			if($.isArray(validate_options[a]))
				msg += ' [\''+validate_options[a].join('\', \'')+'\'] ';
			else
			{
				msg += "{\n";

				for(var b in validate_options[a])
				{
					msg += "\t"+b+": {\n";

					if($.isArray(validate_options[a][b]))
						msg += "\t\t['"+validate_options[a][b].join('\', \'')+"']\n";
					else
					{
						for(var c in validate_options[a][b])
						{
							msg += "\t\t"+c+": {\n";

							if($.isArray(validate_options[a][b][c]))
								msg += "\t\t\t['"+validate_options[a][b][c].join('\', \'')+"']\n";

							msg += "\t\t}\n";
						}	
					}

					msg += "\t}\n";
				}

				msg += "}";
			}

			msg += "\n";
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
	
	var store_values = function(name, options, args)
	{
		if(!validate_options.perform_actions_on[name])
			validate_options.perform_actions_on[name] = [];

		$.merge(validate_options.perform_actions_on[name], [args]);
		
		if(!options) options = {};
		if(!options['on']) options['on'] = ['submit'];
		
		for(var i=0;options.on.length>i;i++)
		{
			var e = options.on[i];
			if(!validate_options.events[e])
				validate_options.events[e] = [];

			$.merge(validate_options.events[e], [name]);
		}

		eval('var obj = { '+name+': options };');
		merge_objects(validate_options.elements, obj);
	}
})(jQuery);