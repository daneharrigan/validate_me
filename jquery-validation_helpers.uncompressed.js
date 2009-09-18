(function($){
	var validate_options = {
		elements: {},
		presence_of: [],
		events: {},
		perform_actions_on: {},
		errors: {},
		form: null,
		highlighter: { pass: function(element){ $(element).removeClass('error') }, fail: function(element){ $(element).addClass('error')} }
	};
	
	var validates_options = { required: [] };
	var validates_errors = {}

	/**
	 * stores name value(s) in validates_options.required
	 * accepts string or array of strings
	 */
	$.validates_presence_of = function(name)
	{
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

	$.validate_highligher = function(args)
	{
		if(!args)
			args = {};

		$(['pass','fail']).each(function(){
			if(args[this])
				validate_options.highlighter[this] = args[this];			
		});
	}

	$.fn.validate = function()
	{
		validate_options.form = this;
		for(var e in validate_options.events)
		{
			$(validate_options.events[e]).each(function(){
				var element = get_element(this);
				if(element)
				{
					if(e != 'submit')
					{
						$(validate_options.perform_actions_on[this]).each(function(){
							//element.bind(e, method_handler[this]); // remove after testing
							element.bind(e, function(){
								method_handler[this](element);
								highlight_element(element);
							});
						});
					}
					else
					{}
				}
			});
		}

		$(this).submit(function(event){
			$(validate_options.presence_of).each(function(){
				if(get_element(name).val().length == 0)
					return false;
			});
		});
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

	var get_element = function(name)
	{
		var $form = $(validate_options.form);
		var el = $form.find('input[name='+name+']');
		if(el.size() == 0)
			el = $form.find('select[name='+name+']');
		if(el.size() == 0)
			el = $form.find('textarea[name='+name+']');
		return el;
	}

	var add_error = function(name, method, message)
	{
		if(!validate_options.errors[name])
			validate_options.errors[name] = {};

		validate_options.errors[name][method] = message;
	}

	var remove_error = function(name, method)
	{
		if(validate_options.errors[name][method])
		{
			delete validate_options.errors[name][method];
			var count = 0;
			for(var index in validate_options.errors[name])
				count++;

			if(count == 0)
				delete validate_options.errors[name];
		}
	}

	var highlight_element = function(element)
	{
		if(validate_options.errors[element.name])
			validate_options.highlighter.fail(element);
		else
			validate_options.highlighter.pass(element);
	}

	var error_handler = function(element, command, message)
	{
		if(command)
			remove_error(element.name, method);
		else
			add_error(element.name, message);
	}

	var method_handler = {
		numericality: function(element) {
			var options = validate_options.elements[element.name];
			var value = element.value;
			var method = 'numericality';

			if(!options['message']) options['message'] = 'does not meet requirements.';

			error_handler(element, (!!value.match(/^[\d]*$/)), options['message']);
			error_handler(element, (options['greater_than'] && value>options['greater_than']), options['message']);
			error_handler(element, (options['less_than'] && value<options['less_than']), options['message']);
			error_handler(element, (options['greater_than_or_equal_to'] && value>=options['greater_than_or_equal_to']), options['message']);
			error_handler(element, (options['less_than_or_equal_to'] && value<=options['less_than_or_equal_to']), options['message']);
			error_handler(element, (options['equal_to'] && value==options['equal_to']), options['message']);
			error_handler(element, (options['odd'] && options['odd'] === true && value%2 != 0), options['message']);
			error_handler(element, (options['even'] && options['even'] === true && value%2 == 0), options['message']);
		},
		length: function(element) {
			var options = validate_options.elements[element.name];
			var value = element.value.length;
			var method = 'length';

			if(!options['message']) options['message'] = 'does not meet the correct length.';

			error_handler(element, (options['minimum'] && value>=options['minimum']), options['message']);
			error_handler(element, (options['maximum'] && value<=options['maximum']), options['message']);
			error_handler(element, (options['is'] && value==options['is']), options['message']);
			error_handler(element, (options['within'] && $.isArray(options['within']) && options['within'].length == 2 && value>=options['within'][0] && value<=options['within'][1]), options['message']);
		},
		format: function(element) {
			var options = validate_options.elements[element.name];
			var value = element.value;
			var method = 'format';

			if(!options['message']) options['message'] = 'does not meet the correct format.';

			error_handler(element, (options['with'] && !!value.match(options['with'])), options['message']);
		},
		confirmation: function(element) {}, // not coded yet
		uniqueness: function(element) {}, // not coded yet
		exclusion: function(element) {
			var options = validate_options.elements[element.name];
			var value = element.value;
			var method = 'exclusion';

			if(!options['message']) options['message'] = 'does not meet the allowed options.';

			error_handler(element, (options['in'] && !$.inArray(value, options['in'])), options['message']);
		},
		inclusion: function(element) {
			var options = validate_options.elements[element.name];
			var value = element.value;
			var method = 'inclusion';

			if(!options['message']) options['message'] = 'does not meet the allowed options.';

			error_handler(element, (options['in'] && $.inArray(value, options['in'])), options['message']);
		},
	};
})(jQuery);