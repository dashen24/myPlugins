/*global jQuery:false, $:false, window:false */
/**
 * jQuery rotate360 360度旋转图片
 *
 * Copyright (c) 2011 Mike Chen (mike.cyc@gmail.com)
 *
 *
 * @version 1.2.5
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
**/

/**
 * 修改记录
 * 1.0.0 [2011-11-03] 初始化代码
 * 1.1.0 [2011-11-07] 修改显示方式，原来是用更换背景的方式会引起闪烁，更换为显示隐藏的方式
 * 1.2.0 [2011-11-09] 增加自动放大缩小的功能，只能是初始化的时候生效
 * 1.2.1 [2011-11-10] 修改还没有加载完成之前关闭出错的bug和增加清空的事件
 * 1.2.2 [2011-11-10] 增加展示图片加载百分比的文字
 * 1.2.3 [2011-11-10] 增加播放事件控制
 * 1.2.4 [2011-11-15] 增加是否发送Ajax事件的控制
 * 1.2.5 [2011-11-23] 增加touch的支持
**/

(function($){
var doc = $(document), 
win = $(window), 
uid = (new Date()).getTime(),
stc = typeof(document.ontouchend) !== 'undefined',
//全局设置
/*
url: '', //请求图片的url地址
*/
st = {
    run: false,//自动开始
    index: 0,//开始的索引值
    delay: 50,//自动延时时间
    wait: 300,//鼠标按下开始延时
    down: 20, //鼠标按下后自动旋转延时
    mpc: 4,//鼠标移动一个容器宽度转动几圈
    direction:1,//1为顺时间，-1为逆时间
    zoom: 1,//是否重新设定图片大小
    cache: true,//是否缓存JSON数据
    path: '',//图片路径
    ext: '',//图片后缀
    global: false,//是否发送Ajax加载的信息
    own: document //所属的模板
}, 
//预加载图片，兼容各浏览器
gimg = function(u, b) {
    var m = new Image(); //创建一个Image对象，实现图片的预下载
    m.src = u;
    if(m.complete){ // 如果图片已经存在于浏览器缓存，直接调用回调函数
        b(m);
        return; //直接返回，不用再处理onload事件
    }
    m.onload = function () { //图片下载完毕时异步调用callback函数。
        b(m);
    };
},
//得到最大的图片尺寸
gwh = function(ow, oh, mw, mh, z){
    var r = {}, t;
    if(z){
        t = ow/oh - mw/mh;
        if(t>0){
            r.height = oh;
            r.width = mw * oh / mh;
        }else{
            r.width = ow;
            r.height = mh * ow / mw;
        }
        r.left = (ow-r.width)/2;
        r.top = (oh-r.height)/2;
    }else{
        r.left = (ow-mw)/2;
        r.top = (oh-mh)/2;
    }
    return r;
}
;

//设置默认参数
$.rotate360Setup = function(s){
    $.extend(st, s);
};

$.fn.rotate360 = function(s){
    var o = this, id = 'totate360'+ (uid++), ept;
    s = $.extend({}, st, s);
    if(s.url){
        $.ajax({//加载运行数据
            url: s.url,
            dataType: 'json',
            cache: s.cache,
            global: s.global,
            success: function(x){
                if(ept){return;}
                //x = $.parseJSON(x);
                var ms = x.list.split('|'),//保存图片地址列表
                cu = ms.length,
                mvt = o.width()/cu/s.mpc,//移动间隔距离
                ims = [], //图片列表
                mps,//图片位置和尺寸{}
                c, cc = 0,
                la, //加载图标
                bt, //标题按钮
                th, //时间Dela句柄
                rs, //播放暂停
                
                snm = function(x){//设置下一张图片
                    ims[s.index].style.display = 'none';
                    s.index += x;
                    if(s.index >= cu){//整理索引值
                        s.index = 0;
                    }else if(s.index < 0){
                        s.index = cu-1;
                    }
                    ims[s.index].style.display = 'block';
                },
                cdh = function(){//清除时间
                    if(th){
                        clearInterval(th);
                        th = 0;
                    }
                },
                rdl = function(x, t, b){//自动运行
                    cdh();
                    th = setInterval(function(){
                        snm(x);
                        if(b){
                            b();
                        }
                    }, t);
                },
                deh,
                dev = function(x){//鼠标按下事件
                    deh = 1;
                    s.direction = x;
                    s.run = false;
                    rs.removeClass('rs');
                    rdl(x, s.wait, function(){
                        rdl(x, s.down);
                    });
                    snm(x);
                },
                deu = function(){
                    if(deh){
                        cdh();
                        deh = 0;
                    }
                },
                stv = function(){//Stop run
                    if(s.run){
                        rs.removeClass('rs');
                        cdh();
                        s.run = false;
                    }
                },
                plv = function(){//Play images
                    if(!s.run){
                        rs.addClass('rs');
                        rdl(s.direction, s.delay);
                        s.run = true;
                    }
                },
                mb = function(m){//加载图片
                    if(ept){return;}
                    if(m){
                        if(c === s.index){//加载完成第一张图片
                            m.style.display = 'block';
                            mps = gwh(o.width(), o.height(), m.width, m.height, s.zoom);
                        }else{
                            m.style.display = 'none';
                        }
                        $(m).css(mps);
                        ims[c] = m;
                        o.append(m);
                        //输出百分比
                        cc++;
                        la.html(parseInt(cc*100/cu, 10)+'%');
                        c = c>=cu-1? 0: c+1;
                    }else{//第一次进入，先加载第一张图片
                        c = s.index;
                    }
                    if(c === s.index && ims[c]){//已经加载完成，开始运行360图片显示
                        la.remove();
                        if(s.isnew){
                            o.append('<div class="nw"/>');
                        }
                        if(s.buy){
                            o.append('<a href="'+ s.buy[0] +'" class="by"'+ (s.buy[1] ? ' target="'+ s.buy[1] +'"': '') +'></a>');
                        }
                        bt = $('<div class="bt"><a class="rl"></a><a class="rr"></a><a class="rs"></a></div>').appendTo(o);
                        rs = bt.children('a.rs');
                        if(s.run){
                            rdl(s.direction, s.delay);
                        }else{
                            rs.removeClass('rs');
                        }
                        rs.click(function(){
                            if(s.run){
                                stv();
                            }else{
                                plv();
                            }
                            return false;
                        }).mousedown(function(){
                            return false;//避免跟移动转动冲突
                        });
                        bt.children('a.rl').mousedown(function(){
                            dev(1);
                            return false;
                        }).bind('mouseup mouseout', deu);
                        bt.children('a.rr').mousedown(function(){
                            dev(-1);
                            return false;
                        }).bind('mouseup mouseout', deu);
                        
                        //鼠标左右拖动的功能
                        var mvs, mvx,
                        move = function(e){
                            var x = e.pageX, k = mvx - x;
                            if(k>mvt){
                                snm(1);
                                s.direction = 1;
                                mvx = x;
                            }else if(k<-mvt){
                                snm(-1);
                                s.direction = -1;
                                mvx = x;
                            }
                        },
                        stop = function(){
                            doc.unbind('.'+ id);
                            try{
                                if(mvs.releaseCapture){
                                    $(mvs).unbind('losecapture.' + id);
                                    mvs.releaseCapture();
                                }else{
                                    win.unbind('blur', stop);
                                }
                            }catch(ex){}
                        };
                        o.bind(stc? 'touchstart': 'mousedown', function(e){
                            mvs = this;
                            doc.bind((stc? 'touchmove.': 'mousemove.') + id, move).bind((stc? 'touchup': 'mouseup.')+ id, stop);
                            if(mvs.setCapture){
                                $(mvs).bind('losecapture.' + id, stop);
                                mvs.setCapture();
                            }else{
                                win.blur(stop);
                            }
                            mvx = e.pageX;
                            stv();//stop
                            e.preventDefault();
                        }).css('cursor', 'w-resize');
                        $(s.own).bind('empty.'+id, function(){//清除数据
                            stop();
                            cdh();
                        });
                        // 监听Stop事件
                        o.bind('play.'+id, function(e, x){
                            //0--暂停，1--播放，2--播放/暂停
                            switch(x||0){
                                case 0: stv();break;
                                case 1: plv();break;
                                case 2:
                                if(s.run){
                                    stv();
                                }else{
                                    plv();
                                }
                                break;
                            }
                        }).bind('empty.'+id, function(){//清空容器事件，为了动态生成
                            $(s.onw).unbind('.'+id);
                            stop();
                            cdh();
                            ept = 1;
                        });
                    }else{
                        gimg(s.path + ms[c] + s.ext, mb);
                    }
                };
                delete(x.list);
                $.extend(s, x);//合并设置
                //预加载图片
                o.empty().css('cursor', 'default').unbind();//先清空容器
                if(cu > 1){
                    //显示加载的图标
                    la = $('<div class="la">0%</div>').appendTo(o);
                }
                mb();//加载图片
            }
        });
        $(s.own).bind('empty.'+id, function(){//清除数据
            ept = 1;
        });
    }
    return o;
};

}(jQuery));

