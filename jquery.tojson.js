/*global jQuery:false */

/**
 * jQuery toJSON plugin
 *
 * modify from http://www.json.org/json2.js
 * Copyright (c) 2011 Mike Chen (mike.cyc@gmail.com)
 *
 *
 * @version 1.0.0
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
**/
 
(function($){
var ep = /["\\\x00-\x1f\x7f-\x9f]/g, 
mt = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"' : '\\"',
    '\\': '\\\\'
},
qs = function(s){
    if(s.match(ep)){
        return '"' + s.replace(ep, function (a) {
            var c = mt[a];
            if (typeof c === 'string'){ return c;}
            c = a.charCodeAt();
            return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
        }) + '"';
    }
    return '"' + s + '"';
};
    
$.toJSON = function(o){
    if (typeof(JSON) === 'object' && JSON.stringify){
        return JSON.stringify(o);
    }
    
    var t = typeof(o);
    if (o === null){
        return "null";
    }
    if (t === "undefined"){
        return undefined;
    }
    if (t === "number" || t === "boolean"){
        return o + "";
    }
    if (t === "string"){
        return qs(o);
    }
    if (t === 'object'){
        if (typeof o.toJSON === "function") {
            return $.toJSON( o.toJSON() );
        }
        if (o.constructor === Date){
            var month = o.getUTCMonth() + 1;
            if (month < 10){ month = '0' + month;}

            var day = o.getUTCDate();
            if (day < 10){ day = '0' + day;}

            var year = o.getUTCFullYear();
            
            var hours = o.getUTCHours();
            if (hours < 10) {hours = '0' + hours;}
            
            var minutes = o.getUTCMinutes();
            if (minutes < 10) {minutes = '0' + minutes;}
            
            var seconds = o.getUTCSeconds();
            if (seconds < 10) {seconds = '0' + seconds;}
            
            var milli = o.getUTCMilliseconds();
            if (milli < 100) {milli = '0' + milli;}
            if (milli < 10) {milli = '0' + milli;}

            return '"' + year + '-' + month + '-' + day + 'T' +
                         hours + ':' + minutes + ':' + seconds + 
                         '.' + milli + 'Z"'; 
        }

        if (o.constructor === Array) {
            var ret = [], i;
            for (i = 0; i < o.length; i++){
                ret.push( $.toJSON(o[i]) || "null" );
            }
            return "[" + ret.join(",") + "]";
        }
    
        var pairs = [], k;
        for (k in o) {
            var name;
            t = typeof k;

            if (t === "number"){
                name = '"' + k + '"';
            }else if (t === "string"){
                name = qs(k);
            }else{
                continue;  //skip non-string or number keys
            }
            if (typeof o[k] === "function") {
                continue;  //skip pairs where the value is a function.
            }
            var val = $.toJSON(o[k]);
        
            pairs.push(name + ":" + val);
        }

        return "{" + pairs.join(", ") + "}";
    }
};
}(jQuery));
