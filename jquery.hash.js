/*global jQuery:false, $:false, window:false */
/**
 * jQuery hash, 简单的实现hash功能
 * request jquery
 *
 * Copyright (c) 2011 Mike Chen (mike.cyc@gmail.com)
 *
 * @version 1.0.0
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
**/
/*
 * 设置值，如果name为空设置匿名值
 * @ $.hash("name", value);
 *
 * 得到值，如果name为空得到匿名值
 * @ $.hash("name");
 *
 * 删除值，如果name为空删除匿名值
 * @ $.hash("name", null);
*/
/**
 * 修改记录
 * 1.0.0 [2011-07-14] 初始化代码
**/
(function($){
jQuery.hash = function(n, v) {//v为数组
    var re, t, x = n ? n+'=': '';
    if('undefined' === typeof v){//获得值
        re = new RegExp("&*\\b" + x + "[^&]*");
        t = location.hash.match(re);
        return t ? decodeURIComponent(n ? t[0].split('=')[1]: t[0]): null;
    }else{
        re = new RegExp("(&" + x + "[^&]*)|(\\b" + x + "[^&]*&)|(\\b" + x + "[^&]*)", "g");
        t = location.hash.replace(re, "");//删除值
        if(null !== v){//设置值
            v += '';
            t += (t.length && '#'!==t ? "&" : '') + x + encodeURIComponent(v);
        }
        location.hash = t;
    }
};
}(jQuery));

