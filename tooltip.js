/**
 * Perfect Tooltip, v1.0
 *
 * @author	Tomasz Borychowski
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
 *    showOnClick {Bool}			show the tooltip on Click instead of mouse hover
 *    dontHideOnTooltipHover {Bool}	don't hide the tooltip when mouse is over it
 *    showDelay {int}				delay showing the tooltip for x miliseconds
 * @returns							a tooltip instance
 */
 
;(function($){ $.fn.tooltip = function(conf){
	var Tooltip = function(conf){
		this.conf = conf;
		this.target = this.conf.target;
		this.win = $(window);
		this.doc = $(document);
		this.animSpeed = navigator.userAgent.match(/msie/i)?0:200;									// don't animate in IE
		this.screenMargin = 0;
		this.targetDistance = 7;
		
		var self = this, 
			timestamp = +new Date(), 
			tooltipId = 'tooltip'+timestamp, 
			eventNS = '.tooltip',
			showEvent = (this.conf.showOnClick===true?'click':'mouseenter')+eventNS;
		
		if (this.conf.text) this.text = this.conf.text;												// tooltip from config
		else if (this.target[0] && this.target[0].title) this.text = this.target[0].title;			// tooltip from title
		else return null;
		
		this.target.tooltip('_destroy');															// destroy previous tooltip if any
		this.target.attr('title', this.text);
		this.tooltip = $('<div id="'+tooltipId+'" class="tooltip">'+this.text+'</div>')
			.appendTo('body')
			.hide();	
		
		if (this.target.length) this.target.data('tooltipId', tooltipId).off(eventNS)				// clean old listeners
			.on(showEvent, function(e){self.show.call(self,e,this);})								// add new ones
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
		if (this.tooltip.is(':hidden')) {
			this.align()
				.fadeTo(0,0)
				.show()
				.clearQueue()
				.stop()
				.delay(this.conf.showDelay || 0)
				.fadeTo(this.animSpeed,1);
		}
		else this.align().clearQueue().stop().fadeTo(this.animSpeed,1); 
	};
	Tooltip.prototype.hide = function(){ 
		var self = this;
		this.tooltip.clearQueue().stop().fadeTo(this.animSpeed,0,function(){
			self.tooltip.hide();
			if (self.target&&self.target.length)self.target[0].title=self.text;
		}); 
	};
	Tooltip.prototype.dontHide = function(){ this.tooltip.clearQueue().stop().fadeTo(0,1); };

	Tooltip.prototype.align = function(){
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

		if (position == 'default' || position == 'auto'){											// default - auto calculate
			tooltip.left = target.l + (target.w - tooltip.w)/2;										// assuming normal position - below target
			tooltip.top = target.t + target.h + this.targetDistance;
			position = '';
			if (tooltip.top + tooltip.h + this.screenMargin - win.scrollTop> win.height){ 			// too far to the bottom - put tooltip above element
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
		
		var cls = ['tooltip', 'tooltip-'+position[0]];												// position the tooltip
		switch(position[0]){
			case 't' : tooltip.top = target.t - tooltip.h - this.targetDistance; break;
			case 'b' : tooltip.top = target.b + this.targetDistance; break;
			case 'l' : tooltip.left = target.l - tooltip.w - this.targetDistance; break;
			case 'r' : tooltip.left = target.r + this.targetDistance; break;
		}
		if (position[1]){
			cls.push('tooltip-'+position[0]+position[1]);
			switch(position[1]){
				case 't' : tooltip.top = target.t + target.h/2 - 14; break;
				case 'b' : tooltip.top = target.b - tooltip.h - target.h/2 + 14; break;
				case 'r' : tooltip.left = target.l + target.w/2 - 14; break;
				case 'l' : tooltip.left = target.r - tooltip.w - target.w/2 + 14; break;
			}
		}	
		return this.tooltip.attr('class', cls.join(' ')).css(tooltip);
	};
	Tooltip.prototype.destroy = function(){
		if(this.target)this.target.off('.tooltip');
		if(this.tooltip)this.tooltip.remove();
	};

	return $(this).each(function(){
		var element = $(this), opt = { target: element, position: 'default' };
		if (typeof conf === 'string') opt.text = conf; else $.extend(opt, conf);
		if (conf === '_destroy'){
			$('#'+element.data('tooltipId')).remove();												// remove tooltips
			element.off('.tooltip').removeData('tooltipId');										// remove event listeners from targets
		}
		else new Tooltip(opt);
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