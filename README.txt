Fork of jsTree 1.0

This fork adds a new 'nativecheckbox' plugin to use HTML5 three-state checkboxes to render the tree.
See demo.html.

N.B. this has only been lightly tested; in particular get_state, set_state and get_json may not work

Uses input type="checkbox" to render (although not for tracking state). We have to place the checkbox outside of the item link else the link e.preventDefault() interferes with checkbox state updates
(This does however break hover highlights: in the non-native case the checkbox is included in the highlight, here it isn't.)

TODO:
  * hover highlights
  * general tidy-up
  * merge into the original checkbox code, either using images or native as a configuration option or 'detect' using https://gist.github.com/2318497
  * respect three-state option properly: currently appears to break all parent node updates if off?
  * verify get/set_state and get_json - appear broken in the code I copied?

=====
jsTree 1.0
http://jstree.com/

Copyright (c) 2011 Ivan Bozhanov (vakata.com)

Dual licensed under the MIT and GPL licenses:
  http://www.opensource.org/licenses/mit-license.php
  http://www.gnu.org/licenses/gpl.html

A list of useful pages:
  http://www.jstree.com/demo
  http://www.jstree.com/documentation
  https://groups.google.com/forum/#!forum/jstree

You can support the project on PayPal:
  http://bit.ly/jNIuWd