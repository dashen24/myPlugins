/**
 * jQuery custom radio and checkbox
 *
 * Copyright (c) 2008 Mike Chen (mike.cyc@gmail.com)
 *
 * @version 1.0.1
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
**/

(function($){
var rt = (new Date()).getTime();
$.fn.qubox = function(op) {
    //默认设置
    var setting = {
        cls: 'g-cbx',  //默认样式
        owndom: document
    }, timehandle = [];
    //应用新设置
    if(op){setting = $.extend(setting, op);}
    //代码清除的时候清除定时器
    $(setting.owndom).bind('empty', function(){
        $.each(timehandle, function(i, n){
            clearInterval(n);
        });
        timehandle = [];
    });
    
    //循环每个Radio或Checkbox
    return this.each(function(){
        if(this.type){ //判断是否Radio或Checkbox, 如果不是则不做替换
            var tp = this.type.toLowerCase();
            if('radio' != tp && 'checkbox' != tp){
                return;
            }
        }else{
            return;
        }
        var qu = this,$qu = $(this), lb;
        var o = $('<em class="'+ setting.cls +'"'+ (qu.title ? ' title="'+ qu.title +'"': '') +'><a href="#"><span></span></a></em>'), check, dis;
        $qu.css({position: 'absolute', left: -99999}).after(o);
        var $a = $('a', o), $d = $('span', o);
        
        //兼容IE6
        if(document.uniqueID && !window.XMLHttpRequest){
            //建立关联Label
            if(qu.id){
                lb = $('label[for='+ qu.id +']', setting.owndom)[0];
            }
            if(!lb){
                lb = $qu.parents('label:eq(0)');
                if(lb.length > 0){
                    var t = 'qubox' + (rt++);
                    qu.id = t;
                    lb.attr('for', t);
                }
            }
        }
        
        //绑定点击事件
        o.click(function(e){
            if(!dis){
                $qu.trigger(e);
            }
            return false;
        });
        
        //定时检查更新
        var dot = function(){
            var t = qu.checked;
            if(check !== t){ //是否是选中状态
                if(t){
                    $a.addClass('ck');
                }else{
                    $a.removeClass('ck');
                }
                check = t;
            }
            t = qu.disabled;
            if(dis !== t){ //是否禁用
                if(t){
                    $d.addClass('ds');
                }else{
                    $d.removeClass('ds');
                }
                dis = t;
            }
        };
        dot();
        timehandle.push(setInterval(dot, 99));//如果值设得小反应比较快，但耗资源比较大；如果设得比较大反应慢，但耗资源比较小。测试证明0.1秒比较合适。
    });
};
})(jQuery);
