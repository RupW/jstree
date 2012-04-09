/**
 * jQuery.support.checkboxIndeterminate
 * https://github.com/RupW
 * Tests for HTML 5 checkbox 'indeterminate' property
 * http://www.w3.org/TR/html5/the-input-element.html#dom-input-indeterminate
 * http://www.w3.org/TR/html5/number-state.html#checkbox-state
 *
 * Released under the same license as jQuery
 * http://docs.jquery.com/License
 * 
 * Usage:
 *   if ($.support.checkboxIndeterminate) { ... }
 * 
 * 2011-12-12 Initial version; runs test at load time
 * 2012-04-06 Added exception for Windows Safari
 */
(function($) {
  if (typeof($.support) === 'undefined') { $.support = {}; }

  if (typeof($.support.checkboxIndeterminate) === 'undefined') {
    var supportsIndeterminate = false;

    try {
      // Exception: Safari for Windows supports the indeterminate property but
      // it's unusable - it renders indeterminate checkboxes identically to
      // checked checkboxes.
      // Reported December 2011 and verified still-broken in 5.1.5.
      var n = window.navigator;
      function navcontains(key, value) { return (typeof(n[key]) === 'string') && (n[key].indexOf(value) >= 0); }
      var isSafariWin = n && navcontains('vendor', 'Apple') && navcontains('platform', 'Win') && navcontains('userAgent', 'Safari');

      if (!isSafariWin) {
        // Test for the property on a newly-created input element
        // Does not need to be typed checkbox or attached to the DOM
        var newInput = document.createElement('input');
        supportsIndeterminate = ('indeterminate' in newInput);
      }
    } catch (e) { }

    $.support.checkboxIndeterminate = supportsIndeterminate;
  }
})(jQuery);
