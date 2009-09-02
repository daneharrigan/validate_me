(function($){
	var validate_options = {
		elements: {},
		presence_of: [],
		events: {},
		perform_actions_on: {},
		errors: {},
		form: null
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
							element.bind(e, method_handler[this]);
						});
					}
					else
					{}
				}
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

	var get_element = function(name)
	{
		var el = $(validate_options.form).find('input[name='+name+']');
		if(el.size() == 0)
			el = $(validate_options.form).find('select[name='+name+']');
		if(el.size() == 0)
			el = $(validate_options.form).find('textarea[name='+name+']');
		return el;
	}

	var add_error = function(name, method, message)
	{
		if(!validate_options.errors[name])
			validate_options.errors[name] = {};

		validate_options.errors[name][method] = message;
	}

	var method_handler = {
		numericality: function() {
			var options = validate_options.elements[this.name];
			var value = this.value;
			var method = 'numericality';

			if(!options['message']) options['message'] = 'does not meet requirements.';

			if(!!!value.match(/^[\d]*$/))
				add_error(this.name, options['message']);

			if( !(options['greater_than'] && value>options['greater_than']) )
				add_error(this.name, method, options['message']);

			if( !(options['less_than'] && value<options['less_than']) )
				add_error(this.name, method, options['message']);

			if( !(options['greater_than_or_equal_to'] && value>=options['greater_than_or_equal_to']) )
				add_error(this.name, method, options['message']);

			if( !(options['less_than_or_equal_to'] && value<=options['less_than_or_equal_to']) )
				add_error(this.name, method, options['message']);

			if( !(options['equal_to'] && value==options['equal_to']) )
				add_error(this.name, method, options['message']);

			if( !(options['odd'] && options['odd'] === true && value%2 != 0) )
				add_error(this.name, method, options['message']);

			if( !(options['even'] && options['even'] === true && value%2 == 0) )
				add_error(this.name, method, options['message']);
		},
		length: function() {
			var options = validate_options.elements[this.name];
			var value = this.value.length;
			var method = 'length';

			if(!options['message']) options['message'] = 'does not meet the correct length.';

			if( !(options['minimum'] && value>=options['minimum']) )
				add_error(this.name, method, options['message']);

			if( !(options['maximum'] && value<=options['maximum']) )
				add_error(this.name, method, options['message']);

			if( !(options['is'] && value==options['is']) )
				add_error(this.name, method, options['message']);

			if( !(options['within'] &&
					$.isArray(options['within']) &&
					options['within'].length == 2 &&
					value>=options['within'][0] &&
					value<=options['within'][1])
				)
				add_error(this.name, method, options['message']);

		},
		format: function() {
			var options = validate_options.elements[this.name];
			var value = this.value;
			var method = 'format';

			if(!options['message']) options['message'] = 'does not meet the correct format.';

			if( !(options['with'] && !!value.match(options['with'])) )
				add_error(this.name, method, options['message']);
		},
		confirmation: function() {},
		uniqueness: function() {},
		exclusion: function() {
			var options = validate_options.elements[this.name];
			var value = this.value;
			var method = 'exclusion';

			if(!options['message']) options['message'] = 'does not meet the allowed options.';

			if( !(options['in'] && !$.inArray(value, options['in'])) )
				add_error(this.name, method, options['message']);
		},
		inclusion: function() {
			var options = validate_options.elements[this.name];
			var value = this.value;
			var method = 'inclusion';

			if(!options['message']) options['message'] = 'does not meet the allowed options.';

			if( !(options['in'] && $.inArray(value, options['in'])) )
				add_error(this.name, method, options['message']);
		},
	};
})(jQuery);