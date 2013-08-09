/**
 * jQuery custom cover dom in page
 *
 * Copyright (c) 2009 Mike Chen (achievo.mike.chen@gmail.com)
 *
 * @version 1.0.0
 * @author Mike Chen
 * @mailto achievo.mike.chen@gmail.com
 * @modify Mike Chen
**/

(function($){
var cout = 1,//计数器
dom = {}; //保存对应的DOM的jQuery对象
//bd = $('body'), doc = $(document), win = $(window);
//监控对象的变化
$(window).resize(function(){
    setTimeout(function(){
        $.each(dom, function(i, v){
            v[1].css({width: v[0].outerWidth(), height:v[0].outerHeight()});
        });
    }, 0);
});
$.extend($.fn,{
cover: function(os) { //os: options
    //全局设置
    var st = {
        bg: '#FFF', //背景颜色
        opacity: 0,  //透明度
        zIndex: 8888, //z-index
        owndom: document
    };
    if(os){$.extend(st, os);}
    //绑定注销事件
    $(st.owndom).bind('empty', function(){
        $.each(dom, function(i, v){
            v[1].remove();
            delete(dom[i]);//删除对应的对象
        });
    });
    return this.each(function(){
        var t = $(this);
        var i = t.data('coverIndex');
        if(i && dom[i]){//是否存在Cover
            return;
        }
        var o = $('<div></div>');
        o.css({
            position: 'absolute',
            width: t.outerWidth(),
            height: t.outerHeight(),
            overflow: 'hidden',
            background: st.bg,
            opacity: st.opacity,
            zIndex: st.zIndex
        });
        t.before(o);
        dom[cout] = [t, o];
        t.data('coverIndex', cout);
        cout ++;
    });

},
//取消Cover
uncover: function(){
    return this.each(function(){
        var i = $(this).data('coverIndex');
        if(!i || !dom[i]){return;}
        dom[i][1].remove();
        delete(dom[i]);
    });
}
});

})(jQuery);
