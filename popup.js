var keywords = ['self', 'unsafe-inline', 'unsafe-eval'];

var MODE_SIMPLE = 1;
var MODE_ADVANCED = 2;
var STATE_ACTIVE = 1;
var STATE_NOTACTIVE = 0;

function Directive(name, keywords) {
    var self = this;
    this.name = name;
    this.value = '';

    if (keywords === undefined) {
        this.keywords = ['self'];
    }

    this.init_value = function(value) {
        self.value = value;
    }
}

function Policy() {
    var self = this;
    this.directives = [];

    this.init_value = function(policy) {
        self.directives = [];
        var tokens = policy.split(';');

        for (var i=0; i<tokens.length; i++) {
            var directive_value = '';
            var chunks = tokens[i].trim().split(' ');
            var directive_name = chunks[0];

            if (chunks.length > 1) {
                directive_value = chunks.slice(1).join(' ');
            }

            var directive = make_directive(directive_name);
            if (directive) {
                directive.init_value(directive_value);
                self.directives.push(directive);
            }
        }
    }

    this.init_from_simple_form = function() {
        self.directives = [];
        var elems = document.getElementsByClassName("directive_value");

        for (var i=0; i<elems.length; i++) {
            var directive = make_directive(elems[i].id);
            var tmp_value = elems[i].value;

            for (var j=0; j<keywords.length; j++) {
                tmp_value = tmp_value.replace("'" + keywords[j] +"'", ''); 
                if (document.getElementById(directive.name + '-' + keywords[j]) 
                        && document.getElementById(directive.name + '-'+ keywords[j]).checked) {
                    tmp_value += " '" + keywords[j] + "'";
                }
            }
            if (directive && tmp_value) {
                directive.init_value(tmp_value);
                self.directives.push(directive);
            }
        }
    }

    function make_directive(directive_name) {
        var directive_names = [
            'default-src', 'script-src', 'style-src', 'img-src',
            'connect-src', 'child-src', 'font-src', 'form-action',
            'frame-ancestors', 'frame-src', 'media-src', 'object-src',
            'plugin-types', 'base-uri', 'sandbox', 'report-uri'
            ];
        for (var i=0; i<directive_names.length; i++) {
            if (directive_names[i] == directive_name) {
                return new Directive(directive_name);
            }
        }
        return null;
    }

    this.init_from_advanced_form = function() {
        self.init_value(get_value("policy"));
    }

    this.save = function() {
        localStorage['policy'] = self.get_string_policy();
    }

    this.restore = function() {
        if (localStorage.getItem('policy')) {
            self.init_value(localStorage['policy']);
        }
    }

    this.get_string_policy = function() {
        var result = '';
        for (var i=0; i<self.directives.length; i++) {
            result += self.directives[i].name + ' ' + self.directives[i].value.trim() + '; ';
        }
        if (result) {
            result = result.slice(0, result.length - 2);
        }
        return result;
    }
}

function save_policy() {
    var csp = new Policy();

    localStorage["target"] = get_value("target");

    if (localStorage.getItem('mode') == MODE_ADVANCED) {
        csp.init_from_advanced_form();
    } else {
        csp.init_from_simple_form();
    }
    
    csp.save();
    
    if (get_checked("state")) {
        localStorage["state"] = STATE_ACTIVE;
    } else {
        localStorage["state"] = STATE_NOTACTIVE;
    }

    if (get_checked("report_only")) {
        localStorage["report_only"] = STATE_ACTIVE;
    } else {
        localStorage["report_only"] = STATE_NOTACTIVE;
    }
    var status = document.getElementById("status");
    /* FIXME
    var bg = chrome.extension.getBackgroundPage()
    if (bg.reload()) {*/
        status.innerHTML = "Policy has been saved.";
        status.style.display = 'block';
    /*} else {
        status.innerHTML = "Policy has not been saved! Please, check URL pattern.";
        status.style.display = 'block';
        localStorage["state"] = STATE_NOTACTIVE;
        document.getElementById("state").checked = false;
    }*/
    setTimeout(function() {
        status.style.display = 'none';
    }, 850);
}

function load_policy() {
    if (localStorage.getItem("target")) {
        set_value("target", localStorage.getItem("target"));
    }
    
    var csp = new Policy();
    csp.restore();

    var mode = localStorage.getItem('mode') ? localStorage.getItem('mode') : MODE_ADVANCED;

    if (mode == MODE_ADVANCED) {
        set_value("policy", csp.get_string_policy());
    } else {
        restore_simple_form(csp);
    }
 
    if (localStorage["state"] == STATE_ACTIVE) {
        set_checked("state", true);
    }
    if (localStorage["report_only"] == 1) {
        set_checked("report_only", true);
    }
}

function reset_policy() {
    set_value("target", '');
    set_value("policy", '');

    var elems = document.getElementsByClassName("directive_value");
    for (var i=0; i<elems.length; i++) {
        elems[i].value = '';
    }

    set_checked("state", false);
    set_checked("report_only", false);
}

function toggle_view() {
    var adv = document.getElementById("advanced");
    var advanced_link = document.getElementById("advanced_link");
    var simple_link = document.getElementById("simple_link");
    var simple = document.getElementById("simple");

    if (localStorage.getItem('mode') == MODE_SIMPLE) {
        advanced_link.style.display = 'inline';
        adv.style.display = 'none';
        simple_link.style.display = 'none';
        simple.style.display = 'block';
    } else {
        advanced_link.style.display = 'none';
        adv.style.display = 'block';
        simple_link.style.display = 'inline';
        simple.style.display = 'none';
    }
}

function switch2advanced() {
    var csp = new Policy();
    csp.init_from_simple_form();
    set_value("policy", csp.get_string_policy());
    localStorage['mode'] = MODE_ADVANCED;
    toggle_view();
}

function switch2simple() {
    var csp = new Policy();
    csp.init_from_advanced_form();
    restore_simple_form(csp);
    localStorage['mode'] = MODE_SIMPLE;
    toggle_view();
}

function get_value(id) {
    return document.getElementById(id).value;
}

function set_value(id, value) {
    document.getElementById(id).value = value;
}

function get_checked(id) {
    return document.getElementById(id).checked;
}

function set_checked(id, value) {
    document.getElementById(id).checked = value;
}

function restore_simple_form(csp) {
   var tmp_value = '';
    for (var i=0; i<csp.directives.length; i++) {
        directive_value = csp.directives[i].value;
        directive_name = csp.directives[i].name;

        for (var j=0; j<keywords.length; j++) {
            if (directive_value.indexOf("'"+keywords[j]+"'") > -1 
                    && document.getElementById(directive_name + '-' + keywords[j])) {
                directive_value = directive_value.replace("'" + keywords[j] +"'", ''); 
                set_checked(directive_name + '-' + keywords[j], true);
            }
        }
        if (!is_form_dictive_exists(directive_name)) {
            add_form_directive(directive_name);
        }
        set_value(directive_name, directive_value.trim());
    }
}

function is_form_dictive_exists(directive_name) {
    return document.getElementById(directive_name) != null;
}

function add_form_directive(directive_name) {
    var simple_form = document.getElementById("simple_form");
    tr = document.getElementById("tr-default-src").cloneNode(true);
    tr.querySelector(".help_link").href = "https://www.w3.org/TR/CSP2/#directive-" + directive_name;
    tr.querySelector(".help_link").innerText = directive_name;
    tr.querySelector(".directive_value").name = directive_name;
    tr.querySelector(".directive_value").id = directive_name;
    tr.querySelector(".directive_value").value = '';
    tr.querySelector("input.self").name = directive_name + '-self';
    tr.querySelector("input.self").id = directive_name + '-self';
    tr.querySelector("input.self").checked = false;
    tr.querySelector("label").setAttribute("for", directive_name + '-self');
    tr.querySelector("label").innerText = 'self';
    simple_form.appendChild(tr);
}

document.addEventListener('DOMContentLoaded', load_policy);
document.querySelector('#save').addEventListener('click', save_policy);
document.querySelector('#reset').addEventListener('click', reset_policy);
document.querySelector('#advanced_link').addEventListener('click', switch2advanced);
document.querySelector('#simple_link').addEventListener('click', switch2simple);

toggle_view();
