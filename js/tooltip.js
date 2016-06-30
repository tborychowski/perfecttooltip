/**
 * Perfect Tooltip, v2.0
 *
 * @author	Tomasz Borychowski
 * @url http://tborychowski.github.com/perfecttooltip
 *
 */

(function (window) {
	'use strict';

	var defaults = {
		text: '',
		cls: '',
		position: 'default',
		forcePosition: false,
		animate: false,
		trigger: 'hover',
		showDelay: 200,
		dontHideOnTooltipHover: false
	};


	var Tooltip = function (cfg) {
		if (!(this instanceof Tooltip)) return new Tooltip(cfg);

		this.cfg = cfg || {};
		this.init();
		return this;
	};


	Tooltip.prototype.init = function () {
		document.addEventListener('mouseover', this.onMouseOver.bind(this), false);
	};


	Tooltip.prototype.onMouseOver = function (ev) {
		var target = ev.target;
		if (target.classList.contains('has-tooltip')) this.show(target);
	};

	Tooltip.prototype.show = function (el) {
		console.log(el);
	};


	Tooltip.prototype.hide = function () {
	};


	Tooltip.prototype.align = function (el, keepOnScreen) {
	};


	Tooltip.prototype.destroy = function () {
	};


	window.Tooltip = Tooltip;
}(window));
