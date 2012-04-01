/**
 * Perfect Tooltip, v1.1
 *
 * @author	Tomasz Borychowski
 * @url http://herhor.github.com/perfecttooltip
 * 
 * Usage:
 *   $('selector').tooltip();
 *   $('selector').tooltip('text');
 *   $('selector').tooltip({ text: 'text', position: 'br' });
 *   $('selector').tooltip('_destroy');								// to remove the tooltip
 *
 * Creates a tooltip instance: $('selector').tooltip(conf)
 *
 * @param conf {Object}				tooltip config object:
 *    text {String}						tooltip text (can be html)
 *    position {String}					tooltip position in relation to the target (selector) it can be 1 of the following: 
 *                              		- 'auto' or 'default' (or not set) to auto calculate the position
 *                              		- tl, t, tr, bl, b, br, lt, l, lb, rt, r, rb - to force a particular position
 *                                      if tooltip goes out of the screen - the position will be auto-updated to show it in a viewport
 * 										(to enforce the position use "forcePosition" instead)
 *    forcePosition {Boolean}			true to enforce the position even if tooltip goes out of the screen
 *    animate {Bool|Int}				animate fadeIn/Out, defaults to false (IE always false), it can be also an anim speed in milisec
 *    trigger {String}					show tooltip event listener [hover|click|manual], defaults to 'hover'
 *    showDelay {int}					delay showing the tooltip for x miliseconds, defaults to 100
 *    dontHideOnTooltipHover {Bool}		don't hide the tooltip when mouse is over it
 * @returns								a tooltip instance
 */
 
;(function($){ $.fn.tooltip = function(options){
	var config = {}, 
		defaults = { 
			text: '',
			cls: '',
			position: 'default', 
			forcePosition: false,
			animate: false,
			trigger: 'hover',
			showDelay: 200,
			dontHideOnTooltipHover: false
		};
	options = options || {};
	if (typeof options === 'string' && options !== '_destroy') options = { text: options };			// if just text given - make it a text
	if (typeof options.showDelay !== 'number') delete options.showDelay;							// if not number - remove and use default
	$.extend(config, defaults, options);

	
	var Tooltip = function(conf){
		this.conf = conf;																			// cache references to frequently used objects
		this.target = this.conf.target;
		this.win = $(window);
		this.doc = $(document);
		this.animSpeed = 0;
		this.targetDistance = 7;
		this.screenMargin = 0;
		
		if (!navigator.userAgent.match(/msie/i) && this.conf.animate){								// don't animate in IE, else show as in conf
			this.animSpeed = (typeof this.conf.animate == 'number' ? this.conf.animate : 300);
		}
		
		var self = this, 
			timestamp = +new Date(), 
			tooltipId = 'tooltip'+timestamp, 
			eventNS = '.tooltip',
			showEvent = 'mouseenter';
		
		if (typeof this.conf.trigger === 'string'){
			showEvent = (this.conf.trigger == 'hover' ? 'mouseenter' : this.conf.trigger);
		}
		
		if (this.conf.text) this.text = this.conf.text;												// tooltip from config
		else if (this.target[0] && this.target[0].title) this.text = this.target[0].title;			// tooltip from title
		else return null;
		
		this.destroy();																				// destroy previous tooltip if any
		
		this.target.attr('title', this.text);
		this.tooltip = $('<div id="'+tooltipId+'">'+this.text+'</div>').appendTo('body').hide();	
		
		if (this.target.length) this.target.data('tooltipId', tooltipId).off(eventNS)				// clean old listeners
			.on(showEvent+eventNS, function(e){self.show.call(self,e,this);})						// add new ones
			.on('mouseleave'+eventNS, function(e){self.hide.call(self,e,this);})
			.on('destroyed'+eventNS, function(){ self.destroy.call(self); });
			
		if (this.conf.dontHideOnTooltipHover === true) this.tooltip.off(eventNS)
			.on('mouseenter'+eventNS, function(e){self.dontHide.call(self,e,this);})
			.on('mouseleave'+eventNS, function(e){self.hide.call(self,e,this);});
		return this;
	};

	
	Tooltip.prototype.show = function(){ 
		if (this.target&&this.target.length){ 														// using .attr doesn't work in IE8
			if (this.target[0].title && this.text != this.target[0].title){
				this.tooltip.html(this.text = this.target[0].title);
			}
			this.target[0].title="";
		}
		if (this.tooltip.is(':hidden')){
			this.align()
				.fadeTo(0,0)
				.show()
				.clearQueue()
				.stop()
				.delay(this.conf.showDelay)
				.fadeTo(this.animSpeed, 1, $.proxy(this.align, this));								// re-align after show
		}
		else this.align().clearQueue().stop().fadeTo(this.animSpeed,1); 
	};
	
	
	Tooltip.prototype.hide = function(){ 
		var self = this, 
			animSpeed = (this.conf.dontHideOnTooltipHover?this.animSpeed+100:this.animSpeed);
		this.tooltip.clearQueue().stop().fadeTo(animSpeed,0,function(){
			self.tooltip.hide();
			if (self.target && self.target.length) self.target[0].title = self.text;
		}); 
	};
	
	Tooltip.prototype.dontHide = function(){ this.tooltip.clearQueue().stop().fadeTo(0,1); };

	
	Tooltip.prototype.align = function(keepOnScreen){
		var position = this.conf.position, 
			targetOff = this.target.offset(), 
			targetW = this.target.outerWidth(), 
			targetH = this.target.outerHeight(),
			win = { 
				width: this.win.width(), 
				height: this.win.height(), 
				scrollLeft: this.doc.scrollLeft(), 
				scrollTop: this.doc.scrollTop()
			},
			target = { 
				l: targetOff.left, 
				t: targetOff.top, 
				r: targetOff.left + targetW, 
				b: targetOff.top + targetH, 
				w: targetW, h: targetH 
			},
			tooltip = { 
				w: this.tooltip.outerWidth(), 
				h: this.tooltip.outerHeight() 
			};

		tooltip.left = target.l + (target.w - tooltip.w)/2;											// center tooltip on target
		tooltip.top = target.t + (target.h - tooltip.h)/2;

		if (position == 'default' || position == 'auto' || keepOnScreen === true){					// default - auto calculate
			tooltip.left = target.l + (target.w - tooltip.w)/2;										// assuming normal position - below target
			tooltip.top = target.t + target.h + this.targetDistance;
			position = '';
			if (tooltip.top + tooltip.h + this.screenMargin - win.scrollTop > win.height){ 			// too far to the bottom - put tooltip above element
				tooltip.top = target.t - tooltip.h - this.targetDistance; 
				position += 't'; 
			}
			else position += 'b';
			if (tooltip.left < this.screenMargin + win.scrollLeft){ 								// too far to the left - put tooltip to the right of the target
				tooltip.left = this.screenMargin + win.scrollLeft; 
				position += 'r'; 
			}
			
			if (tooltip.left + tooltip.w + this.screenMargin - win.scrollLeft > win.width){ 		// too far to the right - put tooltip to the left of the target
				tooltip.left = win.width - tooltip.w - this.screenMargin + win.scrollLeft; 
				position += 'l';
				if (tooltip.left < target.l - tooltip.w) {
					tooltip.left = target.l  - tooltip.w;											// keep tooltip on target
				}
			}		
		}	
		
		var cls = ['tooltip', (this.conf.cls || ''), 'tooltip-'+position[0]];						// position the tooltip
		switch(position[0]){
			case 't' : tooltip.top	= target.t - tooltip.h - this.targetDistance;	break;
			case 'b' : tooltip.top	= target.b + this.targetDistance;				break;
			case 'l' : tooltip.left	= target.l - tooltip.w - this.targetDistance;	break;
			case 'r' : tooltip.left	= target.r + this.targetDistance;				break;
		}
		if (position[1]){
			cls.push('tooltip-'+position[0]+position[1]);
			switch(position[1]){
				case 't' : tooltip.top	= target.b - tooltip.h - target.h/2 + 14;	break;
				case 'b' : tooltip.top	= target.t + target.h/2 - 14; 				break;
				case 'r' : tooltip.left	= target.l + target.w/2 - 14;				break;
				case 'l' : tooltip.left	= target.r - tooltip.w - target.w/2 + 14;	break;
			}
		}	
		this.tooltip.attr('class', cls.join(' ')).css(tooltip);
		
		// if forcePosition != true -> check if on screen and realign if necessary
		if (this.conf.forcePosition !== true && keepOnScreen !== true){
			var isOnScreen = true;
			if (tooltip.top + this.screenMargin < win.scrollTop) isOnScreen = false;						// above screen
			if (tooltip.top + tooltip.h + this.screenMargin - win.scrollTop > win.height) isOnScreen = false;	// below screen
			if (tooltip.left < this.screenMargin + win.scrollLeft) isOnScreen = false;							// too far to the left
			if (tooltip.left + tooltip.w + this.screenMargin - win.scrollLeft > win.width) isOnScreen = false; 	// too far to the right
			if (isOnScreen === false) return this.align(true);
		}
		
		return this.tooltip;
	};	
	
	
	Tooltip.prototype.destroy = function(){
		if(this.target)this.target.off('.tooltip');
		if(this.tooltip)this.tooltip.remove();
	};
	
	
	return $(this).each(function(){
		var element = $(this);
		if (options === '_destroy'){
			$('#'+element.data('tooltipId')).remove();												// remove tooltips
			element.off('.tooltip').removeData('tooltipId');										// remove event listeners from targets
		}
		else {
			config.target = element;
			new Tooltip(config);
		}
	});
};})(jQuery);





/**
 * Provides a destroyed event on an element.
 * <p>
 * The destroyed event is called when the element is removed as a result of jQuery DOM manipulators like remove, html,
 * replaceWith, etc. Destroyed events do not bubble, so make sure you don't use live or delegate with destroyed events.
 * </p>
 * <h2>Example</h2>
 * @codestart
 * $(".foo").bind("destroyed", function(){ clean up code });
 * @codeend
 */
;(function($){
	var oldClean = jQuery.cleanData;
	$.cleanData = function(elems){ for(var i=0,elem;(elem=elems[i++])!==undefined;) $(elem).triggerHandler("destroyed"); oldClean(elems); };
})(jQuery);