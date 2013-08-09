/*global jQuery:false, $:false, window:false */
/**
 * jQuery storage data
 *
 * Copyright (c) 2011 Mike Chen (mike.cyc@gmail.com)
 *
 *
 * @version 1.0.0
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
**/

/**
 * 修改记录
 * 1.0.0 [2011-10-25] 初始化代码
**/

/*
 * 设置值，如果name为空设置默认值
 * @ $.storage([s], "name", value);
 *
 * 得到值，如果name为空得到默认值
 * @ $.storage([s], "name");
 *
 * 删除值，如果name为空删除默认值
 * @ $.storage([s], "name", null);
*/

(function($){
//全局设置
var st = {
    space: 'storage',
    dn: 'storage'//Default Name
}, o = window.localStorage, ty = 1;
//建立句柄
if(!o){
    o = document.createElement('INPUT');
    o.type = "hidden";
    o.style.display = "none";
    o.addBehavior("#default#userData");
    document.body.appendChild(o);
    try {
        o.load(st.space);//试验是否支持
        ty = 2;
    } catch(e){
        document.body.removeChild(o);
        o = 0;
        ty = 0;
    }
}

//设置默认参数
$.storageSetup = function(s){
    $.extend(st, s);
};

$.storage = function(){
    if(!o){return null;}//返回null值说明浏览器不支持
    var a = arguments, s, n, v;
    if('object' === typeof a[0]){//调整好顺序
        s = $.extend({}, st, a[0]);
        n = a[1] || s.dn;
        v = a[2];
    }else{
        s = st;
        n = a[0] || s.dn;
        v = a[1];
    }
    if('undefined' === typeof v){//获得值
        if(1 === ty){//支持localStorage方式
            return o.getItem(s.space+'.'+n);
        }else{
            o.load(s.space);
            return o.getAttribute(n);
        }
    }else if(null === v){//删除值
        if(1 === ty){
            o.removeItem(s.space+'.'+n);
        }else{
            o.load(s.space);
            o.removeAttribute(n);
            o.save(s.space);
        }
    }else{//设置值
        if(1 === ty){
            o.setItem(s.space+'.'+n, v);
        }else{
            o.load(s.space);
            o.setAttribute(n, v);
            o.save(s.space);
        }
    }
};

}(jQuery));

