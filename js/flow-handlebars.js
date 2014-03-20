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

	/**
	 * yes.
	 * @example {{l10n reply_count 12}}
	 * @param {String} string
	 * @param {...*} [args]
	 * @param {Object} context
	 * @returns {*}
	 */
	this.l10n = function ( str, args ) {
		return str; // lol todo
	};

	// Register l10n
	Handlebars.registerHelper( 'l10n', this.l10n );

	/**
	 * Do not escape HTML string. Used as a Handlebars helper.
	 * @example {{html "<div/>"}}
	 * @param {String} string
	 * @returns {String}
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
		var data = options.data.root.workflows[ context ] || { content: null };
		if ( data.id === undefined ) {
			data.id = context;
		}
		return options.fn( data );
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
		return options.fn(
			options.data.root.authors[ context.author_id ] || { name: 'error', gender: null, wiki: null }
		);
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