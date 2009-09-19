(function($){
	var validate_options = {
		elements: {},
		presence_of: [],
		events: {},
		perform_actions_on: {},
		errors: {},
		fail: {},
		form: null,
		highlighter: {
			pass: function(element){ $(element).removeClass('error') },
			fail: function(element){ $(element).addClass('error') }
		},
		messages: {
			numericality: 'does not meet requirements.',
			length: 'does not meet the correct length.',
			format: 'does not meet the correct format.',
			exclusion: 'does not meet the allowed options.',
			inclusion: 'does not meet the allowed options.'
		}
	};

	/**
	 * stores name value(s) in validate_options.presence_of
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
		var $form = $(this);
		for(var e in validate_options.events)
		{
			$(validate_options.events[e]).each(function(){
			
				var $element = get_element(this);
				if($element)
				{
					$(validate_options.perform_actions_on[this]).each(function(){
						var method = this;
						$element.bind(e, function(){
							method_handler[method]($element[0]);
							highlight_element($element[0]);
						});
					});
				}
			});
		}

		$form.submit(function(event){

			// check if fields are present
			$(validate_options.presence_of).each(function(){
				var $element = get_element(this);
				var options = validate_options.elements[$element[0].name];

				if(!options['message']) options['message'] = 'must be present.';

				if(!($element.val().length > 0))
				{
					validate_options.fail[$element[0].name] = true;
					event.preventDefault();
				}
			});

			// process all events
			for(var e in validate_options.events)
			{
				$(validate_options.events[e]).each(function(){
					var $element = get_element(this);
					$element.triggerHandler(e);
				});
			}
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
			else if(typeof validate_options[a] == 'string')
				msg += validate_options[a];
			else
			{
				msg += "{\n";

				for(var b in validate_options[a])
				{
					msg += "\t"+b+": {\n";

					if($.isArray(validate_options[a][b]))
						msg += "\t\t['"+validate_options[a][b].join('\', \'')+"']\n";
					else if(typeof validate_options[a][b] == 'string')
						msg += validate_options[a][b];
					else
					{
						for(var c in validate_options[a][b])
						{
							msg += "\t\t"+c+": {\n";

							if($.isArray(validate_options[a][b][c]))
								msg += "\t\t\t['"+validate_options[a][b][c].join('\', \'')+"']\n";
							else if(typeof validate_options[a][b][c] == 'string')
								msg += validate_options[a][b][c];

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

	// private methods
	var method_handler = {
		numericality: function(element) {
			validate_options.fail[element.name] = false;

			var options = validate_options.elements[element.name];
			var value = element.value;
			var method = 'numericality';

			if(!!!value.match(/^[\d]*$/))
				validate_options.fail[element.name] = true;
				
			if(options['greater_than'] && !(value>options['greater_than']))
				validate_options.fail[element.name] = true;
			
			if(options['less_than'] && !(value<options['less_than']))
				validate_options.fail[element.name] = true;

			if(options['greater_than_or_equal_to'] && !(value>=options['greater_than_or_equal_to']))
				validate_options.fail[element.name] = true;

			if(options['less_than_or_equal_to'] && !(value<=options['less_than_or_equal_to']))
				validate_options.fail[element.name] = true;

			if(options['equal_to'] && !(value==options['equal_to']))
				validate_options.fail[element.name] = true;

			if(options['odd'] && !(options['odd'] === true && value%2 != 0))
				validate_options.fail[element.name] = true;

			if(options['even'] && !(options['even'] === true && value%2 == 0))
				validate_options.fail[element.name] = true;
		},
		length: function(element) {
			validate_options.fail[element.name] = false;

			var options = validate_options.elements[element.name];
			var value = element.value.length;
			var method = 'length';

			if(options['minimum'] && !(options['minimum'] && value>=options['minimum']))
				validate_options.fail[element.name] = true;
			
			if(options['maximum'] && !(options['maximum'] && value<=options['maximum']))
				validate_options.fail[element.name] = true;

			if(options['is'] && !(options['is'] && value==options['is']))
				validate_options.fail[element.name] = true;

			if(options['within'] && !(options['within'] && $.isArray(options['within']) && options['within'].length == 2 && value>=options['within'][0] && value<=options['within'][1]))
				validate_options.fail[element.name] = true;
		},
		format: function(element) {
			validate_options.fail[element.name] = false;

			var options = validate_options.elements[element.name];
			var value = element.value;
			var method = 'format';

			if(options['with'] && !(options['with'] && !!value.match(options['with'])))
				validate_options.fail[element.name] = true;
		},
		confirmation: function(element) {}, // not coded yet
		uniqueness: function(element) {}, // not coded yet
		exclusion: function(element) {
			validate_options.fail[element.name] = false;

			var options = validate_options.elements[element.name];
			var value = element.value;
			var method = 'exclusion';

			if(options['in'] && !(options['in'] && !$.inArray(value, options['in'])))
				validate_options.fail[element.name] = true;
		},
		inclusion: function(element) {
			validate_options.fail[element.name] = false;

			var options = validate_options.elements[element.name];
			var value = element.value;
			var method = 'inclusion';

			if(options['in'] && !(options['in'] && $.inArray(value, options['in'])))
				validate_options.fail[element.name] = false;
		}
	};

	// helpers
	var merge_objects = function(obj, obj2)
	{		
		for(var i in obj2)
		{
			if(obj[i])
			{
				for(var n in obj2[i])
					obj[i][n] = obj2[i];
			}
			else
				obj[i] = obj2[i];
		}
		return obj;
	}
	
	var store_values = function(name, options, args)
	{
		if(!validate_options.perform_actions_on[name])
			validate_options.perform_actions_on[name] = [];

		$.merge(validate_options.perform_actions_on[name], [args]);
		
		if(!options) options = {};
		if(!options['on']) options['on'] = ['submit'];
		if(!$.isArray(options['on']))
			options['on'] = [options['on']];

		if(options['message'])
			validate_options.messages[args] = options['message'];

		for(var i=0;options.on.length>i;i++)
		{
			var e = options.on[i];
			if(!validate_options.events[e])
				validate_options.events[e] = [];

			if($.inArray(name,validate_options.events[e]))
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

	var highlight_element = function(element)
	{
		if(validate_options.fail[element.name])
			validate_options.highlighter.fail(element);
		else
			validate_options.highlighter.pass(element);
	}
})(jQuery);