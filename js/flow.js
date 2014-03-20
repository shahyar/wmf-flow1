/*!
 * Runs Flow code, using methods in FlowUI.
 */

( function ( $ ) {
	// Pretend we got some data and run with it
	var mockData = {
		board: 'lol',

		workflows: { // boards / topics / replies
			'lol': {
				header: {
					time_updated: +new Date, // timestamp
						author_id: 'en1', // wiki+id
						content: '<p>lorry ippy su</p>', // html
						revid: 1
				},
				topics: ['rqx495tvz888x5ur','rqx495tvz888x5uv'], // workflow uuids
					topic_count: 3,
				sort_order: 'desc', // (might need parsing)
				urls: { history: '#' }
			},

			'rqx495tvz888x5ur': { // uuid
				replies: ['rqx495tvz888x5ut'], // reply ids
				reply_count: 2,
				state: '', // blank, closed, hidden, [to be deleted: deleted, suppressed]
				start_time: +new Date, // parsed from UUID (first 44 bits): parseInt( parseInt( uuid, 36 ).toString( 2 ).substr( 0, 41 ), 2 );
				updated_time: +new Date,
				author_id: 'en1', // wiki+id
				content: 'discussion title', // text
				revid: 3
			},

			'rqx495tvz888x5ut': {
				replies: ['rqx495tvz888x5uu'], // reply ids
				reply_count: 1,
				state: '', // blank, closed, hidden, [to be deleted: deleted, suppressed]
				start_time: +new Date, // parsed from UUID (first 44 bits): parseInt( parseInt( uuid, 36 ).toString( 2 ).substr( 0, 41 ), 2 );
				updated_time: null,
				author_id: 'en1', // wiki+id
				content: '<p>lorem ipsum...</p>', // html
				revid: 0
			},

			'rqx495tvz888x5uu': {
				replies: [], // reply ids
				reply_count: 0,
				state: '', // blank, closed, hidden, [to be deleted: deleted, suppressed]
				start_time: +new Date, // parsed from UUID (first 44 bits): parseInt( parseInt( uuid, 36 ).toString( 2 ).substr( 0, 41 ), 2 );
				updated_time: +new Date,
				author_id: 'en2', // wiki+id
				content: '<p>dolor sit amet!</p>', // html
				revid: 1
			},

			'rqx495tvz888x5uv': {
				replies: [], // reply ids
				reply_count: 0,
				state: '', // blank, closed, hidden, [to be deleted: deleted, suppressed]
				start_time: +new Date, // parsed from UUID (first 44 bits): parseInt( parseInt( uuid, 36 ).toString( 2 ).substr( 0, 41 ), 2 );
				updated_time: null,
				author_id: 'en3', // wiki+id
				content: 'cool story', // text
				revid: 0
			}
		},

		authors: {
			'en1': { // wiki+id
				// user might be moderated, so this info may be redacted
				name: 'shaggy yar',
				gender: 'male',
				wiki: 'enwiki'
			},

			'en2': { // wiki+id
				// user might be moderated, so this info may be redacted
				name: 'lady of the night',
				gender: 'female',
				wiki: 'enwiki'
			},

			'en3': { // wiki+id
				// user might be moderated, so this info may be redacted
				name: 'suppressed',
				gender: null,
				wiki: null
			}
		}
	};

	/*
	 * Now do stuff
	 * @todo not this
	 */
	$( document ).ready( function () {
		$( mw.flow.TemplateEngine.processTemplate( 'flow_board', mockData ) ).insertBefore( '#flow_board-partial' );

		mw.flow.initComponent( $( '.flow-component' ) );
	} );
}( jQuery ) );

// temp @todo remove
document.getElementsByTagName('html')[0].className = 'client-js';