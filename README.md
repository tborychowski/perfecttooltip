Perfect Tooltip
===============

This is the Perfect Tooltip - a jQuery plugin

### Features
 - Creates a simple tooltip on **any html element** that matches the given **selector** (jQuery array)
 - It can either convert a *"title"* attribute of the element or add a user-defined text
 - It will be **automatically destroyed** (removed from DOM) when the target element is removed
 - It will automatically **adjust** its **position** to stay on screen (unless specified differently)
 - It can be set to the one of the **12** different positions relatively to a target
 - It can show up **on** mouse **hover** (default) or on **click**
 - It hides when you move mouse out of the target (default)
 - It can also stay on screen when you move mouse over the tooltip (to allow selecting its text)
 - It can show immediately or after a specified delay
 - It can have any html content (images, links, etc.)
 - Fully customizable with **CSS**
 - It's jQuery **chainable**

### Basic usage
    $(function(){
        $('#button1').tooltip();                          // convert "title" attribute
        $('#button2').tooltip('Button 2 tooltip text');   // show custom text
    });

[See DEMO here](http://herhor.github.com/perfecttooltip)

