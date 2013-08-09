/*global jQuery:false, $:false, window:false */
/**
 * jQuery 省、市、地区联动选择
 *
 * Copyright (c) 2011 Mike Chen (achievo.mike.chen@gmail.com)
 *
 * @version 1.0.2
 * @author Mike Chen
 * @mailto achievo.mike.chen@gmail.com
 * @modify Mike Chen
**/

/**
 * 修改记录
 * 1.0.0 [2011-03-29] 初始化代码
 * 1.0.1 [2011-04-12] 地区选择增加是否有空的选项
 * 1.0.2 [2011-06-13] 修改Select为空时提交Null的bug
**/

(function($){
var ln = ($.ln && $.ln.pcas) || {}, 
pp = [],//省
pc = [],//市
pa = [],//区
st = {
    tip: 1, //提示文字 0:不显示 1:显示
    areanull: 1, //地区是否存在为空选择项，0：不存在，1存在
    attr: ['name', 'lab', 'vd', 'req'] //替换需要复制的属性
}, tos = function(t, v){
    var i, k, va = t.val(), o = $('<select><option value="'+ va +'">'+ va +'</option></select>');
    for(i=0; i<v.length; i++){
        k = t.attr(v[i]);
        if(k){
            o.attr(v[i], k);
        }
    }
    t.after(o).remove();
    return o;
}, init = function(){
    var i, l, t = (ln.pca || '').split('#'), s, ss, su, j, k;
    for(i=0,l=t.length; i<l; i++){
        s = t[i].split('$');
        pp[i] = s[0];
        ss = s[1].split('|');
        pc[i] = [];
        pa[i] = [];
        for(j=0; j<ss.length; j++){
            su = ss[j].split(',');
            pc[i][j] = su.shift();
            pa[i][j] = su;
        }
    }
    delete ln.pca;
}, tc = function(o, t, n, s, a){//对象，数组，为空显示字符，是否显示空字符, 是否存在为空选择项
    var v = o.val(), i, l;
    o = o[0];
    o.length = 0;
    if(s){
        o.options.add(new Option(n, ''));
    }
    if(t){
        for(i=0, l=t.length; i<l; i++){
            o.options.add(new Option(t[i], t[i]));
            if(v === t[i]){
                o[i + s].selected = true;
            }
        }
    }
    if(a && t && t[0]){
        o.options.add(new Option('', ''));
    }
    if(0 >= o.options.length){
        o.options.add(new Option('', ''));
    }
};

init();

//设置默认参数
$.pcasSetup = function(s){
    $.extend(st, s);
};

$.fn.pcas = function(s){ //s: options
    s = $.extend({}, st, s);
    var t = this, 
    op = t[0]? $(t[0]): null, 
    oc = t[1]? $(t[1]): null, 
    oa = t[2]? $(t[2]): null,
    fa = function(){
        var d = pa[op[0].selectedIndex - s.tip];
        tc(oa, d? d[oc[0].selectedIndex]: 0, ln.a, d?0:s.tip, s.areanull);
    },
    fca = function(){
        var d = pc[op[0].selectedIndex - s.tip];
        tc(oc, d, ln.c, d?0:s.tip);
        fa();
    };
    if(op){
        if(!op.is('select')){
            op = tos(op, s.attr);
        }
        if(oc && !oc.is('select')){
            oc = tos(oc, s.attr);
        }
        if(oa && !oa.is('select')){
            oa = tos(oa, s.attr);
        }
        tc(op, pp, ln.p, s.tip);
        fca();
        op.change(fca);
        oc.change(fa);
    }
    return t;
};

}(jQuery));
