/*global jQuery:false, $:false, window:false */
/**
 * jQuery sliding box
 *
 * Copyright (c) 2011 Mike Chen (mike.cyc@gmail.com)
 *
 * 
 *
 * @version 1.1.2
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
**/

/**
 * 修改记录
 * 1.0.0 [2011-10-17] 初始化代码
 * 1.0.1 [2011-10-19] 增加替换URL的功能，如果链接存在act=churl
 * 1.0.2 [2011-10-20] 修复多次调用时产生错误的问题
 * 1.0.3 [2011-10-20] 调整生成DOM的顺序
 * 1.1.0 [2011-11-15] 调整加载数据的顺序，避免加载数据错误时出现不能控制的问题
 * 1.1.1 [2011-11-18] 增加本地页面缓存，利用url为索引，没有用到本地存储
 * 1.1.2 [2011-11-23] 增加Padding的功能，针对小屏幕关闭按钮看不到的问题
**/

(function($){
//定义一些针对这个插件的全局变量
var doc = $(document), win = $(window), cm = $.cm,
ila,//是否正在在加载
dts = {}, //保存对应加载的数据，如果数据允许缓存
/*
bridge: {}, //附加数据或运行程序
*/
st = {//width, height
    mod: 'mod',
    cls: 'gds',  //默认样式
    cll: 'gsdl',//左边热键样式
    clr: 'gsdr',//右边热键样式
    cvs: 'gcv',//Cover class
    type: 'get', //加载Ajax方式
    con: $('body'), //哪个容器生成
    region: win, //弹出窗口范围
    movecls: 'cumv', //移动鼠标的Class
    ln: $.ln.sliding,//语言包路径或命名空间
    xm: $.xm || {}, //数据绑定的JS实现
    bj: $.bj || {}, //数据绑定记号
    bjs: (cm && cm.bjs)? cm.bjs: function(){}, //绑定JS函数
    ubj: (cm && cm.ubj)? cm.ubj: function(){}, //取消JS绑定函数
    urls:[], //url地址数组
    inx: 0,//开始的index
    padtop: 10,//顶部间隔
    padleft:0,//左边间隔
    cache: true, //最否采用缓存，只能url地址加载有效，默认为采用缓存
    data: null, //附加到URL地址的数据
    model: true, //是否用后面不可点
    fixedcenter: true, //是否自动居中
    own: doc//所属哪个模块
};

//设置默认参数
$.slidingSetup = function(s){
    $.extend(st, s);
};

$.sliding = function(s) {//返回窗口的ID:string
    if(ila){return false;}
    var id = 'sliding'+ (new Date()).getTime(),//ID号,内部使用
    o, oo, ol, or, cv, ct, create, olr, show, clear, load, ani, //动画方式 
    rg, sf;//是否fixed
    s = $.extend({}, st, s);
    //关闭函数
    clear = function(o){
        if(cv){cv.remove();cv = 0;}
        ol.remove();
        or.remove();
        o.fadeOut(function(){
            o.remove();
            o = 0;
        });
        oo = 0;
    };

    rg = s.region; //弹出窗口范围，保存在一个变量里，提高速度
    s.own = $(s.own);
    
    create = function(){
        //生成框架
        o = $('<div class="'+ s.mod +' '+ s.cls +'" id="'+ id +'" style="top:-9999px;left:-9999px;"><div class="fhd"><a href="#" act="close" title="'+ s.ln.close +'"></a></div><div class="fbd"><div class="bdx"><div class="cte" id="frame-dialog"></div></div></div><div class="fft"></div></div>');
        //设置宽度和高度
        if(s.width){
            o.css('width', s.width);
        }
        if(s.height){
            o.css('height', s.height);
        }
        s.con.append(o);
        ct = $('div.cte', o);//内容框
    };

    olr = function(top){//左右控制按钮定位并显示或隐藏
        if(s.inx > 0){
            ol.show()[sf]({top: top});
        }else{
            ol.hide();
        }
        if(s.urls.length-1 > s.inx){
            or.show()[sf]({top: top});
        }else{
            or.hide();
        }
    };
    
    show = function(){
        var t, ow, rw, oh, rh, left, top,
        cl = function(){
            if(s.own[0] !== doc[0]){
                s.own.triggerHandler('sliding', ['close', id]);//发送对话框关闭事件
            }
            s.ubj(ct);
            win.unbind('.'+ id);
            doc.unbind('.'+ id);
            clear(o);
        };
        
        t = rg.offset()||{top:0,left:0};
        //窗口定位
        ow = o.width();
        oh = o.height();
        rw = rg.width();
        rh = rg.height();
        if('offset' === sf){//重定位坐标
            o.offset({left:t.left, top:t.top, using:function(x){
                t = x;
            }});
        }
        top = Math.max(t.top + (rh - oh)/2, s.padtop);
        left = Math.max(t.left + (rw - ow)/2, s.padleft);
        if(oo){//选择不同的动画方式
            if(1 === ani){//左移
                o.css({left: t.left + rw, top: top}).animate({
                    left: left
                });
                oo.animate({left: t.left - ow}, function(){
                    oo.remove();
                });
                olr(top);
            }else if(0 === ani){//右移
                o.css({left: t.left - ow, top: top}).animate({
                    left: left
                });
                oo.animate({left: t.left + rw}, function(){
                    oo.remove();
                });
                olr(top);
            }else if(3 === ani){//下移
                o.css({left: t.left + (rw - ow)/2, top: t.top - oh}).animate({
                    top: top
                });
                oo.animate({top: t.top + rh}, function(){
                    oo.remove();
                });
            }
        }else{//首次显示
            if(cv){cv.show();}
            o.css('opacity', 0);
            o[sf]({left: left, top: top}).animate({opacity: 1}, function(){
                try{//在ie下有bug：有透明属性的元素剪切超过的部分
                    o[0].style.removeAttribute('filter');
                }catch(ex){}
            });
            olr(top);
            ol.click(function(){
                load(s.inx-1, 0);
                return false;
            });
            or.click(function(){
                load(s.inx+1, 1);
                return false;
            });
        }
        
        //关闭对话框
        o.click(function(e){
            var t = $(e.target).closest('[act]', o[0]), ac = t.attr('act');
            if(t[0]){
                switch(ac){
                    case 'close'://关闭
                    cl();
                    e.preventDefault();
                    break;
                    case 'churl'://更换url
                    load(s.inx, 3, t.attr('href'));
                    break;
                }
                return false;
            }
        }).bind('close', cl);
    };

    load = function(i, a, u){//index, animate, replace url
        if(ila){return;}
        var ur = u || s.urls[i],
        ds = function(d){
            if(o){
                ani = a;
                s.inx = i;
                oo = o;
                s.ubj(ct);
                create();
            }else{
                //生成Cover
                if(s.model){
                    cv = $('<div class="'+ s.cvs +'"></div>');
                    s.con.append(cv);
                }
                
                create();
                s.sf = sf = 'fixed' === o.css('position') ? 'css': 'offset';
                //附加数据信息到Dialog上
                if(s.bridge){
                    o.data('bridge', s.bridge);
                }
                
                ol = $('<a href="#" class="'+ s.cll +'" style="display:none;"><em></em></a>');
                or = $('<a href="#" class="'+ s.clr +'" style="display:none;"><em></em></a>');
                s.con.append(ol);
                s.con.append(or);
                
                //窗口resize时自动居中
                if(s.fixedcenter){
                    win.bind('resize.' + id, function(){
                        var t = rg.offset()||{top:0,left:0}, y = Math.max(t.top + (rg.height() - o.height())/2, s.padtop);
                        o[sf]({left:Math.max(t.left + (rg.width() - o.width())/2, s.padleft), top:y});
                        olr(y);
                    });
                }
            }
            ct[0].innerHTML = d;
            setTimeout(function(){cm.bjs(ct);}, 0);//绑定JS代码，延时方便调试
            show();
            s.own.th('sliding', ['show', id, s.inx]);//发送信息到拥有者
        };
        if(s.cache && dts[ur]){//利用缓存
            ds(dts[ur]);
        }else{
            ila = 1;
            doc.th('ajaxShow');//显示加载的提示
            $.ajax({
                url: ur,
                data: s.data,
                type: s.type,
                cache: s.cache,
                success: function(d){
                    //删除错误提示
                    doc.th('msg', [0]);
                    if(u){
                        s.urls[i] = u;
                    }
                    if(s.cache){
                        dts[ur] = d;//保存数据
                    }
                    ds(d);
                },
                complete: function(){
                    ila = 0;
                }
            });
        }
    };
    
    load(s.inx);
    
    return id;
};

}(jQuery));

