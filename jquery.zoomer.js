/*global jQuery:false, $:false, window:false */
/**
 * jQuery zoomer images
 *
 * Copyright (c) 2011 Mike Chen (achievo.mike.chen@gmail.com)
 *
 * @version 1.0.5
 * @author Mike Chen
 * @mailto achievo.mike.chen@gmail.com
 * @modify Mike Chen
**/

/**
 * 修改记录
 * 1.0.0 [2011-04-07] 建立，初始化代码。
 * 1.0.1 [2011-04-08] 修改图片连接数过多的bug
 * 1.0.2 [2011-04-11] 修改当鼠标移动太快时，放大镜不消失的bug
 * 1.0.3 [2011-04-12] 增加放大镜mouseout事件的监听，用于消失放大镜
 * 1.0.4 [2011-04-27] 修改浮点数定位的不准的bug，转成整数赋值就没有问题
 * 1.0.5 [2011-05-10] 修改模块取消后元素清理的问题
**/


(function($){
//获取密码强度
/*
con: $(dom)|| function, //在哪个容器生成
*/
var st = {
    cls: 'gzo', //放大镜class
    con: $('body'), //在哪个容器生成
    groups: 'zoomer', //命名空间
    bigimg: function(t){return t.parent().attr('href');},//得到大图片的地址
    doc: $(document),
    own: document //所属的模板
}, so = function(e, o, t, im){//定位, e--event, o--放大镜，t--小图， im--大图
    var tf = t.offset(),
    tx = tf.left,
    ty = tf.top,
    x = e.pageX,
    y = e.pageY,
    tw = t.width(),
    th = t.height(),
    itw = (im.width||tw)/tw,//放大率
    ow = o.width()/2,
    otx = tx + ow/itw,
    ith = (im.height||th)/th,
    oh = o.height()/2,
    oty = ty + oh/ith,
    owx = tw + tx - ow/itw,
    owy = th + ty - oh/ith;
    x = x - otx < 0 ? otx : (x > owx ? owx: x);
    y = y - oty < 0 ? oty : (y > owy ? owy: y);
    o.offset({left: Math.round(x - o.outerHeight()/2), top: Math.round(y - o.outerWidth()/2)});
    o.css({backgroundPosition: Math.round(-(x - tx)*itw + ow) + 'px ' + Math.round(-(y - ty)*ith + oh) + 'px'});
}, id = 0;

//设置默认参数
$.zoomerSetup = function(s){
    $.extend(st, s);
};

$.fn.zoomer = function(s){
    s = $.extend({}, st, s);
    return this.each(function(){
        var t = $(this), d = id, x, o, i, im;
        t.mousemove(function(e){
            if(t.is('img')){
                x = t.data(s.groups) || [];
                o = x[0];
                im = x[1];
                i = s.bigimg(t);
                if(i !== x[2]){//大图片
                    if(!im){
                        im = new Image();
                    }
                    im.src = i;
                    if(o){
                        o.css({backgroundImage: 'url('+ i +')'});
                    }else{
                        o = $('<div class="'+ s.cls +'" style="background:url('+ i +') no-repeat"></div>');
                        s.con.append(o);
                        o.mousemove(function(e){
                            so(e, o, t, im);
                            return false;
                        }).mouseout(function(){
                            o.fadeOut();
                            s.doc.unbind('.zoomer' + d);
                        });
                    }
                    t.data(s.groups, [o, im, i]);
                }
                so(e, o, t, im);
                if(o.is(':hidden')){
                    o.fadeIn();
                    s.doc.bind('mousemove.zoomer' + d, function(){
                        if(o.is(':visible:not(:animated)')){
                            o.fadeOut();
                            s.doc.unbind('.zoomer' + d);
                        }
                    });
                }
                return false;
            }
        });
        $(s.own).bind('empty', function(){
            if(o){o.remove();}
        });
        id++;
    });
    
};

}(jQuery));