
(function(e) {
    e.extend(e.fn, {validate: function(t) {
            if (!this.length) {
                t && t.debug && window.console && console.warn("nothing selected, can't validate, returning nothing");
                return
            }
            var n = e.data(this[0], "validator");
            if (n) {
                return n
            }
            this.attr("novalidate", "novalidate");
            n = new e.validator(t, this[0]);
            e.data(this[0], "validator", n);
            if (n.settings.onsubmit) {
                var r = this.find("input, button");
                r.filter(".cancel").click(function() {
                    n.cancelSubmit = true
                });
                if (n.settings.submitHandler) {
                    r.filter(":submit").click(function() {
                        n.submitButton = this
                    })
                }
                this.submit(function(t) {
                    function r() {
                        if (n.settings.submitHandler) {
                            if (n.submitButton) {
                                var t = e("<input type='hidden'/>").attr("name", n.submitButton.name).val(n.submitButton.value).appendTo(n.currentForm)
                            }
                            n.settings.submitHandler.call(n, n.currentForm);
                            if (n.submitButton) {
                                t.remove()
                            }
                            return false
                        }
                        return true
                    }
                    if (n.settings.debug)
                        t.preventDefault();
                    if (n.cancelSubmit) {
                        n.cancelSubmit = false;
                        return r()
                    }
                    if (n.form()) {
                        if (n.pendingRequest) {
                            n.formSubmitted = true;
                            return false
                        }
                        return r()
                    } else {
                        n.focusInvalid();
                        return false
                    }
                })
            }
            return n
        }, valid: function() {
            if (e(this[0]).is("form")) {
                return this.validate().form()
            } else {
                var t = true;
                var n = e(this[0].form).validate();
                this.each(function() {
                    t &= n.element(this)
                });
                return t
            }
        }, removeAttrs: function(t) {
            var n = {}, r = this;
            e.each(t.split(/\s/), function(e, t) {
                n[t] = r.attr(t);
                r.removeAttr(t)
            });
            return n
        }, rules: function(t, n) {
            var r = this[0];
            if (t) {
                var i = e.data(r.form, "validator").settings;
                var s = i.rules;
                var o = e.validator.staticRules(r);
                switch (t) {
                    case "add":
                        e.extend(o, e.validator.normalizeRule(n));
                        s[r.name] = o;
                        if (n.messages)
                            i.messages[r.name] = e.extend(i.messages[r.name], n.messages);
                        break;
                    case "remove":
                        if (!n) {
                            delete s[r.name];
                            return o
                        }
                        var u = {};
                        e.each(n.split(/\s/), function(e, t) {
                            u[t] = o[t];
                            delete o[t]
                        });
                        return u
                }
            }
            var a = e.validator.normalizeRules(e.extend({}, e.validator.metadataRules(r), e.validator.classRules(r), e.validator.attributeRules(r), e.validator.staticRules(r)), r);
            if (a.required) {
                var f = a.required;
                delete a.required;
                a = e.extend({required: f}, a)
            }
            return a
        }});
    e.extend(e.expr[":"], {blank: function(t) {
            return !e.trim("" + t.value)
        }, filled: function(t) {
            return !!e.trim("" + t.value)
        }, unchecked: function(e) {
            return !e.checked
        }});
    e.validator = function(t, n) {
        this.settings = e.extend(true, {}, e.validator.defaults, t);
        this.currentForm = n;
        this.init()
    };
    e.validator.format = function(t, n) {
        if (arguments.length == 1)
            return function() {
                var n = e.makeArray(arguments);
                n.unshift(t);
                return e.validator.format.apply(this, n)
            };
        if (arguments.length > 2 && n.constructor != Array) {
            n = e.makeArray(arguments).slice(1)
        }
        if (n.constructor != Array) {
            n = [n]
        }
        e.each(n, function(e, n) {
            t = t.replace(new RegExp("\\{" + e + "\\}", "g"), n)
        });
        return t
    };
    e.extend(e.validator, {defaults: {messages: {}, groups: {}, rules: {}, errorClass: "error", validClass: "valid", errorElement: "label", focusInvalid: true, errorContainer: e([]), errorLabelContainer: e([]), onsubmit: true, ignore: ":hidden", ignoreTitle: false, onfocusin: function(e, t) {
                this.lastActive = e;
                if (this.settings.focusCleanup && !this.blockFocusCleanup) {
                    this.settings.unhighlight && this.settings.unhighlight.call(this, e, this.settings.errorClass, this.settings.validClass);
                    this.addWrapper(this.errorsFor(e)).hide()
                }
            }, onfocusout: function(e, t) {
                if (!this.checkable(e) && (e.name in this.submitted || !this.optional(e))) {
                    this.element(e)
                }
            }, onkeyup: function(e, t) {
                if (e.name in this.submitted || e == this.lastElement) {
                    this.element(e)
                }
            }, onclick: function(e, t) {
                if (e.name in this.submitted)
                    this.element(e);
                else if (e.parentNode.name in this.submitted)
                    this.element(e.parentNode)
            }, highlight: function(t, n, r) {
                if (t.type === "radio") {
                    this.findByName(t.name).addClass(n).removeClass(r)
                } else {
                    e(t).addClass(n).removeClass(r)
                }
            }, unhighlight: function(t, n, r) {
                if (t.type === "radio") {
                    this.findByName(t.name).removeClass(n).addClass(r)
                } else {
                    e(t).removeClass(n).addClass(r)
                }
            }}, setDefaults: function(t) {
            e.extend(e.validator.defaults, t)
        }, messages: {required: "This field is required.", remote: "Please fix this field.", email: "Please enter a valid email address.", url: "Please enter a valid URL.", date: "Please enter a valid date.", dateISO: "Please enter a valid date (ISO).", number: "Please enter a valid number.", digits: "Please enter only digits.", creditcard: "Please enter a valid credit card number.", equalTo: "Please enter the same value again.", accept: "Please enter a value with a valid extension.", maxlength: e.validator.format("Please enter no more than {0} characters."), minlength: e.validator.format("Please enter at least {0} characters."), rangelength: e.validator.format("Please enter a value between {0} and {1} characters long."), range: e.validator.format("Please enter a value between {0} and {1}."), max: e.validator.format("Please enter a value less than or equal to {0}."), min: e.validator.format("Please enter a value greater than or equal to {0}.")}, autoCreateRanges: false, prototype: {init: function() {
                function r(t) {
                    var n = e.data(this[0].form, "validator"), r = "on" + t.type.replace(/^validate/, "");
                    n.settings[r] && n.settings[r].call(n, this[0], t)
                }
                this.labelContainer = e(this.settings.errorLabelContainer);
                this.errorContext = this.labelContainer.length && this.labelContainer || e(this.currentForm);
                this.containers = e(this.settings.errorContainer).add(this.settings.errorLabelContainer);
                this.submitted = {};
                this.valueCache = {};
                this.pendingRequest = 0;
                this.pending = {};
                this.invalid = {};
                this.reset();
                var t = this.groups = {};
                e.each(this.settings.groups, function(n, r) {
                    e.each(r.split(/\s/), function(e, r) {
                        t[r] = n
                    })
                });
                var n = this.settings.rules;
                e.each(n, function(t, r) {
                    n[t] = e.validator.normalizeRule(r)
                });
                e(this.currentForm).validateDelegate("[type='text'], [type='password'], [type='file'], select, textarea, " + "[type='number'], [type='search'] ,[type='tel'], [type='url'], " + "[type='email'], [type='datetime'], [type='date'], [type='month'], " + "[type='week'], [type='time'], [type='datetime-local'], " + "[type='range'], [type='color'] ", "focusin focusout keyup", r).validateDelegate("[type='radio'], [type='checkbox'], select, option", "click", r);
                if (this.settings.invalidHandler)
                    e(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler)
            }, form: function() {
                this.checkForm();
                e.extend(this.submitted, this.errorMap);
                this.invalid = e.extend({}, this.errorMap);
                if (!this.valid())
                    e(this.currentForm).triggerHandler("invalid-form", [this]);
                this.showErrors();
                return this.valid()
            }, checkForm: function() {
                this.prepareForm();
                for (var e = 0, t = this.currentElements = this.elements(); t[e]; e++) {
                    this.check(t[e])
                }
                return this.valid()
            }, element: function(t) {
                t = this.validationTargetFor(this.clean(t));
                this.lastElement = t;
                this.prepareElement(t);
                this.currentElements = e(t);
                var n = this.check(t);
                if (n) {
                    delete this.invalid[t.name]
                } else {
                    this.invalid[t.name] = true
                }
                if (!this.numberOfInvalids()) {
                    this.toHide = this.toHide.add(this.containers)
                }
                this.showErrors();
                return n
            }, showErrors: function(t) {
                if (t) {
                    e.extend(this.errorMap, t);
                    this.errorList = [];
                    for (var n in t) {
                        this.errorList.push({message: t[n], element: this.findByName(n)[0]})
                    }
                    this.successList = e.grep(this.successList, function(e) {
                        return !(e.name in t)
                    })
                }
                this.settings.showErrors ? this.settings.showErrors.call(this, this.errorMap, this.errorList) : this.defaultShowErrors()
            }, resetForm: function() {
                if (e.fn.resetForm)
                    e(this.currentForm).resetForm();
                this.submitted = {};
                this.lastElement = null;
                this.prepareForm();
                this.hideErrors();
                this.elements().removeClass(this.settings.errorClass)
            }, numberOfInvalids: function() {
                return this.objectLength(this.invalid)
            }, objectLength: function(e) {
                var t = 0;
                for (var n in e)
                    t++;
                return t
            }, hideErrors: function() {
                this.addWrapper(this.toHide).hide()
            }, valid: function() {
                return this.size() == 0
            }, size: function() {
                return this.errorList.length
            }, focusInvalid: function() {
                if (this.settings.focusInvalid) {
                    try {
                        e(this.findLastActive() || this.errorList.length && this.errorList[0].element || []).filter(":visible").focus().trigger("focusin")
                    } catch (t) {
                    }
                }
            }, findLastActive: function() {
                var t = this.lastActive;
                return t && e.grep(this.errorList, function(e) {
                    return e.element.name == t.name
                }).length == 1 && t
            }, elements: function() {
                var t = this, n = {};
                return e(this.currentForm).find("input, select, textarea").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function() {
                    !this.name && t.settings.debug && window.console && console.error("%o has no name assigned", this);
                    if (this.name in n || !t.objectLength(e(this).rules()))
                        return false;
                    n[this.name] = true;
                    return true
                })
            }, clean: function(t) {
                return e(t)[0]
            }, errors: function() {
                return e(this.settings.errorElement + "." + this.settings.errorClass, this.errorContext)
            }, reset: function() {
                this.successList = [];
                this.errorList = [];
                this.errorMap = {};
                this.toShow = e([]);
                this.toHide = e([]);
                this.currentElements = e([])
            }, prepareForm: function() {
                this.reset();
                this.toHide = this.errors().add(this.containers)
            }, prepareElement: function(e) {
                this.reset();
                this.toHide = this.errorsFor(e)
            }, check: function(t) {
                t = this.validationTargetFor(this.clean(t));
                var n = e(t).rules();
                var r = false;
                for (var i in n) {
                    var s = {method: i, parameters: n[i]};
                    try {
                        var o = e.validator.methods[i].call(this, t.value.replace(/\r/g, ""), t, s.parameters);
                        if (o == "dependency-mismatch") {
                            r = true;
                            continue
                        }
                        r = false;
                        if (o == "pending") {
                            this.toHide = this.toHide.not(this.errorsFor(t));
                            return
                        }
                        if (!o) {
                            this.formatAndAdd(t, s);
                            return false
                        }
                    } catch (u) {
                        this.settings.debug && window.console && console.log("exception occured when checking element " + t.id + ", check the '" + s.method + "' method", u);
                        throw u
                    }
                }
                if (r)
                    return;
                if (this.objectLength(n))
                    this.successList.push(t);
                return true
            }, customMetaMessage: function(t, n) {
                if (!e.metadata)
                    return;
                var r = this.settings.meta ? e(t).metadata()[this.settings.meta] : e(t).metadata();
                return r && r.messages && r.messages[n]
            }, customMessage: function(e, t) {
                var n = this.settings.messages[e];
                return n && (n.constructor == String ? n : n[t])
            }, findDefined: function() {
                for (var e = 0; e < arguments.length; e++) {
                    if (arguments[e] !== undefined)
                        return arguments[e]
                }
                return undefined
            }, defaultMessage: function(t, n) {
                return this.findDefined(this.customMessage(t.name, n), this.customMetaMessage(t, n), !this.settings.ignoreTitle && t.title || undefined, e.validator.messages[n], "<strong>Warning: No message defined for " + t.name + "</strong>")
            }, formatAndAdd: function(e, t) {
                var n = this.defaultMessage(e, t.method), r = /\$?\{(\d+)\}/g;
                if (typeof n == "function") {
                    n = n.call(this, t.parameters, e)
                } else if (r.test(n)) {
                    n = jQuery.format(n.replace(r, "{$1}"), t.parameters)
                }
                this.errorList.push({message: n, element: e});
                this.errorMap[e.name] = n;
                this.submitted[e.name] = n
            }, addWrapper: function(e) {
                if (this.settings.wrapper)
                    e = e.add(e.parent(this.settings.wrapper));
                return e
            }, defaultShowErrors: function() {
                for (var e = 0; this.errorList[e]; e++) {
                    var t = this.errorList[e];
                    this.settings.highlight && this.settings.highlight.call(this, t.element, this.settings.errorClass, this.settings.validClass);
                    this.showLabel(t.element, t.message)
                }
                if (this.errorList.length) {
                    this.toShow = this.toShow.add(this.containers)
                }
                if (this.settings.success) {
                    for (var e = 0; this.successList[e]; e++) {
                        this.showLabel(this.successList[e])
                    }
                }
                if (this.settings.unhighlight) {
                    for (var e = 0, n = this.validElements(); n[e]; e++) {
                        this.settings.unhighlight.call(this, n[e], this.settings.errorClass, this.settings.validClass)
                    }
                }
                this.toHide = this.toHide.not(this.toShow);
                this.hideErrors();
                this.addWrapper(this.toShow).show()
            }, validElements: function() {
                return this.currentElements.not(this.invalidElements())
            }, invalidElements: function() {
                return e(this.errorList).map(function() {
                    return this.element
                })
            }, showLabel: function(t, n) {
                var r = this.errorsFor(t);
                if (r.length) {
                    r.removeClass(this.settings.validClass).addClass(this.settings.errorClass);
                    r.attr("generated") && r.html(n)
                } else {
                    r = e("<" + this.settings.errorElement + "/>").attr({"for": this.idOrName(t), generated: true}).addClass(this.settings.errorClass).html(n || "");
                    if (this.settings.wrapper) {
                        r = r.hide().show().wrap("<" + this.settings.wrapper + "/>").parent()
                    }
                    if (!this.labelContainer.append(r).length)
                        this.settings.errorPlacement ? this.settings.errorPlacement(r, e(t)) : r.insertAfter(t)
                }
                if (!n && this.settings.success) {
                    r.text("");
                    typeof this.settings.success == "string" ? r.addClass(this.settings.success) : this.settings.success(r)
                }
                this.toShow = this.toShow.add(r)
            }, errorsFor: function(t) {
                var n = this.idOrName(t);
                return this.errors().filter(function() {
                    return e(this).attr("for") == n
                })
            }, idOrName: function(e) {
                return this.groups[e.name] || (this.checkable(e) ? e.name : e.id || e.name)
            }, validationTargetFor: function(e) {
                if (this.checkable(e)) {
                    e = this.findByName(e.name).not(this.settings.ignore)[0]
                }
                return e
            }, checkable: function(e) {
                return /radio|checkbox/i.test(e.type)
            }, findByName: function(t) {
                var n = this.currentForm;
                return e(document.getElementsByName(t)).map(function(e, r) {
                    return r.form == n && r.name == t && r || null
                })
            }, getLength: function(t, n) {
                switch (n.nodeName.toLowerCase()) {
                    case "select":
                        return e("option:selected", n).length;
                    case "input":
                        if (this.checkable(n))
                            return this.findByName(n.name).filter(":checked").length
                }
                return t.length
            }, depend: function(e, t) {
                return this.dependTypes[typeof e] ? this.dependTypes[typeof e](e, t) : true
            }, dependTypes: {"boolean": function(e, t) {
                    return e
                }, string: function(t, n) {
                    return !!e(t, n.form).length
                }, "function": function(e, t) {
                    return e(t)
                }}, optional: function(t) {
                return !e.validator.methods.required.call(this, e.trim(t.value), t) && "dependency-mismatch"
            }, startRequest: function(e) {
                if (!this.pending[e.name]) {
                    this.pendingRequest++;
                    this.pending[e.name] = true
                }
            }, stopRequest: function(t, n) {
                this.pendingRequest--;
                if (this.pendingRequest < 0)
                    this.pendingRequest = 0;
                delete this.pending[t.name];
                if (n && this.pendingRequest == 0 && this.formSubmitted && this.form()) {
                    e(this.currentForm).submit();
                    this.formSubmitted = false
                } else if (!n && this.pendingRequest == 0 && this.formSubmitted) {
                    e(this.currentForm).triggerHandler("invalid-form", [this]);
                    this.formSubmitted = false
                }
            }, previousValue: function(t) {
                return e.data(t, "previousValue") || e.data(t, "previousValue", {old: null, valid: true, message: this.defaultMessage(t, "remote")})
            }}, classRuleSettings: {required: {required: true}, email: {email: true}, url: {url: true}, date: {date: true}, dateISO: {dateISO: true}, dateDE: {dateDE: true}, number: {number: true}, numberDE: {numberDE: true}, digits: {digits: true}, creditcard: {creditcard: true}}, addClassRules: function(t, n) {
            t.constructor == String ? this.classRuleSettings[t] = n : e.extend(this.classRuleSettings, t)
        }, classRules: function(t) {
            var n = {};
            var r = e(t).attr("class");
            r && e.each(r.split(" "), function() {
                if (this in e.validator.classRuleSettings) {
                    e.extend(n, e.validator.classRuleSettings[this])
                }
            });
            return n
        }, attributeRules: function(t) {
            var n = {};
            var r = e(t);
            for (var i in e.validator.methods) {
                var s;
                if (i === "required" && typeof e.fn.prop === "function") {
                    s = r.prop(i)
                } else {
                    s = r.attr(i)
                }
                if (s) {
                    n[i] = s
                } else if (r[0].getAttribute("type") === i) {
                    n[i] = true
                }
            }
            if (n.maxlength && /-1|2147483647|524288/.test(n.maxlength)) {
                delete n.maxlength
            }
            return n
        }, metadataRules: function(t) {
            if (!e.metadata)
                return {};
            var n = e.data(t.form, "validator").settings.meta;
            return n ? e(t).metadata()[n] : e(t).metadata()
        }, staticRules: function(t) {
            var n = {};
            var r = e.data(t.form, "validator");
            if (r.settings.rules) {
                n = e.validator.normalizeRule(r.settings.rules[t.name]) || {}
            }
            return n
        }, normalizeRules: function(t, n) {
            e.each(t, function(r, i) {
                if (i === false) {
                    delete t[r];
                    return
                }
                if (i.param || i.depends) {
                    var s = true;
                    switch (typeof i.depends) {
                        case "string":
                            s = !!e(i.depends, n.form).length;
                            break;
                        case "function":
                            s = i.depends.call(n, n);
                            break
                    }
                    if (s) {
                        t[r] = i.param !== undefined ? i.param : true
                    } else {
                        delete t[r]
                    }
                }
            });
            e.each(t, function(r, i) {
                t[r] = e.isFunction(i) ? i(n) : i
            });
            e.each(["minlength", "maxlength", "min", "max"], function() {
                if (t[this]) {
                    t[this] = Number(t[this])
                }
            });
            e.each(["rangelength", "range"], function() {
                if (t[this]) {
                    t[this] = [Number(t[this][0]), Number(t[this][1])]
                }
            });
            if (e.validator.autoCreateRanges) {
                if (t.min && t.max) {
                    t.range = [t.min, t.max];
                    delete t.min;
                    delete t.max
                }
                if (t.minlength && t.maxlength) {
                    t.rangelength = [t.minlength, t.maxlength];
                    delete t.minlength;
                    delete t.maxlength
                }
            }
            if (t.messages) {
                delete t.messages
            }
            return t
        }, normalizeRule: function(t) {
            if (typeof t == "string") {
                var n = {};
                e.each(t.split(/\s/), function() {
                    n[this] = true
                });
                t = n
            }
            return t
        }, addMethod: function(t, n, r) {
            e.validator.methods[t] = n;
            e.validator.messages[t] = r != undefined ? r : e.validator.messages[t];
            if (n.length < 3) {
                e.validator.addClassRules(t, e.validator.normalizeRule(t))
            }
        }, methods: {required: function(t, n, r) {
                if (!this.depend(r, n))
                    return "dependency-mismatch";
                switch (n.nodeName.toLowerCase()) {
                    case "select":
                        var i = e(n).val();
                        return i && i.length > 0;
                    case "input":
                        if (this.checkable(n))
                            return this.getLength(t, n) > 0;
                    default:
                        return e.trim(t).length > 0
                }
            }, remote: function(t, n, r) {
                if (this.optional(n))
                    return "dependency-mismatch";
                var i = this.previousValue(n);
                if (!this.settings.messages[n.name])
                    this.settings.messages[n.name] = {};
                i.originalMessage = this.settings.messages[n.name].remote;
                this.settings.messages[n.name].remote = i.message;
                r = typeof r == "string" && {url: r} || r;
                if (this.pending[n.name]) {
                    return "pending"
                }
                if (i.old === t) {
                    return i.valid
                }
                i.old = t;
                var s = this;
                this.startRequest(n);
                var o = {};
                o[n.name] = t;
                e.ajax(e.extend(true, {url: r, mode: "abort", port: "validate" + n.name, dataType: "json", data: o, success: function(r) {
                        s.settings.messages[n.name].remote = i.originalMessage;
                        var o = r === true;
                        if (o) {
                            var u = s.formSubmitted;
                            s.prepareElement(n);
                            s.formSubmitted = u;
                            s.successList.push(n);
                            s.showErrors()
                        } else {
                            var a = {};
                            var f = r || s.defaultMessage(n, "remote");
                            a[n.name] = i.message = e.isFunction(f) ? f(t) : f;
                            s.showErrors(a)
                        }
                        i.valid = o;
                        s.stopRequest(n, o)
                    }}, r));
                return "pending"
            }, minlength: function(t, n, r) {
                return this.optional(n) || this.getLength(e.trim(t), n) >= r
            }, maxlength: function(t, n, r) {
                return this.optional(n) || this.getLength(e.trim(t), n) <= r
            }, rangelength: function(t, n, r) {
                var i = this.getLength(e.trim(t), n);
                return this.optional(n) || i >= r[0] && i <= r[1]
            }, min: function(e, t, n) {
                return this.optional(t) || e >= n
            }, max: function(e, t, n) {
                return this.optional(t) || e <= n
            }, range: function(e, t, n) {
                return this.optional(t) || e >= n[0] && e <= n[1]
            }, email: function(e, t) {
                return this.optional(t) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(e)
            }, url: function(e, t) {
                return this.optional(t) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(e)
            }, date: function(e, t) {
                return this.optional(t) || !/Invalid|NaN/.test(new Date(e))
            }, dateISO: function(e, t) {
                return this.optional(t) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(e)
            }, number: function(e, t) {
                return this.optional(t) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(e)
            }, digits: function(e, t) {
                return this.optional(t) || /^\d+$/.test(e)
            }, creditcard: function(e, t) {
                if (this.optional(t))
                    return "dependency-mismatch";
                if (/[^0-9 -]+/.test(e))
                    return false;
                var n = 0, r = 0, i = false;
                e = e.replace(/\D/g, "");
                for (var s = e.length - 1; s >= 0; s--) {
                    var o = e.charAt(s);
                    var r = parseInt(o, 10);
                    if (i) {
                        if ((r *= 2) > 9)
                            r -= 9
                    }
                    n += r;
                    i = !i
                }
                return n % 10 == 0
            }, accept: function(e, t, n) {
                n = typeof n == "string" ? n.replace(/,/g, "|") : "png|jpe?g|gif";
                return this.optional(t) || e.match(new RegExp(".(" + n + ")$", "i"))
            }, equalTo: function(t, n, r) {
                var i = e(r).unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
                    e(n).valid()
                });
                return t == i.val()
            }}});
    e.format = e.validator.format
})(jQuery);
(function(e) {
    var t = {};
    if (e.ajaxPrefilter) {
        e.ajaxPrefilter(function(e, n, r) {
            var i = e.port;
            if (e.mode == "abort") {
                if (t[i]) {
                    t[i].abort()
                }
                t[i] = r
            }
        })
    } else {
        var n = e.ajax;
        e.ajax = function(r) {
            var i = ("mode" in r ? r : e.ajaxSettings).mode, s = ("port" in r ? r : e.ajaxSettings).port;
            if (i == "abort") {
                if (t[s]) {
                    t[s].abort()
                }
                return t[s] = n.apply(this, arguments)
            }
            return n.apply(this, arguments)
        }
    }
})(jQuery);
(function(e) {
    if (!jQuery.event.special.focusin && !jQuery.event.special.focusout && document.addEventListener) {
        e.each({focus: "focusin", blur: "focusout"}, function(t, n) {
            function r(t) {
                t = e.event.fix(t);
                t.type = n;
                return e.event.handle.call(this, t)
            }
            e.event.special[n] = {setup: function() {
                    this.addEventListener(t, r, true)
                }, teardown: function() {
                    this.removeEventListener(t, r, true)
                }, handler: function(t) {
                    arguments[0] = e.event.fix(t);
                    arguments[0].type = n;
                    return e.event.handle.apply(this, arguments)
                }}
        })
    }
    e.extend(e.fn, {validateDelegate: function(t, n, r) {
            return this.bind(n, function(n) {
                var i = e(n.target);
                if (i.is(t)) {
                    return r.apply(i, arguments)
                }
            })
        }})
})(jQuery)