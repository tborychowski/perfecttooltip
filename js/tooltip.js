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
		eventHandler, hideHandler;


	function getOffsets (el) {
		var off = el.getBoundingClientRect ? el.getBoundingClientRect() : {};
		return {
			left: off.left || 0,
			top: off.top || 0,
			width: off.width || 0,
			height: off.height || 0,
			right: off.left + off.width,
			bottom: off.top + off.height
		};
	}



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
		var t = -1000, l = -1000;
		var targetOff = getOffsets(this.target);
		var tooltipOff = getOffsets(this.tooltip);
		var winOff = {
			width: window.innerWidth,
			height: window.innerHeight,
			scrollLeft: window.scrollX,
			scrollTop: window.scrollY
		};
		var pos = this.cfg.position.substr(0, 1);

		var posHandler = {
			top: function () {
				t = targetOff.top - this.cfg.targetDistance - tooltipOff.height;
				l = targetOff.left + (targetOff.width - tooltipOff.width) / 2;
			},
			bottom: function () {
				t = targetOff.bottom + this.cfg.targetDistance;
				l = targetOff.left + (targetOff.width - tooltipOff.width) / 2;
			},
			left: function () {
				t = targetOff.top + (targetOff.height - tooltipOff.height) / 2;
				l = targetOff.left - this.cfg.targetDistance - tooltipOff.width;
			},
			right: function () {
				t = targetOff.top + (targetOff.height - tooltipOff.height) / 2;
				l = targetOff.right + this.cfg.targetDistance;
			}
		};

		posHandler[this.cfg.position].call(this);
		t += winOff.scrollTop;
		l += winOff.scrollLeft;

		// check too far to the right/left/top/bottom & realign


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
