/*global jQuery:false, $:false, window:false */
/**
 * jQuery 拖动排列的插件
 *
 * Copyright (c) 2011 Mike Chen (mike.cyc@gmail.com)
 * 依赖插件jquery.dragdrop
 *
 * @version 1.0.0
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
**/

/**
 * 修改记录
 * 1.0.0 [2011-05-25] 初始化
**/

(function($){
var mo, //拖动时Clone的对象
st = {
    mousehit: 1,
    //list: 0, //排列方式，如果是0表示横排，1表示竖排
    own: document
};

//设置默认参数
$.draglistSetup = function(s){
    $.extend(st, s);
};

$.fn.draglist = function(s){
    s = $.extend({}, st, s);
    return this.drag(s).bind('drag', function(e, x, o){
        var t = $(e.target), $o, i;
        switch(x){
            case 'start':
            if(mo){
                mo.remove();
            }
            mo = t.clone().addClass('opa').removeAttr('jquerydd');
            t.addClass('abo');
            t.after(mo);
            break;
            case 'stop':
            mo.after(t);
            t.removeClass('abo');
            mo.remove();
            mo = 0;
            break;
            case 'over':
            $o = $(o);
            i = $o.offset();
            if(s.list){//左右
                i.left = i.left + $o.outerWidth()/2;
                if(e.pageX < i.left){
                    $o.before(mo);
                }else{
                    $o.after(mo);
                }
            }else{//上下
                i.top = i.top + $o.outerHeight()/2;
                if(e.pageY < i.top){
                    $o.before(mo);
                }else{
                    $o.after(mo);
                }
            }
            break;
        }
    }).drop(s);
};

}(jQuery));
