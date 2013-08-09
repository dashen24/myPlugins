/*global jQuery:false, $:false, window:false */
/**
 * jQuery date select
 *
 * Copyright (c) 2011 Mike Chen (achievo.mike.chen@gmail.com)
 *
 * @version 1.0.1
 * @author Mike Chen
 * @mailto achievo.mike.chen@gmail.com
 * @modify Mike Chen
**/

/**
 * 修改记录
 * 1.0.0 [2011-03-28] 初始化代码
 * 1.0.1 [2011-03-30] 优化更新Select代码
**/

(function($){
var ye = (new Date()).getFullYear(), st = {
    years: [ye-100, ye-1], //年期间范围
    attr: ['name', 'lab', 'vd', 'req'] //替换需要复制的属性
},
tos = function(t, v){//转text到Select
    var i, k, va = t.val(), o = $('<select><option value="'+ va +'">'+ (va||'-') +'</option></select>');
    for(i=0; i<v.length; i++){
        k = t.attr(v[i]);
        if(k){
            o.attr(v[i], k);
        }
    }
    t.after(o).remove();
    return o;
}, ch = function(t, x, v){//填充数据到Select
    var i, c = 0;
    v = parseInt(undefined === v ? t.val(): v, 10);
    t = t[0];
    t.length = 0;
    t.options.add(new Option('-', ''));
    for(i=x[0]; i<=x[1]; i++){
        t.options.add(new Option(i>9 ? i: '0'+i, i));
        c++;
        if(i === v){
            t[c].selected = true;
        }
    }
}, fd = function(y, m, dd){
    var d = 31;
    y = parseInt(y.val(), 10)||0;
    m = parseInt(m.val(), 10)||0;
    switch(m){
        case 2:  //闰年29天
        if((y%4===0 && y%100!==0) || (y%400===0)){
            d = 29;
        }else{
            d = 28;
        }
        break;
        case 4: //30天
        case 6:
        case 9:
        case 11:d = 30;break;
    }
    ch(dd, [1, d]);
};

//设置默认参数
$.dateselectSetup = function(s){
    $.extend(st, s);
};

$.fn.dateselect = function(s){ //s: options
    var t = this, o, v,
    dy, dm, dd;
    s = $.extend({}, st, s);
    dy = t[0] ? $(t[0]) : null;
    dm = t[1] ? $(t[1]) : null;
    dd = dm && t[2] ? $(t[2]) : null;
    if(dy){
        if(!dy.is('select')){
            dy = tos(dy, s.attr);
        }
        if(dm && !dm.is('select')){
            dm = tos(dm, s.attr);
        }
        if(dd && !dd.is('select')){
            dd = tos(dd, s.attr);
        }
        ch(dy, s.years);
        if(dm){
            ch(dm, [1, 12]);
        }
        if(dd){
            fd(dy, dm, dd);
        }
        dy.change(function(){
            fd(dy, dm, dd);
        });
        dm.change(function(){
            fd(dy, dm, dd);
        });
    }
    return t;
};

}(jQuery));
