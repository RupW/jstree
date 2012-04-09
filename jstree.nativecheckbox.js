/* File: jstree.nativecheckbox.js
Adds checkboxes to the tree
Uses input type="checkbox" to render (although not for tracking state)

We have to place the checkbox outside of the item link else the link e.preventDefault() interferes with checkbox state updates
(This does however break hover highlights: in the non-native case the checkbox is included in the highlight, here it isn't.)

TODO:
  * hover highlights
  * general tidy-up
  * merge into the original checkbox code, either using images or native as a configuration option or 'detect' using https://gist.github.com/2318497
  * respect three-state option properly: currently appears to break all parent node updates if off?
  * verify get/set_state and get_json - appear broken in the code I copied?
*/
(function($) {
	$.jstree.plugin("nativecheckbox", {
		__construct: function() {
			this.get_container()
				.bind("__construct.jstree", $.proxy(function() {
					// TODO: on move/copy - clean new location and parents
				}, this))
				.bind("move_node.jstree, copy_node.jstree", function(e, data) {
					if (data.rslt.old_instance && data.rslt.old_parent && $.isFunction(data.rslt.old_instance.checkbox_repair)) {
						data.rslt.old_instance.checkbox_repair(data.rslt.old_parent);
					}
					if (data.rslt.new_instance && $.isFunction(data.rslt.new_instance.checkbox_repair)) {
						data.rslt.new_instance.checkbox_repair(data.rslt.parent);
					}
				})
				.bind("delete_node.jstree", function(e, data) {
					this.checkbox_repair(data.rslt.parent);
				})
				.delegate("input.jstree-nativecheckbox", "click.jstree", $.proxy(function(e) {
					var obj = this.get_node(e.currentTarget);
					this.toggle_check(obj, true);
				}, this))
				.delegate("a", "click.jstree", $.proxy(function(e) {
					e.preventDefault();
					e.currentTarget.blur();
					var obj = this.get_node(e.currentTarget);
					this.toggle_check(obj, false);
				}, this));
		},
		defaults: {
			three_state: true
		},
		_fn: {
			/*
			Group: (native) checkbox functions
			*/
			check_node: function(obj) {
				obj = this.get_node(obj);
				// Check this node and all children
				obj.find(' > input.jstree-nativecheckbox').removeClass('jstree-unchecked jstree-undetermined').addClass('jstree-checked').prop('checked', true).prop('indeterminate', false);
				this.checkbox_repair(obj);
			},
			uncheck_node: function(obj) {
				obj = this.get_node(obj);
				// Uncheck this node and all children
				obj.find(' > input.jstree-nativecheckbox').removeClass('jstree-checked jstree-undetermined').addClass('jstree-unchecked').prop('checked', false).prop('indeterminate', false);
				this.checkbox_repair(obj);
			},
			toggle_check: function(obj) {
				var cb = obj.find(' > input.jstree-nativecheckbox');
				var isChecked = cb.is(':checked');
				if (cb.hasClass('jstree-checked')) {
					cb.removeClass('jstree-checked jstree-undetermined').addClass('jstree-unchecked');
					if (isChecked) {
						cb.prop('checked', false).prop('indeterminate', false);
					}
				} else {
					cb.removeClass('jstree-unchecked jstree-undetermined').addClass('jstree-checked');
					if (!isChecked) {
						cb.prop('checked', true).prop('indeterminate', false);
					}
				}
				this.checkbox_repair(this.get_node(obj));
			},
			uncheck_all: function(context) {
				var ret = context ? $(context).find(".jstree-checked").closest('li') : this.get_container().find(".jstree-checked").closest('li');
				ret.children(".jstree-nativecheckbox").removeClass("jstree-checked jstree-undetermined").addClass('jstree-unchecked').children(':checkbox').prop('checked', false).prop('undermined', false);
				this.__callback({ "obj": ret });
			},

			checkbox_repair: function(obj) {
				if (!obj || obj === -1) {
					// No arguments; repair all checkboxes
					obj = this.get_container_ul().children('li');
				}
				if (obj.length > 1) {
					// We don't currently support this for native checkboxes
					return;
				}

				// Work up the tree setting each parent node value correctly
				var c = obj.find(' > input.jstree-nativecheckbox'),
					fix_up = true,
					p, st, sc, su, si;

				if (!c.hasClass('jstree-checked') && !c.hasClass('jstree-unchecked')) {
					// No checked or unchecked children; either all indeterminate or no children
					p = this.get_parent(obj);
					if (p && p !== -1 && p.length && p.find('> a > .jstree-checked')) {
						c.removeClass('jstree-unchecked jstree-undetermined').addClass('jstree-checked').prop('checked', true).prop('indeterminate', false);
					} else {
						c.removeClass('jstree-checked jstree-undetermined').addClass('jstree-unchecked').prop('checked', false).prop('indeterminate', false);
					}
					fix_up = false;
				}

				if (c.hasClass('jstree-checked')) {
					obj.find('.jstree-nativecheckbox').removeClass('jstree-unchecked jstree-undetermined').addClass('jstree-checked').prop('checked', true).prop('indeterminate', false);
				}
				if (c.hasClass('jstree-unchecked')) {
					obj.find('.jstree-nativecheckbox').removeClass('jstree-checked jstree-undetermined').addClass('jstree-unchecked').prop('checked', false).prop('indeterminate', false);
				}

				while (fix_up) {
					obj = this.get_parent(obj);
					if (!obj || obj === -1 || !obj.length) { return; }

					st = obj.find(' > ul > li');
					sc = st.find(' > input.jstree-nativecheckbox.jstree-checked').length;
					su = st.find(' > input.jstree-nativecheckbox.jstree-unchecked').length;
					si = st.find(' > input.jstree-nativecheckbox.jstree-undetermined').length;
					st = st.length;

					if (sc + su + si < st) { return; }

					if (su === st) {
						c = obj.find(' > input.jstree-nativecheckbox');
						if (c.hasClass('jstree-unchecked')) { return; }
						c.removeClass('jstree-checked jstree-undetermined').addClass('jstree-unchecked').prop('checked', false).prop('indeterminate', false);
						continue;
					}
					if (sc === st) {
						c = obj.find(' > input.jstree-nativecheckbox');
						if (c.hasClass('jstree-checked')) { return; }
						c.removeClass('jstree-unchecked jstree-undetermined').addClass('jstree-checked').prop('checked', true).prop('indeterminate', false);
						continue;
					}
					obj.parentsUntil(".jstree", "li").andSelf().find(' > input.jstree-nativecheckbox').removeClass('jstree-checked jstree-unchecked').addClass('jstree-undetermined').prop('checked', false).prop('indeterminate', true);
					return;
				}
			},

			clean_node: function(obj) {
				obj = this.__call_old();
				var t = this;
				obj = obj.each(function() {
					var o = $(this),
						d = o.data("jstree");
					var li = o.is('li') ? o : o.closest('li');
					var id = "check_" + (li.attr('id') || Math.ceil(Math.random() * 10000));
					o.find(" > input.jstree-nativecheckbox").remove();
					var checked = (d && d.checkbox && d.checkbox.checked === true);
					o.children("a").before("<input id='" + id + "' name='" + id + "' type='checkbox' class='jstree-nativecheckbox " + (checked ? "jstree-checked' checked='checked'" : "jstree-unchecked'") + " />");
				});
				t.checkbox_repair(obj);
				return obj;
			},
			get_state: function() {
				var state = this.__call_old();
				state.checked = [];
				this.get_container().find('.jstree-checked').closest('li').each(function() { if (this.id) { state.checked.push(this.id); } });
				return state;
			},
			set_state: function(state, callback) {
				if (this.__call_old()) {
					if (state.checkbox) {
						var _this = this;
						this.uncheck_all();
						$.each(state.checkbox, function(i, v) {
							_this.check_node(document.getElementById(v));
						});
						this.checkbox_repair();
						delete state.checkbox;
						this.set_state(state, callback);
						return false;
					}
					return true;
				}
				return false;
			},
			get_json: function(obj, is_callback) {
				var r = this.__call_old(), i;
				if (is_callback) {
					i = obj.find('> input.jstree-nativecheckbox');
					r.data.jstree.checkbox = {};
					r.data.jstree.checkbox.checked = i.parent().hasClass('jstree-checked');
					if (i.attr('name') != 'jstree[]') { r.data.checkbox.name = i.attr('name'); }
					if (i.val() != obj.attr('id')) { r.data.checkbox.value = i.val(); }
				}
				return r;
			}
		}
	});
	$(function() {
		// add native checkbox specific CSS
		var css_string = '' +
		'.jstree li input.jstree-nativecheckbox { margin:0 2px 0 0; padding:0; border:0; display:inline; vertical-align:text-bottom; } ' +
		'.jstree-rtl li input.jstree-nativecheckbox { margin:0 0 0 2px; padding:0; border:0; display:inline; vertical-align:text-bottom; } ';
		$.vakata.css.add_sheet({ str: css_string, title: "jstree" });
	});

	// for now, don't include this plugin by default
	// $.jstree.defaults.plugins.push("nativecheckbox");
})(jQuery);
//*/