//(function(window) {
//'use strict';


/* =============================================================================
                            getViewportHeight()
============================================================================= */


//This is used in inViewport()
function getViewportHeight() {
	const clientHeight = window.document.documentElement['clientHeight'];
	const innerHeight  = window['innerHeight'];

	if( clientHeight < innerHeight ) {
    return innerHeight;
  } else {
    return clientHeight;
  }
}


/* =============================================================================
                               scrollY()
============================================================================= */


function scrollY() {
	return window.pageYOffset || window.document.documentElement.scrollTop;
}


/* =============================================================================
                               getOffset()
============================================================================= */
//Finding element's position relative to the document:
//http://stackoverflow.com/a/5598797/989439


function getOffset(element) {
	let offsetTop  = 0;
	let offsetLeft = 0;


	do {
		if ( !isNaN(element.offsetTop) ) {
			offsetTop += element.offsetTop;
		}
		if ( !isNaN(element.offsetLeft) ) {
			offsetLeft += element.offsetLeft;
		}
	} while ( element = element.offsetParent );


	const offset_object = { top: offsetTop, left: offsetLeft };
	return offset_object;
}


/* =============================================================================
													 	inViewport()
============================================================================= */


////////////////////////////////////////////////////////////////////////////////
//
//
//	This function gets called by class Scroller's init() and scrollPage() methods.
//	It returns a boolean.
//
//	In init() we call:
//
//				if ( !inViewport(section) ){
//					section.classList.add("initial-state-of-section");
//				}
//
//
//	In scrollPage we call:
//
//				if( inViewport(section, self.options.viewportFactor ) ) {
//					section.classList.add("animate");
//				}
//
//
//	The first argument, element, represents a particular section.
//	However, since we want this utility function to be reusable, we just call it element here.
//
//	The second argument, viewportFactor, represents viewportFactor,
//	which is a number between 0 and 1.
//
// 	If 0, the element is considered in the viewport as soon as it enters.
// 	If 1, the element is considered in the viewport only when it's fully inside
// 	value in percentage (1 >= h >= 0)
//
//
////////////////////////////////////////////////////////////////////////////////


function inViewport( element, viewportFactor = 0) {
	const element_offsetHeight = element.offsetHeight;
	const scrolled             = scrollY();
	const viewed               = scrolled + getViewportHeight();
	const element_top          = getOffset(element).top;
	const element_bottom       = element_top + element_offsetHeight;

	//result represents a boolean value: true or false.
	const result = (element_top + element_offsetHeight * viewportFactor) <= viewed && (element_bottom) >= scrolled;

	return result;
}


/* =============================================================================
													extend_object()
============================================================================= */


////////////////////////////////////////////////////////////////////////////////
//
//	This is a helper function used by class Scroller
//	When an instance of class Scroller is created, the second argument passed is
//	an optional options object.
//	In the constructor of class Scroller this happens:
//
//				this.options = extend_object( this.defaults, options );
//
//
//	I'm not sure what additional options one might need to pass.
//	In any case, this is a useful utility function.
//
////////////////////////////////////////////////////////////////////////////////


function extend_object( object_1, object_2 ) {
	for (let key in object_2) {
		if ( object_2.hasOwnProperty(key) ) {
			object_1[key] = object_2[key];
		}
	}

	return object_1;
}


/* =============================================================================
                             class Scroller
============================================================================= */


class Scroller {
	constructor(element, options) {
		this.element  = element;
		this.defaults = {
			////////////////////////////////////////////////////////////////////////////
			//
			// 	The viewportFactor defines how much of the appearing item has to be visible
			// 	in order to trigger the animation. If we'd use a value of 0, this would mean
			// 	that it would add the animation class as soon as the item is in the viewport.
			// 	If we were to use the value of 1, the animation would only be triggered when
			// 	we see all of the item in the viewport (100% of it)
			//
			////////////////////////////////////////////////////////////////////////////
			viewportFactor : 0.3
		};

		this.options = extend_object(this.defaults, options);


		//The last thing the constructor does is call init()
		this.init();
  }


	/* ==============================
					   	init()
	============================== */


	init() {
		//if( Modernizr.touch ) return; //Optional

		//Add additional properties to the instance
		this.sections  = Array.prototype.slice.call( this.element.querySelectorAll( '.section' ) );
		this.didScroll = false; //Presumably a flag to be used later.

		//Store the value of this (i.e., the class), so that we can refer to it within subsequent functions.
		const self = this;


		//The sections already shown...
		this.sections.forEach((section, index) => {
			//If the section is not in the viewport, then add .initial-state-of-section to that section.
			if( !inViewport(section) ) {
				section.classList.add("initial-state-of-section");
			}
		});


		/* =========================== */


		function scrollHandler() {
			if( !self.didScroll ) {
				self.didScroll = true;
				setTimeout(() => { self.scrollPage(); }, 60 );
			}
		}


		/* =========================== */


		function resizeHandler() {
			function delayed() {
				self.scrollPage();
				self.resizeTimeout = null;
			}

			if (self.resizeTimeout) {
				clearTimeout(self.resizeTimeout);
			}

			self.resizeTimeout = setTimeout(delayed, 200);
		}


		/* =========================== */


		window.addEventListener( 'scroll', scrollHandler, false );
		window.addEventListener( 'resize', resizeHandler, false );
	} //End of init()


	/* ==============================
						scrollPage()
	============================== */


	scrollPage() {
		const self = this;

		this.sections.forEach((section, index) => {
			if( inViewport(section, self.options.viewportFactor) ) {
				section.classList.add("animate");
			} else {
				//This adds class initial-state-of-section if it doesn't have it.
				//This will ensure that the items initially in the viewport will also animate on scroll
				section.classList.add("initial-state-of-section");
				section.classList.remove("animate");
			}
		});

		this.didScroll = false;
	}
} //End of class Scroller




//Add to global namespace
//window.scroller = scroller;
//} )( window );
