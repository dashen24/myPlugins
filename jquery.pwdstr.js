/*global jQuery:false, $:false, window:false */
/**
 * jQuery password strength
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
 * 1.0.0 [2011-04-06] 建立，初始化代码。
 * 1.0.1 [2011-04-08] 增加初始化更新状态的触发，针对于Firefox等会自动填充表单而密码状态不变的问题
**/


(function($){
//获取密码强度
var st = {
    //vi: $(dom), //默认从属性qd里得到css表达式来匹配显示密码强度的视图，如果提供将不去查找
    cls: ['gs0', 'gs1','gs2','gs3','gs4','gs5','gs6','gs7','gs8','gs9','gs10'],
    atr: 'qd',
    own: document //所属的模板
}, ps = function(v){
    var d = v.length, 
    g = d - v.replace(/[0-9]/g,"").length,
    c = d - v.replace(/\W/g,"").length, 
    i = d - v.replace(/[A-Z]/g,"").length,
    e;
    d = d>5? 5: d;
    g = g>3? 3: g;
    c = c>3? 3: c;
    i = i>3? 3: i;
    e = d*10 - 20 + g*10 + c*15 + i*10;
    return e<0 ? 0 : (e>100 ? 100: e);
};

//设置默认参数
$.pwdstrSetup = function(s){
    $.extend(st, s);
};

$.fn.pwdstr = function(s){
    s = $.extend({}, st, s);
    return this.each(function(){
        var d = $(this), o = s.vi || $(d.attr(s.atr), s.own), dc = o.attr('class'), p = 100/s.cls.length,
        di = function(){
            var l = ps(d.val()), t = 100<=l ? s.cls.length - 1 : Math.floor(l/p);
            o.attr('class', dc);
            o.addClass(s.cls[t]);
        };
        di();
        d.bind('keyup change', di);
    });
};

}(jQuery));