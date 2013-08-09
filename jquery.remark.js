/*global jQuery:false, $:false, window:false */
/**
 * jQuery 评分控件
 *
 * Copyright (c) 2011 Mike Chen (achievo.mike.chen@gmail.com)
 *
 * 需要tooltip插件支持提示展示
 *
 * @version 1.0.1
 * @author Mike Chen
 * @mailto achievo.mike.chen@gmail.com
 * @modify Mike Chen
**/

/**
 * 修改记录
 * 1.0.0 [2011-05-18] 初始化代码
 * 1.0.1 [2011-05-20] 修改输出的值为这样的形式：分数|百分比|对应Class|文字说明
**/

(function($){
/*
val: 0 //值是多少
*/
var st = {
    ln: $.ln.remark,
    tt: 'tooltip',//tooltip插件
    tofs: -7, //tooltip偏移量
    max: 5, //最高分
    sad: 2, //伤心分数，包括这个数值
    cou: 10, //分成几等分
    own: document
};

//设置默认参数
$.remarkSetup = function(s){
    $.extend(st, s);
};

$.fn.remark = function(s){ //s: options
    s = $.extend({}, st, s);
    if(!s.mark){//初始化显示字符
        s.mark = s.ln.mark;
    }
    var sd = 100/s.cou, vc = s.mark.length/s.max, 
    gm = function(v){
        return s.mark[Math.ceil(parseFloat(v) * vc)-1] || '';
    };
    return this.each(function(){
        var t = $(this), h = t.children(':hidden'), c = t.children('span'), i, v, vl, ta;
        if('undefined' === typeof s.val){
            v = (h.val()||'').split('|')[0];
            vl = v ? parseFloat(v) : c[0] ? c.width()/ t.width() * s.max : 0;
        }
        if(c[0]){
            c.remove();
        }
        for(i=100; i>0; i-=sd){
            v = i*s.max/100;
            t.append('<a href="#" val="'+ v +'" per="'+ i +'" class="'+ [v<=s.sad ? 's': '', Math.abs(v-vl) < 0.01 ? 'on': ''].join(' ') +'" style="width:'+ i +'%;"></a>');
        }
        t.hover(function(){
            ta = $('a.on', t).removeClass('on');
        }, function(){
            ta.addClass('on');
        });
        t.children('a').mouseover(function(e){
            var t = $(e.target), tt = t[s.tt], of, w, v;
            if(tt){
                of = t.offset();
                w = t.next().width();
                v = t.attr('val');
                t[s.tt]({html: v + s.ln.cou + ' ' + gm(v), fixps: [of.left + w + s.tofs, of.top, t.width() - w, t.height()]});
            }
        }).click(function(e){
            var tt = e.target, v;
            if(tt !== ta[0]){
                ta = $(tt);
                v = ta.attr('val');
                h.val([v, ta.attr('per'), ta.is('.s')?'s':'', gm(v)].join('|')); //分数|百分比|对应Class|文字说明
                h.click();
                h.change();
            }else{
                h.click();
            }
            return false;
        });
    });
};

}(jQuery));
