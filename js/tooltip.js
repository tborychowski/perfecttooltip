/**
 * Perfect Tooltip, v2.0
 *
 * @author	Tomasz Borychowski
 * @url http://tborychowski.github.com/perfecttooltip
 *
 */

(function (window) {
	'use strict';

	var
		defaults = {
			text: '',
			cls: '',
			position: 'bottom',		// default position
			forcePosition: false,
			animate: false,
			trigger: 'hover',
			showDelay: 200,
			screenMargin: 10,
			targetDistance: 7,
			dontHideOnTooltipHover: false
		},
		winOff = {
			width: window.innerWidth,
			height: window.innerHeight,
			scrollLeft: window.scrollX,
			scrollTop: window.scrollY
		},
		eventHandler,
		hideHandler,
		getOffsets = function (el) {
			var off = el.getBoundingClientRect ? el.getBoundingClientRect() : {};
			return {
				left: off.left || 0,
				top: off.top || 0,
				width: off.width || 0,
				height: off.height || 0,
				right: off.left + off.width,
				bottom: off.top + off.height
			};
		},

		onTop = function (targetOff, tooltipOff, dist) { return targetOff.top - dist - tooltipOff.height + winOff.scrollTop; },
		onBottom = function (targetOff, tooltipOff, dist) { return targetOff.bottom + dist + winOff.scrollTop; },
		toRight = function (targetOff, tooltipOff, dist) { return targetOff.right + dist + winOff.scrollLeft; },
		toLeft = function (targetOff, tooltipOff, dist) { return targetOff.left - dist - tooltipOff.width + winOff.scrollLeft; },
		inCenter = function (targetOff, tooltipOff) { return targetOff.left + (targetOff.width - tooltipOff.width) / 2 + winOff.scrollLeft; },
		inMiddle = function (targetOff, tooltipOff) { return targetOff.top + (targetOff.height - tooltipOff.height) / 2 + winOff.scrollTop; };



	var Tooltip = function (cfg) {
		if (!(this instanceof Tooltip)) return new Tooltip(cfg);
		this.cfg = Object.assign({}, defaults, cfg || {});
		return this.init();
	};


	Tooltip.prototype.init = function () {
		eventHandler = this.onMouseOver.bind(this);
		document.addEventListener('mouseover', eventHandler, false);
		return this;
	};


	Tooltip.prototype.onMouseOver = function (ev) {
		var target = ev.target;
		if (target.classList.contains('has-tooltip')) this.show(target);
	};


	Tooltip.prototype.show = function (el) {
		this.target = el;
		hideHandler = this.hide.bind(this);
		this.target.addEventListener('mouseout', hideHandler, false);

		this.create();
		if (!this.text) return null;

		// console.log(this.tooltip);
		return this.align();
	};


	Tooltip.prototype.create = function () {
		this.text = this.target.title || this.target.dataset.title || '';
		if (!this.text) return null;

		this.target.dataset.title = this.text;
		this.target.removeAttribute('title');

		this.tooltip = document.createElement('div');
		this.tooltip.className = 'tooltip';
		this.tooltip.innerHTML = this.text;
		document.body.appendChild(this.tooltip);
		return this;
	};


	Tooltip.prototype.hide = function () {
		this.target.removeEventListener('mouseout', hideHandler);
		if (this.tooltip) this.tooltip.remove();
		return this;
	};





	Tooltip.prototype.align = function () {
		var t = -1000, l = -1000, pos = 'b';
		var targetOff = getOffsets(this.target);
		var tooltipOff = getOffsets(this.tooltip);

		var posHandler = {
			top: function () {
				t = onTop(targetOff, tooltipOff, this.cfg.targetDistance);
				l = inCenter(targetOff, tooltipOff);
			},
			bottom: function () {
				t = onBottom(targetOff, tooltipOff, this.cfg.targetDistance);
				l = inCenter(targetOff, tooltipOff);
			},
			left: function () {
				t = inMiddle(targetOff, tooltipOff);
				l = toLeft(targetOff, tooltipOff, this.cfg.targetDistance);
			},
			right: function () {
				t = inMiddle(targetOff, tooltipOff);
				l = toRight(targetOff, tooltipOff, this.cfg.targetDistance);
			}
		};

		posHandler[this.cfg.position].call(this);


		// too far to the top - put tooltip below element
		if (t < 0) {
			t = onBottom(targetOff, tooltipOff, this.cfg.targetDistance);
			pos = 'b';
		}
		else if (t + tooltipOff.height > winOff.height + winOff.scrollTop) {
			t = onTop(targetOff, tooltipOff, this.cfg.targetDistance);
			pos = 't';
		}

		// too far to the left - put tooltip on the start of screen
		if (l < this.screenMargin + winOff.scrollLeft) {
			l = this.screenMargin + winOff.scrollLeft;
			pos += 'r';
		}

		// too far to the right - put tooltip to the left of the target
		if (l + tooltipOff.width + this.screenMargin - winOff.scrollLeft > winOff.width) {
			l = winOff.width - tooltipOff.width - this.screenMargin + winOff.scrollLeft;
			pos += 'l';

			// keep tooltip on target
			if (l < targetOff.left - tooltipOff.width) l = targetOff.left - tooltipOff.width;
		}


		this.tooltip.style.top = t + 'px';
		this.tooltip.style.left = l + 'px';
		this.tooltip.classList.add('tooltip-' + pos);

		console.log(t, l, this.tooltip);
		return this;
	};


	Tooltip.prototype.destroy = function () {
		if (eventHandler) document.removeEventListener('mouseover', eventHandler);
		return this;
	};


	window.Tooltip = Tooltip;
}(window));
