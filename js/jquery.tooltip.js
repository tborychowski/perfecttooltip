/**
 * Perfect Tooltip, v1.4
 *
 * @author	Tomasz Borychowski
 * @url http://tborychowski.github.com/perfecttooltip
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
 *		text {String}					tooltip text (can be html)
 *		position {String}				tooltip position in relation to the target (selector) it can be 1 of the following:
 *										- 'auto' or 'default' (or not set) to auto calculate the position
 *										- tl, t, tr, bl, b, br, lt, l, lb, rt, r, rb - to force a particular position
 *										if tooltip goes out of the screen - the position will be auto-updated to show it
 *										in a viewport (to enforce the position use "forcePosition" instead)
 *		forcePosition {Boolean}			true to enforce the position even if tooltip goes out of the screen
 *		animate {Bool|Int}				animate fadeIn/Out, defaults to false (IE always false), it can be also an anim speed
 *										in milisec
 *		trigger {String}				show tooltip event listener [hover|click|manual], defaults to 'hover'
 *		showDelay {int}					delay showing the tooltip for x miliseconds, defaults to 100
 *		dontHideOnTooltipHover {Bool}	don't hide the tooltip when mouse is over it
 *		cls {String}				    additional css class for the tooltip
 *		selector {String}				if not empty - tooltip will be attached to the target but event will be filtered
 *                                      by this selector
 *		lazy {Bool}						if true - markup is created only when mouse is over the target
 *
 * @returns								a tooltip instance
 */

(function ($) {
	'use strict';

	var

	defaults = {
		text: '',
		cls: '',
		position: 'default',
		forcePosition: false,
		animate: false,
		trigger: 'hover',
		showDelay: 200,
		dontHideOnTooltipHover: false,
		selector: '',
		lazy: true
	},
	eventNS = '.tooltip',

	_getHtml = function (id, text, cls) {
		var styl = 'display:none; position:absolute; -webkit-transform:translateZ(0); transform:translateZ(0px);';
		return '<div id="' + id + '" class="' + (cls || '') + '" style="' + styl + '">' + text + '</div>';
	},

	Tooltip = function (target, conf) {
		var config = {},
			self = this,
			timestamp = +new Date(),
			tooltipId = 'tooltip' + timestamp,
			showEvent = 'mouseenter';

		if (conf && conf.lazy === false) config.lazy = false;

		// if just text given - make it a text
		if (typeof conf === 'string' && conf !== '_destroy') config.text = conf;

		// if not number - remove and use default
		if (conf && typeof conf.showDelay !== 'number') delete conf.showDelay;

		config = $.extend({}, defaults, conf || {}, config);

		// already has a tooltip
		if (target.length && target.data('tooltipId')) return target;

		// cache references to frequently used objects
		this.conf = config;
		this.target = target;
		this.win = $(window);
		this.doc = $(document);
		this.animSpeed = 100;
		this.targetDistance = 7;
		this.screenMargin = 0;
		this.tooltipId = tooltipId;


		// don't animate in IE, else show as in conf
		if (navigator.userAgent.match(/msie/i) || this.conf.animate === false) this.animSpeed = 0;

		if (typeof this.conf.trigger === 'string') {
			showEvent = (this.conf.trigger === 'hover' ? 'mouseenter' : this.conf.trigger);
		}

		// tooltip from config
		if (this.conf.text) this.text = this.conf.text;

		// tooltip from title
		else if (!this.conf.selector && this.target[0] && this.target[0].title) this.text = this.target[0].title;

		else if (!this.conf.selector) return null;

		// destroy previous tooltip if any
		this.destroy();



		/* EVENTS */

		if (this.target.length) {
			if (!this.conf.selector) this.target.attr('title', this.text);
			if (!this.conf.lazy) {
				this.tooltip = $(_getHtml(tooltipId, this.text, this.conf.cls)).appendTo('body');
			}

			this.target.data('tooltipId', tooltipId)
				.off(eventNS)
				.on(showEvent + eventNS, this.conf.selector, function (e) { self.show.call(self, e, this); })
				.on('mouseleave' + eventNS, this.conf.selector, function (e) { self.hide.call(self, e, this); })
				.on('destroyed' + eventNS, this.conf.selector, function () { self.destroy.call(self); });
		}

		if (this.tooltip && this.conf.dontHideOnTooltipHover === true) {
			this.tooltip.off(eventNS)
				.on('mouseenter' + eventNS, function (e) { self.dontHide.call(self, e, this); })
				.on('mouseleave' + eventNS, function (e) { self.hide.call(self, e, this); });
		}

		return this;
	};


	Tooltip.prototype.show = function (ev, el) {
		var self = this;
		this.currentTarget = $(el);
		if (!this.tooltip) {
			this.text = el.title || this.text || '';
			el.title = '';
			this.tooltip = $(_getHtml(this.tooltipId, this.text, this.conf.cls)).appendTo('body');

			if (this.tooltip && this.conf.dontHideOnTooltipHover === true) {
				this.tooltip.off(eventNS)
					.on('mouseenter' + eventNS, function (e) { self.dontHide.call(self, e, this); })
					.on('mouseleave' + eventNS, function (e) { self.hide.call(self, e, this); });
			}
		}

		// using .attr doesn't work in IE8
		if (el) {
			if (el.title && this.text !== el.title) this.tooltip.html(this.text = el.title);
			el.title = '';
		}
		if (this.tooltip.is(':hidden')) {
			setTimeout(function () { self.align.call(self, self.currentTarget); }, 1);
			this.tooltip.stop(true).fadeTo(0, 0).show();
			this.align(this.currentTarget).delay(this.conf.showDelay).fadeTo(this.animSpeed, 1);
		}
		else this.align(this.currentTarget).stop(true).fadeTo(this.animSpeed, 1);
	};


	Tooltip.prototype.hide = function () {
		var self = this, animSpeed = (this.conf.dontHideOnTooltipHover ? this.animSpeed + 100 : this.animSpeed);
		if (!this.tooltip) return;
		this.tooltip.stop(true).fadeTo(animSpeed, 0, function () {
			self.tooltip.hide();
			if (self.currentTarget && self.currentTarget.length) {
				self.currentTarget[0].title = self.text;
			}
			if (self.conf.lazy) {
				self.tooltip.remove();
				self.tooltip = null;
			}
		});
	};

	Tooltip.prototype.dontHide = function () { this.tooltip.stop(true).fadeTo(0, 1); };


	Tooltip.prototype.align = function (el, keepOnScreen) {
		/*jshint white:false */ // - allow for a normal switch-case alignment

		if (!this || !this.tooltip) return;
		var position = this.conf.position,
			targetOff = el.offset(),
			targetW = el.outerWidth(),
			targetH = el.outerHeight(),
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
				w: targetW,
				h: targetH
			},
			tooltip = {
				w: this.tooltip.outerWidth(),
				h: this.tooltip.outerHeight()
			}, cls, isOnScreen;

		// center tooltip on target
		tooltip.left = target.l + (target.w - tooltip.w) / 2;
		tooltip.top = target.t + (target.h - tooltip.h) / 2;

		// default - auto calculate
		if (position === 'default' || position === 'auto' || keepOnScreen === true) {

			// assuming normal position - above target
			tooltip.left = target.l + (target.w - tooltip.w) / 2;
			tooltip.top = target.t - tooltip.h - this.targetDistance;
			position = '';

			// too far to the top - put tooltip below element
			if (win.scrollTop > tooltip.top) {
				tooltip.top = target.t + target.h + this.targetDistance;
				position += 'b';
			}
			else position += 't';

			// too far to the left - put tooltip to the right of the target
			if (tooltip.left < this.screenMargin + win.scrollLeft) {
				tooltip.left = this.screenMargin + win.scrollLeft;
				position += 'r';
			}

			// too far to the right - put tooltip to the left of the target
			if (tooltip.left + tooltip.w + this.screenMargin - win.scrollLeft > win.width) {
				tooltip.left = win.width - tooltip.w - this.screenMargin + win.scrollLeft;
				position += 'l';
				if (tooltip.left < target.l - tooltip.w) {
					// keep tooltip on target
					tooltip.left = target.l  - tooltip.w;
				}
			}
		}

		// position the tooltip
		cls = ['tooltip', (this.conf.cls || ''), 'tooltip-' + position[0]];
		switch (position[0]) {
			case 't' : tooltip.top	= target.t - tooltip.h - this.targetDistance; break;
			case 'b' : tooltip.top	= target.b + this.targetDistance; break;
			case 'l' : tooltip.left	= target.l - tooltip.w - this.targetDistance; break;
			case 'r' : tooltip.left	= target.r + this.targetDistance; break;
		}
		if (position[1]) {
			cls.push('tooltip-' + position[0] + position[1]);
			switch (position[1]) {
				case 't' : tooltip.top	= target.b - tooltip.h - target.h / 2 + 10; break;
				case 'b' : tooltip.top	= target.t + target.h / 2 - 10; break;
				case 'r' : tooltip.left	= target.l + target.w / 2 - 10; break;
				case 'l' : tooltip.left	= target.r - tooltip.w - target.w / 2 + 10; break;
			}
		}
		this.tooltip.attr('class', cls.join(' ')).css(tooltip);

		// if forcePosition != true -> check if on screen and realign if necessary
		if (this.conf.forcePosition !== true && keepOnScreen !== true) {
			isOnScreen = true;

			// above screen
			if (tooltip.top + this.screenMargin < win.scrollTop) isOnScreen = false;

			// below screen
			if (tooltip.top + tooltip.h + this.screenMargin - win.scrollTop > win.height) isOnScreen = false;

			// too far to the left
			if (tooltip.left < this.screenMargin + win.scrollLeft) isOnScreen = false;

			// too far to the right
			if (tooltip.left + tooltip.w + this.screenMargin - win.scrollLeft > win.width) isOnScreen = false;
			if (isOnScreen === false) return this.align(el, true);
		}

		return this.tooltip;
	};


	Tooltip.prototype.destroy = function () {
		if (this.target) this.target.off('.tooltip');
		if (this.tooltip) this.tooltip.remove();
	};


	$.fn.tooltip = function (options) {
		var target = $(this), tt;
		return $(this).each(function () {
			target = $(this);
			if (options === '_destroy') {
				$('#' + target.data('tooltipId')).remove();		// remove tooltips
				target.off('.tooltip').removeData('tooltipId');	// remove event listeners from targets
			}
			else {
				tt = new Tooltip(target, options);
			}
		});
	};
})(jQuery);




/**
 * Provides a destroyed event on an element.
 * <p>
 * The destroyed event is called when the element is removed as a result of jQuery DOM manipulators like remove, html,
 * replaceWith, etc. Destroyed events do not bubble, so make sure you don't use live or delegate with destroyed events.
 * </p>
 * <h2>Example</h2>
 * @codestart
 * $(".foo").bind("destroyed", function () { clean up code });
 * @codeend
 */
(function ($) {
	var oldClean = jQuery.cleanData;
	$.cleanData = function (elems) {
		for (var i = 0, elem; elem = elems[i++] ;)
			$(elem).triggerHandler('destroyed');
		oldClean(elems);
	};
})(jQuery);