/*global jQuery:false, $:false, window:false */
/**
 * jQuery custom lightbox 图片查看
 *
 * Copyright (c) 2008 Mike Chen (mike.cyc@gmail.com)
 * 依赖插件jquery.dragdrop, jquery.mousewheel
 *
 * @version 1.1.0
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
**/

/**
 * 修改记录
 * 1.0.0 [2010-04-15] 初始化
 * 1.0.1 [2010-04-15] 修改图像没有加载完成时不能关闭的问题
 * 1.0.2 [2010-04-15] 增加图片查看的关闭按钮，避免图片太大不好关闭的问题
 * 1.0.3 [2010-04-15] 增加鼠标滑轮缩放图片的功能
 * 1.0.4 [2010-04-15] 统一鼠标滑轮的接口
 * 1.1.0 [2011-01-28] 分离滑轮接口，做为jquery的插件；把查看图片的调用方式做成插件方式，不再监听默认事件；加入清除所有者事件的代码
**/

(function($){
var bd = $('body'), doc = $(document), win = $(window),
zoom = [0.07, 0.1, 0.15, 0.2, 0.25, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 12, 16],
zin = 8,
//url: 图片的url地址,
//title: 要显示的文字说明
st = {
    cls: 'mod glbx',  //默认样式
    cvs: 'gcvx',//Cover class
    cos: 'glbx-cos', //关闭按钮样式
    movecls: 'cumv', //移动鼠标的Class
    drag: 'drag', //drag drop 插件
    own: document
};

//设置默认参数
$.lightboxSetup = function(s){
    $.extend(st, s);
};

$.fn.lightbox = function(s){
    s = $.extend({}, st, s);
    if(s.url){
        var cv = $('<div class="'+ s.cvs +'"></div>'), 
        co = $('<a href="#" class="'+ s.cos +'"></a>'), 
        im = new Image(), 
        id = 'lightbox'+ (new Date()).getTime(), 
        zi = zin, iw, ih, z, o, 
        cs = function(){
            doc.unbind('.' + id);
            $(s.own).unbind('.' + id);
            if(o){
                o.remove();
                o = 0;
            }
            if(co){
                co.remove();
                co = 0;
            }
            cv.remove();
            cv = 0;
        };
        bd.append(cv);
        bd.append(co);
        cv.show();
        cv.add(co).click(cs);
        im.onload = function(){
            if(!cv){return;}
            iw = im.width;
            ih = im.height;
            o = $('<div class="'+ s.cls +'" style="width:'+ iw +'px;height:'+ ih +'px"><img title="'+ (s.title || '') +'" src="'+ s.url +'"/></div>');
            cv.css({backgroundImage: 'none'});
            bd.append(o);
            var zoomout = function(){
                zi++;
                if(zi < zoom.length){
                    z = zoom[zi];
                    o.stop().animate({width: Math.round(iw * z), height: Math.round(ih * z)});
                }else{
                    zi--;
                }
            },
            zoomin = function(){
                zi--;
                if(zi >=0){
                    z = zoom[zi];
                    o.stop().animate({width: Math.round(iw * z), height: Math.round(ih * z)});
                }else{
                    zi = 0;
                }
            };
            doc.bind('keydown.' + id, function(e){
                switch(e.keyCode){
                    case 107://zoom out
                    case 187:
                    zoomout();
                    break;
                    case 109://zoom in
                    case 189:
                    zoomin();
                    break;
                    case 48:
                    case 96://zoom 1
                    zi = zin;
                    o.css({width: Math.round(iw), height: Math.round(ih)});
                    break;
                    case 27://esc
                    case 81://key Q
                    cs();
                    break;
                }
            }).bind('mousewheel.'+id, function(e, i){//鼠标滑轮事件
                if(i < 0){
                    zoomin();
                }else if(i > 0){
                    zoomout();
                }
            }).bind('mouseover.'+id, function(){
                bd.focus();
            });
            o.click(function(e){
                if('IMG' !== e.target.tagName){
                    cs();
                }
            });
            if(o[s.drag]){
                o[s.drag]({handle: $('img', o), movecls: s.movecls, toper: win, own: s.own});
            }
        };
        im.src = s.url;
        $(s.own).bind('empty.'+id, function(){
            cs();
        });
    }
    return this;
};

}(jQuery));
