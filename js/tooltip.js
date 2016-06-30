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
			position: 'default',
			forcePosition: false,
			animate: false,
			trigger: 'hover',
			showDelay: 200,
			dontHideOnTooltipHover: false
		},
		eventHandler;


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
		var text = el.title || el.dataset.title || '';
		console.log(el, text);
	};


	Tooltip.prototype.hide = function () {
	};


	Tooltip.prototype.align = function (el, keepOnScreen) {
	};


	Tooltip.prototype.destroy = function () {
		if (eventHandler) document.removeEventListener('mouseover', eventHandler);
	};


	window.Tooltip = Tooltip;
}(window));
