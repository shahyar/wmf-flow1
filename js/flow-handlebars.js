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
	 * @param {Object} [options]
	 * @returns {String|undefined}
	 */
	this.timestamp = function ( timestamp, str, options ) {
		if ( isNaN( timestamp ) || !str ) {
			mw.flow.debug( '[timestamp] Invalid arguments', arguments);
			return;
		}

		var context = {
			time_iso: timestamp,
			time_readable: self.l10n( 'datetime', timestamp ),
			time_ago: null,
			seconds_ago: ( +new Date() - timestamp ) / 1000
		};

		// Return "n ago" for only dates less than 4 weeks ago
		if ( context.seconds_ago < 2419200 ) {
			context.time_ago = self.l10n( str, context.seconds_ago );
		}

		// Render the timestamp template
		return self.html( self.processTemplate( 'timestamp', context ) );
	};

	// Register l10n
	Handlebars.registerHelper( 'timestamp', this.timestamp );

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
};