'use strict';

var keywords = ['self', 'unsafe-inline', 'unsafe-eval'];

var MODE_SIMPLE = 1;
var MODE_ADVANCED = 2;
var STATE_ACTIVE = 1;
var STATE_NOTACTIVE = 0;

class Directive {
    constructor(name, keywords) {
        this.name = name;
        this.value = '';

        if (keywords === undefined) {
            this.keywords = ['this'];
        }
    }

    init_value(value) {
        this.value = value;
    }
}


class Policy {
    constructor() {
        this.directives = [];
    }

    init_value(policy) {
        this.directives = [];
        let tokens = policy.split(';');

        for (let i=0; i<tokens.length; i++) {
            let directive_value = '';
            let chunks = tokens[i].trim().split(' ');
            let directive_name = chunks[0];

            if (chunks.length > 1) {
                directive_value = chunks.slice(1).join(' ');
            }

            let directive = this.make_directive(directive_name);
            if (directive) {
                directive.init_value(directive_value);
                this.directives.push(directive);
            }
        }
    }
   
    static get_directive_names() {
         let directive_names = [
            'default-src', 'script-src', 'style-src', 'img-src',
            'connect-src', 'child-src', 'font-src', 'form-action',
            'frame-ancestors', 'frame-src', 'media-src', 'object-src',
            'plugin-types', 'base-uri', 'sandbox', 'report-uri'
            ];

        return directive_names;
    }

    make_directive(directive_name) {
        let directive_names = Policy.get_directive_names();
        for (let i=0; i<directive_names.length; i++) {
            if (directive_names[i] == directive_name) {
                return new Directive(directive_name);
            }
        }
        return null;
    }

    get_string_policy() {
        let result = '';
        for (let i=0; i<this.directives.length; i++) {
            result += this.directives[i].name + ' ' + this.directives[i].value.trim() + '; ';
        }
        if (result) {
            result = result.slice(0, result.length - 2);
        }
        return result;
    }

    init_from_simple_form() {
        this.directives = [];
        let elems = document.getElementsByClassName("directive_value");

        for (let i=0; i<elems.length; i++) {
            let directive = this.make_directive(elems[i].id);
            let tmp_value = elems[i].value;
            for (let j=0; j<keywords.length; j++) {
                tmp_value = tmp_value.replace("'" + keywords[j] +"'", ''); 
                if (document.getElementById(directive.name + '-' + keywords[j]) 
                        && document.getElementById(directive.name + '-'+ keywords[j]).checked) {
                    tmp_value += " '" + keywords[j] + "'";
                }
            }
            if (directive && tmp_value) {
                directive.init_value(tmp_value);
                this.directives.push(directive);
            }
        }
    }
 
    init_from_advanced_form() {
        this.init_value(get_value("policy"));
    }
}


class SimpleForm {
    static reset() {
        let directive_names = [];
        let elems = document.getElementsByClassName("directive_value");

        set_value('default-src', '');
        set_checked('default-src-self', false);

        for (let i=0; i<elems.length; i++) {
            if (elems[i].id != 'default-src') { 
                directive_names.push(elems[i].id);
            }
        }

        for (let i=0; i<directive_names.length; i++) {
            SimpleForm.remove_directive(directive_names[i]);
        }

        let pinned_directives = ['script-src', 'style-src', 'img-src'];
        for (let i=0; i<pinned_directives.length; i++) {
            SimpleForm.add_directive(pinned_directives[i], false);
        }

    }

    static remove_directive(directive_name) {
        let simple_form = document.getElementById("simple_form");
        simple_form.removeChild(document.getElementById('tr-' + directive_name));
    }

    static populate_select() {
        let select = document.getElementById("select-directive");
        let directive_names = Policy.get_directive_names().sort();
        for (let i=0; i<directive_names.length; i++) {
            let new_option = new Option(directive_names[i], directive_names[i]);
            select.appendChild(new_option);
        }
    }

    static restore(csp) {
        SimpleForm.reset();
        SimpleForm.populate_select();
        let tmp_value = '';

        for (let i=0; i<csp.directives.length; i++) {
            let directive_value = csp.directives[i].value;
            let directive_name = csp.directives[i].name;

            if (!SimpleForm.is_directive_exists(directive_name)) {
                SimpleForm.add_directive(directive_name);
            }

            for (let j=0; j<keywords.length; j++) {
                if (directive_value.indexOf("'"+keywords[j]+"'") > -1 
                        && document.getElementById(directive_name + '-' + keywords[j])) {
                    directive_value = directive_value.replace("'" + keywords[j] +"'", ''); 
                    set_checked(directive_name + '-' + keywords[j], true);
                }
            }
            set_value(directive_name, directive_value.trim());
        }
    }

    static is_directive_exists(directive_name) {
        return document.getElementById(directive_name) != null;
    }

    static add_directive(directive_name, delete_link) {
        if (['script-src', 'style-src'].indexOf(directive_name) !== -1) {
            var unsafe_eval = true;
        } else {
            var unsafe_eval = false;
        }

        if (['script-src', 'style-src'].indexOf(directive_name) !== -1) {
            var unsafe_inline = true;
        } else {
            var unsafe_inline = false;
        }

        if (delete_link === undefined) {
            var delete_link = true;
        }

        let simple_form = document.getElementById("simple_form");
        let tr = document.getElementById("tr-default-src").cloneNode(true);
        tr.id = 'tr-' + directive_name;
        tr.querySelector(".help_link").href = "https://www.w3.org/TR/CSP2/#directive-" + directive_name;
        tr.querySelector(".help_link").innerText = directive_name;
        tr.querySelector(".directive_value").name = directive_name;
        tr.querySelector(".directive_value").id = directive_name;
        tr.querySelector(".directive_value").value = '';
        let div_self = tr.querySelector("div.self");
        div_self.querySelector("input").name = directive_name + '-self';
        div_self.querySelector("input").id = directive_name + '-self';
        div_self.querySelector("input").checked = false;
        div_self.querySelector("label").setAttribute("for", directive_name + '-self');

        if (delete_link) {
            let d = tr.querySelector("div.delete-icon");
            d.style.display = 'inline';
            d.onclick = function() {SimpleForm.remove_directive(directive_name);return false;}
        }

        if (unsafe_eval) {
            let d = tr.querySelector("div.unsafe-eval");
            d.style.display = 'inline';
            d.querySelector("input").name = directive_name + '-unsafe-eval';
            d.querySelector("input").id = directive_name + '-unsafe-eval';
            d.querySelector("input").checked = false;
            d.querySelector("label").setAttribute("for", directive_name + '-unsafe-eval');
        }

        if (unsafe_inline) {
            let d = tr.querySelector("div.unsafe-inline");
            d.style.display = 'inline';
            d.querySelector("input").name = directive_name + '-unsafe-inline';
            d.querySelector("input").id = directive_name + '-unsafe-inline';
            d.querySelector("input").checked = false;
            d.querySelector("label").setAttribute("for", directive_name + '-unsafe-inline');
        }

        simple_form.appendChild(tr);
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
    
    localStorage['policy'] = csp.get_string_policy();
    
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
    if (localStorage.getItem('policy')) {
        csp.init_value(localStorage['policy']);
    }

    var mode = localStorage.getItem('mode') ? localStorage.getItem('mode') : MODE_ADVANCED;

    if (mode == MODE_ADVANCED) {
        set_value("policy", csp.get_string_policy());
    } else {
        SimpleForm.restore(csp);
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
    set_checked("state", false);
    set_checked("report_only", false);
    SimpleForm.reset();
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
    SimpleForm.restore(csp);
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

function add_directive() {
    let select = document.getElementById("select-directive");
    let directive_name = select.options[select.selectedIndex].value;
    if (!SimpleForm.is_directive_exists(directive_name)) {
        SimpleForm.add_directive(directive_name);
    }
    return false;
}

document.addEventListener('DOMContentLoaded', load_policy);
document.querySelector('#save').addEventListener('click', save_policy);
document.querySelector('#reset').addEventListener('click', reset_policy);
document.querySelector('#advanced_link').addEventListener('click', switch2advanced);
document.querySelector('#simple_link').addEventListener('click', switch2simple);
document.querySelector('#add-directive').addEventListener('click', add_directive);

toggle_view();
