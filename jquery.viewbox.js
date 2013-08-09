/*global jQuery:false, $:false, window:false */
/**
 * jQuery viewbox 图片查看器，仿visuallightbox http://visuallightbox.com/lightbox-for-photo-crystal-demo.html
 *
 * Copyright (c) 2011 Mike Chen (achievo.mike.chen@gmail.com)
 *
 * @version 1.0.3
 * @author Mike Chen
 * @mailto achievo.mike.chen@gmail.com
 * @modify Mike Chen
**/

/**
 * 修改记录
 * 1.0.0 [2011-07-06] 建立，初始化代码。
 * 1.0.1 [2011-07-08] 增加动画效果
 * 1.0.2 [2011-07-11] 优化动画效果
 * 1.0.3 [2011-07-25] 增加关闭回调函数
**/


(function($){
/*
    vdom: $(dom) //渐变揭示的DOM
*/
var win = $(window),
st = {
    cls: 'gvi', //样式
    ns: 'viewbox',//命令空间
    mptb: 60, //最小的Padding
    mplr: 60,
    anti: 800, //动画时间
    sa: 0, //index|dom|$(dom) 开始的索引或者是dom，如果不存在将从第一个开始
    ept: function(){} //关闭调用的函数
}, vi, io, cl, la, cp, cn, si, ti,//保存DOM句柄
tp, //title opacity
tf, //动画top
fix, //是否fix样式
ims = {}, //当前图片缓存
iw, ih; //io width and height


//设置默认参数
$.viewboxSetup = function(s){
    $.extend(st, s);
};

$.fn.viewbox = function(s){
    s = $.extend({}, st, s);
    var d = this, x, w, h, v,//当前的dom
    ci,//当前index
    mw = function(w, h){//得到最大的宽度和高度,保持图片的比例，只缩小不放大
        var ww = win.width()-s.mptb, wh = win.height()-s.mplr, xw, xh;
        ww = ww>0 ? ww: 0;
        wh = wh>0 ? wh: 0;
        if(w<ww && h<wh){
            xw = w;
            xh = h;
        }else if(w/ww < h/wh){
            xw = wh/h*w;
            xh = wh;
        }else{
            xw = ww;
            xh = ww/w*h;
        }
        return [parseInt(xw, 10), parseInt(xh, 10)];
    }, 
    gwh = function(w, h){//为了兼容ie6，保持宽高的数据都为偶数
        return {width: w%2 ? w-1 : w, height: h%2 ? h-1: h, top:tf, left:0};
    },
    ami = function(u, di){//处理加载完成后的图片
        var w = ims[u][0], 
        h = ims[u][1], 
        iw = io.width(),
        ih = io.height(),
        x = mw(w, h), xw = x[0], xh = x[1],//最终的宽高
        mxw = iw > xw ? iw : xw,//得到最大的宽高
        mxh = ih > xh ? ih : xh,
        i = si.find('img'), imw, imh,
        o = i[0] ? 120: 100, j,
        t = di.attr('title');
        io.stop().animate(gwh(xw, xh), s.anti);
        if(i[0]){//如果原来有图片
            imw = i.width();
            imh = i.height();
            i.stop().animate($.extend({opacity: 0}, 1<(imw/imh)/(mxw/mxh) ? {
                width: imw/imh*mxh*1.2,
                height: mxh*1.2,
                left: -imw/imh*mxh*0.1,
                top: -mxh*0.1
            }:{
                width: mxw*1.2,
                height: imh/imw*mxw*1.2,
                left: -mxw*0.1,
                top: -imh/imw*mxw*0.1
            }), s.anti, function(){
                i.remove();
            });
        }
        j = $('<img src="' + u + '"/>');
        si.append(j);//飞入效果
        j.data('whc', [w, h]).css($.extend({opacity: 0}, 1<(w/h)/(mxw/mxh) ? {
            width: w/h*mxh*1.2, 
            height: mxh*1.2,
            left: -w/h*mxh*0.1,
            top: -mxh*0.1
        }:{
            width: mxw*1.2, 
            height: h/w*mxw*1.2,
            left: -mxw*0.1,
            top: -h/w*mxw*0.1
        })).animate({left:0, top:0, opacity:1, width:xw, height:xh}, s.anti, function(){
            if(t){
                ti.html(t);
                ti.stop().css({opacity:0, display: 'block'}).animate({opacity: tp}, s.anti);
            }
        });
        ti.stop().fadeOut(s.anti);
        
    }, lim = function(){//加载图片
        var di = $(d[ci]), i = ci, u = di.attr('href'), im;
        if(ims[u]){
            ami(u, di);
        }else{
            la.fadeIn();
            im = $('<img/>').load(function(){
                ims[u] = [im[0].width, im[0].height];
                if(i === ci){//异步原因，保证在当前的index下才能有效
                    la.stop().hide();
                    ami(u, di);
                }
            });
            im[0].src = u;
        }
    };
    if(d[0]){
        if(!vi || !vi[0]){//第一次初始化数据
            vi = $('div.'+s.cls);
            if(vi[0]){//初始化数据
                io = vi.find('div.i');
                iw = io.width();
                ih = io.height();
                cl = vi.find('div.c');
                la = io.find('em.la');
                cp = io.find('em.cp');
                cn = io.find('em.cn');
                si = io.children('span');
                tf = 'absolute' === io.parent().css('position') ? '-50%': 0;//在ie6-7下是-50%，其它浏览器为0
                fix = 'fixed' === vi.css('position');
                ti = io.children('p');
                tp = ti.css('opacity');
            }
        }
        if(vi[0]){
            vi.css({visibility: 'visible', opacity: 0});
            v = s.vdom || ('number' === typeof s.sa ? d[s.sa] : s.sa);
            if(v){
                v = $(v);
                x = v.offset();
                w = v.width();
                h = v.height();
                io.css({
                    width:1, 
                    height:1, 
                    left: x.left-vi.width()/2 - (fix?win.scrollLeft():0) + w/2, 
                    top:x.top-vi.height()/2-(fix?win.scrollTop():0) + h/2
                }).animate({width: iw, height: ih, top:tf, left:0}, s.anti);
            }else{
                io.css({width: iw, height: ih, top:tf, left:0});
            }
            //加载图片
            ci = 'number' === typeof s.sa ? (d.length > s.sa ? s.sa: 0): ($.inArray($(s.sa)[0], d));
            ci = ci<0 ? 0: ci;
            vi.animate({opacity:1}, s.anti, function(){
                try{
                    vi[0].style.removeAttribute('filter');
                }catch(r){}
            });

            lim();
            cp.click(function(){
                ci = ci>0 ? ci-1 : d.length-1;
                lim();
            });
            cn.click(function(){
                ci = ci<d.length-1 ? ci+1: 0;
                lim();
            });
            win.bind('resize.'+s.ns, function(){
                var m = si.children('img'), 
                r = m.data('whc'), 
                x = mw(r[0], r[1]);
                io.stop().css(gwh(x[0], x[1]));
                m.stop().css({width:x[0], height:x[1]});
            });
            cl.click(function(){//关闭
                vi.animate({opacity: 0}, function(){
                    vi.css({visibility: 'hidden'});
                    ti.stop().hide();
                    si.children().remove();
                    cl.unbind();
                    cp.unbind();
                    cn.unbind();
                    win.unbind('.'+s.ns);
                });
                s.ept();
            });
        }
    }
    return d;
};

}(jQuery));