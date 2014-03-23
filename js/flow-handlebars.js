/*!
 * Implements a Handlebars layer for FlowBoard.TemplateEngine
 */

var FlowHandlebars = function ( FlowStorageEngine ) {
	var _tplcache = {},
		self = this,
		undefined = ( function () {}() );

	/**
	 *
	 * @param {String} templateName
	 * @returns {Function|bool}
	 */
	this.getTemplate = function ( templateName ) {
		if ( _tplcache[templateName] ) {
			// Return cached compiled template
			return _tplcache[templateName];
		}

		// Find other templates in the page and compile them
		$( 'script[type="text/x-handlebars-template"]' ).each( function () {
			var $this = $( this ),
				id = $this.attr( 'id' ).replace( '-partial', '');

			self.registerTemplate( id, $this.html() );

			//$this.remove();
		} );

		return _tplcache[ templateName ] || false;
	};

	/**
	 *
	 * @param {String} templateName
	 * @param {*} [args]
	 * @returns {*}
	 */
	this.processTemplate = function ( templateName, args ) {
		return this.getTemplate( templateName )( args );
	};

	this.registerTemplate = function ( templateName, html ) {
		// Compile this template once.
		_tplcache[ templateName ] = Handlebars.compile( html );

		// Overwrite Handlebars' partials with our template cache instead. Much easier.
		Handlebars.partials = _tplcache;
		//Handlebars.registerPartial( name, html );

		return _tplcache[ templateName ];
	};

	// @todo remove and replace with mw.message || $.noop
	mw.message = mw.message || function ( str ) {
		var strings = ( {
			"No_header": "This talk page has no header.",
			"Reply": "Reply",
			"Edit": "Edit",
			"Newest_topics": "Newest topics",
			"Small_topics": "Small topics",
			"Topics_only": "Topics only",
			"Topics_and_posts": "Topics and posts",
			"Topics": "Topics",
			"Load_More": "Load More",
			"Start_a_new_topic": "Start a new topic",
			"topic_details_placeholder": "Add some details, if you'd like.",
			"Cancel": "Cancel",
			"Preview": "Preview",
			"Add_Topic": "Add Topic",
			"Talk": "Talk",
			"block": "block",
			"Lock": "Lock",
			"Hide": "Hide",
			"Delete": "Delete",
			"Suppress": "Suppress",

			"started_with_participants": function ( context, options ) {
				var author = self.authorBlock( context, options );
				return author.name + " started this topic"
					+ ( context.author_count > 1 ? (
						", with " + ( context.author_count - 1 ) + " other participant"
						+ ( context.author_count > 2 ? 's' : '' )
					) : '' );
			},
			"topic_count_sidebar": function ( context, options ) {
				return "Showing " + context.topics.length + " of " + context.topic_count + " topics attached to this page";
			},
			"Reply_to_author_name": function ( context, options ) {
				return "Reply to " + self.authorBlock( context, options ).name;
			},
			"comment_count": function ( context, options ) {
				return context.reply_count + " comment" + ( !context.reply_count || context.reply_count > 1 ? 's' : '' )
			},

			"topic_TOU": self.html( 'By clicking add topic, you agree to our <a rel="nofollow" class="external text" href="//wikimediafoundation.org/wiki/Terms_of_use">Terms of Use</a> and agree to irrevocably release your text under the <a rel="nofollow" class="external text" href="//creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0 License</a> and <a rel="nofollow" class="external text" href="//en.wikipedia.org/wiki/Wikipedia:Text_of_the_GNU_Free_Documentation_License">GFDL</a>.' ),
			"reply_TOU": self.html( 'By clicking reply, you agree to our <a rel="nofollow" class="external text" href="//wikimediafoundation.org/wiki/Terms_of_use">Terms of Use</a> and agree to irrevocably release your text under the <a rel="nofollow" class="external text" href="//creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0 License</a> and <a rel="nofollow" class="external text" href="//en.wikipedia.org/wiki/Wikipedia:Text_of_the_GNU_Free_Documentation_License">GFDL</a>.' ),

			"_time": function ( seconds_ago ) {
				var str = ' second',
					new_time = seconds_ago;

				if ( seconds_ago >= 604800 ) {
					new_time = seconds_ago / 604800;
					str = ' week';
				} else if ( seconds_ago >= 86400 ) {
					new_time = seconds_ago / 86400;
					str = ' day';
				} else if ( seconds_ago >= 3600 ) {
					new_time = seconds_ago / 3600;
					str = ' hour';
				} else if ( seconds_ago >= 60 ) {
					new_time = seconds_ago / 60;
					str = ' minute';
				}

				return Math.floor( new_time ) + str + ( new_time < 1 || new_time >= 2 ? 's' : '' );
			},
			"time_ago": function ( seconds_ago ) { return this._time( seconds_ago ) + " ago"; },
			"active_ago": function ( seconds_ago ) { return "Active " + this.time_ago( seconds_ago ); },
			"started_ago": function ( seconds_ago ) { return "Started " + this.time_ago( seconds_ago ); },
			"edited_ago": function ( seconds_ago ) { return "Edited " + this.time_ago( seconds_ago ); },

			"datetime": function ( timestamp ) {
				return ( new Date( timestamp ) ).toLocaleString();
			}
		} ),
			result = strings[ str ];

		if ( Object.prototype.toString.call( result ) === '[object Function]' ) {
			// Callable; return the result of callback(arguments)
			result = result.apply( strings, Array.prototype.slice.call( arguments, 1 ) );
		}

		// Return the result string
		return { text: function () { return result; } };
	};

	/**
	 * yes.
	 * @example {{l10n reply_count 12}}
	 * @param {String} str
	 * @param {...*} [args]
	 * @param {Object} [options]
	 * @returns {String}
	 */
	this.l10n = function ( str, args, options ) {
		var res = mw.message.apply( mw, arguments ).text();

		if ( !res ) {
			mw.flow.debug( "[l10n] Empty String", arguments );
			return "(l10n:" + str + ")";
		}

		return res;
	};

	// Register l10n
	Handlebars.registerHelper( 'l10n', this.l10n );

	/**
	 * Generates markup for an "nnn sssss ago" and date/time string.
	 * @example {{timestamp start_time "started_ago"}}
	 * @param {int} timestamp
	 * @param {String} str
	 * @param {bool} [timeAgoOnly]
	 * @returns {String|undefined}
	 */
	this.timestamp = function ( timestamp, str, timeAgoOnly ) {
		if ( isNaN( timestamp ) || !str ) {
			mw.flow.debug( '[timestamp] Invalid arguments', arguments);
			return;
		}

		var seconds_ago = ( +new Date() - timestamp ) / 1000,
			time_ago;

		if ( seconds_ago < 2419200 ) {
			// Return "n ago" for only dates less than 4 weeks ago
			time_ago = self.l10n( str, seconds_ago );

			if ( timeAgoOnly === true ) {
				// timeAgoOnly: return only this text
				return time_ago;
			}
		} else if ( timeAgoOnly === true ) {
			// timeAgoOnly: return nothing
			return;
		}

		// Generate a GUID for this element to find it later
		var guid = self.generateUID();

		// Store this in the timestamps auto-updater array
		self.timestamp.list.push( { guid: guid, timestamp: timestamp, str: str, failcount: 0 } );

		// Render the timestamp template
		return self.html(
			self.processTemplate(
				'timestamp',
				{
					time_iso: timestamp,
					time_readable: self.l10n( 'datetime', timestamp ),
					time_ago: time_ago,
					guid: guid
				}
			)
		);
	};

	// Register l10n
	Handlebars.registerHelper( 'timestamp', this.timestamp );

	/**
	 * Updates one <time> node at a time every 100ms, until finishing, and then sleeps 5s.
	 * Nodes do not get updated again until they have changed.
	 */
	this.timestamp.autoUpdate = function () {
		var arrayItem,
			currentTime = +new Date() / 1000;

		// Only update elements that need updating (eg. only update minutes every 60s)
		do {
			arrayItem = self.timestamp.list[ self.timestamp.list._currentIndex ];

			if ( !arrayItem || !arrayItem.nextUpdate || currentTime >= arrayItem.nextUpdate ) {
				break;
			}

			// Find the next array item
			self.timestamp.list._currentIndex++;
		} while ( arrayItem );

		if ( !arrayItem ) {
			// Finished array; reset loop
			self.timestamp.list._currentIndex = 0;

			// Run again in 5s
			setTimeout( self.timestamp.autoUpdate, 5000 );
			return;
		}

		var $ago = $( '#' + arrayItem.guid ),
			failed = true,
			secondsAgo = currentTime - ( arrayItem.timestamp / 1000 );

		if ( $ago && $ago.length ) {
			var text = self.timestamp( arrayItem.timestamp, arrayItem.str, true );

			// Returned a valid "n ago" string?
			if ( text ) {
				// Reset the failcount
				failed = arrayItem.failcount = 0;

				// Set the next update time
				arrayItem.nextUpdate = currentTime + ( secondsAgo > 604800 ? 604800 - currentTime % 604800 : ( secondsAgo > 86400 ? 86400 - currentTime % 86400 : ( secondsAgo > 3600 ? 3600 - currentTime % 3600 : ( secondsAgo > 60 ? 60 - currentTime % 60 : 1 ) ) ) );

				// Only touch the DOM if the text has actually changed
				if ( $ago.text() !== text ) {
					$ago.text( text );
				}
			}
		}

		if ( failed && ++arrayItem.failcount > 9 ) {
			// Remove this array item if we failed this 10 times in a row
			self.timestamp.list.splice( self.timestamp.list._currentIndex, 1 );
		} else {
			// Go to next item
			self.timestamp.list._currentIndex++;
		}

		// Run every 100ms until we update all nodes
		setTimeout( self.timestamp.autoUpdate, 100 );
	};

	this.timestamp.list = [];
	this.timestamp.list._currentIndex = 0;

	$( document ).ready( this.timestamp.autoUpdate );

	/**
	 * Do not escape HTML string. Used as a Handlebars helper.
	 * @example {{html "<div/>"}}
	 * @param {String} string
	 * @returns {String|Handlebars.SafeString}
	 */
	this.html = function ( string ) {
		return new Handlebars.SafeString( string );
	};

	// Register html
	Handlebars.registerHelper( 'html', this.html );

	/**
	 * Returns the workflow context using the given context/argument (a string uuid).
	 * @example {{#each topics}}{{#workflow this}}{{content}}{{/workflow}}{{/each}}
	 * @param {String} context
	 * @param {Object} options
	 * @returns {String}
	 */
	this.workflowBlock = function ( context, options ) {
		var workflow = options.data.root.workflows[ context ] || { content: null };
		if ( workflow.id === undefined ) {
			workflow.id = context;
		}
		return options.fn ? options.fn( workflow ) : workflow;
	};

	// Register html
	Handlebars.registerHelper( 'workflow', this.workflowBlock );

	/**
	 * Returns the author context using the current context's author_id key.
	 * @example {{#author this}}{{name}}{{/author}}
	 * @param {Object} context
	 * @param {Object} options
	 * @returns {String}
	 */
	this.authorBlock = function ( context, options ) {
		var author = options.data.root.authors[ context.author_id ] || { name: 'error', gender: null, wiki: null };
		return options.fn ? options.fn( author ) : author;
	};

	// Register html
	Handlebars.registerHelper( 'author', this.authorBlock );

	/**
	 *
	 * @example {{#author this}}{{name}}{{/author}}
	 * @param {Object} context
	 * @param {Object} options
	 * @returns {String}
	 */
	this.url = function ( context, options ) {
		return Array.prototype.pop.apply( arguments );
	};

	// Register html
	Handlebars.registerHelper( 'url', this.url );

	/**
	 *
	 * @example {{formElement this "button" class="mw-ui-sleeper" text='{{l10n "Preview"}}'}}
	 * @param {Object} context
	 * @param {String} type
	 * @param {Object} options
	 * @returns {String}
	 */
	this.formElement = function ( context, type, options ) {
		var hash = options.hash,
			data = {
				tag:         type,
				fieldtype:   null,
				closing_tag: null,
				'class':     hash['class'] || '',
				required:    !!hash.required,
				maxlength:   hash.maxlength,
				pattern:     hash.pattern,
				name:        hash.name,
				value:       hash.value,
				content:     hash.content,
				role:        hash.role || type,
				collapsible: !!hash.collapsible,
				expandable:  !!hash.expandable,
				radio:       false,
				checkbox:    false
			};

		switch ( type ) {
			case 'submit':
			case 'reset':
			case 'button':
				data.tag = 'button';
				data.closing_tag = data.tag;

				// Apply mw-ui- class based on role (or type if role is omitted)
				switch ( hash.role || type ) {
					case 'submit':
					case 'constructive':
						data.fieldtype = 'constructive';
						break;

					case 'action':
					case 'progressive':
						data.fieldtype = 'progressive';
						break;

					case 'regressive':
						data.fieldtype = 'regressive';
						break;

					case 'cancel':
					case 'reset':
					case 'destructive':
						data.fieldtype = 'destructive';
						break;

					default:
						data.fieldtype = 'button';
						break;
				}

				if ( data.fieldtype !== 'button' ) {
					data['class'] = 'mw-ui-' + data.fieldtype + ' ' + data['class'];
				}
				data['class'] = 'mw-ui-button ' + data['class'];
				break;

			case 'color':
			case 'date':
			case 'email':
			case 'number':
			case 'url':
			case 'range':
			case 'time':
				data.validation = true;
				/* fall through */
			case 'text':
			case 'input':
				data.tag = 'input';
				data.fieldtype = type === 'input' ? 'text' : type;
				data.validation = data.validation || data.required || data.min || data.max;
				data.type = type === 'input' ? 'text' : type;
				data['class'] = 'mw-ui-input ' + data['class'];
				data.min = hash.min;
				data.max = hash.max;
				data.step = hash.step;
				data.size = hash.size;
				break;

			case 'textarea':
				data.closing_tag = data.tag;
				data['class'] = 'mw-ui-input ' + data['class'];
				data.validation = true;
				data.rows = hash.rows;
				data.cols = hash.cols;
				break;

			case 'radio':
			case 'checkbox':
				data.tag = 'input';
				data.type = type;
				data.fieldtype = type;
				data.radio = type === 'radio';
				data.checkbox = type === 'checkbox';
				data.validation = true;
				if ( data.content ) {
					data.content = ' ' + data.content;
				}
				break;

			default:
				break;
		}

		if ( hash.placeholder ) {
			data.placeholder = Handlebars.compile( hash.placeholder )( context, options );
		}

		return self.html( self.processTemplate( 'form_element', data ) );
	};

	// Register html
	Handlebars.registerHelper( 'formElement', this.formElement );

	/**
	 *
	 * @example {{generateUID}}
	 * @returns {String}
	 */
	this.generateUID = function () {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g , function ( c ) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : ( r & 0x3 | 0x8 );
			return v.toString( 16 );
		} );
	};

	// Register html
	Handlebars.registerHelper( 'generateUID', this.generateUID );
};