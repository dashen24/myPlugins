/*global jQuery:false, $:false, window:false */
/**
 * jQuery dialog box
 *
 * Copyright (c) 2008 Mike Chen (mike.cyc@gmail.com)
 *
 * 因为语言还有事件绑定的原因，需要依赖现有的框架，不能单独使用（dragdrop）
 *
 * @version 2.5.5
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
**/

/**
 * 修改记录
 * 2.0.3 [2010-04-15] 修改Setting初始化，在没有框架的时候也可以正常运行，只是附加功能有限制
 * 2.0.4 [2010-04-15] 调整绑定JS的顺序，先绑定JS再进行居中定位。
 * 2.0.4 [2010-04-15] 修改IE7下不断Append引起空白的问题，虽然resize时还会引起空白，正常使用时这个的操作比较少，暂时先不处理。
 * 2.0.5 [2010-04-16] 增加参数，可以附加数据在对话框里。增加了ID：frame-dialog 说明这部分代码的target空间
 * 2.1.0 [2010-04-16] 增加URL请求的功能，前提是html没有值，url为值的时候
 * 2.2.0 [2010-04-27] 把窗口拖动的部分代码移出，放到dragdrop里共用
 * 2.2.1 [2010-04-28] 修改A链接里包含Button出现链接请求的Bug
 * 2.2.2 [2010-06-12] 增加显示服务器传过来的Title，对应的属性是ptitle
 * 2.3.0 [2010-07-12] 修改Confirm的按键显示方式和返回方式，将原来的数字返回方式修改为Act返回方式
 * 2.3.1 [2010-07-15] Confirm增加关闭时调用回调函数，信息内容为close
 * 2.3.2 [2010-07-16] 调整Close与别的Action调用顺序，先是Action后Close
 * 2.3.3 [2010-07-17] Confirm回调只能回调一次，避免多次调用引起冲突的问题
 * 2.3.4 [2010-12-21] 修改初始化语言提示不全的bug
 * 2.3.5 [2010-12-23] 增加弹出窗口可以指定位置left, right, top, bottom
 * 2.3.6 [2010-12-23] 修改Alert和confirm中模块名由module->mod
 * 2.3.7 [2010-12-28] 修改Alert和confirm中模块Class由alt->galt
 * 2.3.8 [2010-12-29] 修改调用Ajax的方式，将标题属性ptitle修改为tit
 * 2.3.9 [2010-12-29] 增加在对话框增加close事件的监听和act=close的元素自动调用关闭对话框
 * 2.3.9 [2011-01-17] 在JsLint那里修改JS的语法问题，Move the invocation into the parens that contain the function
 * 2.4.0 [2011-01-17] 增加显示，关闭和窗口大小变化时移动的动画效果
 * 2.4.1 [2011-02-17] 修改当s.own等于doc时进入事件死循环的Bug
 * 2.4.2 [2011-03-31] 因绑定方式改变，修改这里的绑定方式
 * 2.4.3 [2011-04-01] 修改全局的绑定js的名字，固定附加数据为bridge
 * 2.5.0 [2011-05-10] 增加容器选择的功能，修改ie下定位不准的bug
 * 2.5.1 [2011-05-10] 修改window和document没有offset的bug
 * 2.5.2 [2011-06-02] 增加获取活动对话框id的功能，$.dialogGetActId()
 * 2.5.3 [2011-06-02] 修改定位为Fixed时定位的问题
 * 2.5.4 [2011-06-14] 修改定位问题，增加判断是Fixed还是Absolute
 * 2.5.5 [2011-10-11] 增加s.html为Dom的类型
 * 2.5.6 [2011-10-17] 修改动画的调用方式，可以自己定义动画方式
**/

(function($){
//定义一些针对这个插件的全局变量
var doc = $(document), win = $(window), cm = $.cm,
actid, //活动窗口id
did,//随机生成的ID号
zi = 1000, oc = {},//窗口管理[o, cv]
/*
bridge: {}, //附加数据或运行程序
*/
st = {//width, height, title, left, right, top, bottom
    cls: 'mod gdlg',  //默认样式
    cvs: 'gcv',//Cover class
    con: $('body'), //哪个容器生成
    region: win, //弹出窗口范围
    movecls: 'cumv', //移动鼠标的Class
    drag: 'drag',//Dragdrop插件
    isdrag: 1, //是否允许拖动
    ln: $.ln.dialog,//语言包路径或命名空间
    xm: $.xm || {}, //数据绑定的JS实现
    bj: $.bj || {}, //数据绑定记号
    bjs: (cm && cm.bjs)? cm.bjs: function(){}, //绑定JS函数
    ubj: (cm && cm.ubj)? cm.ubj: function(){}, //取消JS绑定函数
    load: (cm && cm.load) ? cm.load: function(){}, //加载URL的函数
    html: '', //内容
    url: '', //URL地址
    cache: false, //最否采用缓存，只能url地址加载有效，默认为不采用缓存
    data: null, //附加到URL地址的数据
    model: true, //是否用后面不可点
    fixedcenter: true, //是否自动居中
    //是否需要动画，采用函数的方法方便更换变换效果
    //co--当前的窗口，
    //ty--将要发生窗口动画的状态指示，
    //bf--效果完成后的回调函数，
    //lo--将要替换的窗口（只有替换方式时有值）
    animate: function(co, ty, bf, lo){
        var o = co[0], cv = co[1], s = co[2], sf = s.sf, op, t, rg = s.region;
        switch(ty){//FadeOut方式
            case 'show'://显示
            if(cv){cv.show();}
            o.css('opacity', 0);
            t = rg.offset()||{top:0,left:0};
            //窗口定位
            op = {
                left: Math.round(('number' === typeof(s.left) && s.left>=0) ? s.left : ('number'===typeof(s.right) && s.right>=0 ? rg.width() - o.width() - s.right: t.left + (rg.width() - o.width())/2)), 
                top: Math.round(('number' === typeof(s.top) && s.top>=0) ? s.top : ('number'===typeof(s.bottom) && s.bottom>=0 ? rg.height() - o.height() - s.bottom: t.top + (rg.height() - o.height())/2))
            };
            o[sf](op).animate({opacity: 1}, function(){
                try{//在ie下有bug：有透明属性的元素剪切超过的部分
                    o[0].style.removeAttribute('filter');
                }catch(ex){}
                if(bf){bf();}
            });
            break;
            case 'hide'://隐藏
            if(cv){cv.remove();cv = 0;}
            o.fadeOut(bf);
            break;
        }
    }, 
    own: doc//所属哪个模块
};

//设置默认参数
$.dialogSetup = function(s){
    $.extend(st, s);
};

$.dialogGetActId = function(){
    return actid;
};

$.dialog = function(s) {//返回窗口的ID:string
    //默认设置
    var id = 'dialog'+ (new Date()).getTime(),//ID号,内部使用
    //pid = s.preid,
    //prx = pid && oc[pid],
    o, cv, ct, show, clear, rg, sf;//是否fixed
/*     if(prx){//如果有前一个窗口的id，则采用原来的设置
        s = $.extend({}, oc[pid][2], s);
    }else{
        //应用新设置
        s = $.extend({}, st, s);
    } */
    s = $.extend({}, st, s);
    
    if(!s.html && !s.url){
        return;
    }
    rg = s.region; //保存在一个变量里，提高速度
    s.own = $(s.own);
    did = id;
    //生成框架
    o = $('<div class="'+ s.cls +'" id="'+ id +'" style="z-index:'+ zi +';"><div class="fhd"><div><h1><span>'+ (s.title || s.ln.title) +'</span></h1></div><a href="#" act="close" title="'+ s.ln.close +'">'+ s.ln.close +'</a></div><div class="fbd"><div class="bdx"><div class="cte" id="frame-dialog"></div></div></div><div class="fft"><div><p></p></div></div></div>');
    o.css({top:-9999, left:-9999});
    //设置宽度和高度
    if(s.width){
        o.css('width', s.width);
    }
    if(s.height){
        o.css('height', s.height);
    }
    //生成Cover
    if(s.model){
        cv = $('<div class="'+ s.cvs +'" style="z-index:'+ zi +';"></div>');
        s.con.append(cv);
        // if(prx){
            // cv = oc[pid][1];
        // }else{
            // cv = $('<div class="'+ s.cvs +'" style="z-index:'+ zi +';"></div>');
            // s.con.append(cv);
        // }
    }
    oc[id] = [o, cv, s];
    s.con.append(o);
    s.sf = sf = 'fixed' === o.css('position') ? 'css': 'offset';
    
    actid = id;
    //附加数据信息到Dialog上
    if(s.bridge){
        o.data('bridge', s.bridge);
    }
    ct = $('div.cte', o);//内容框

    //关闭函数
    clear = function(o, ty){
        var h = function(){
            var i, m = 0, k, u;
            o.empty();
            o.remove();
            delete(oc[id]);
            if($.isEmptyObject(oc)){//重定位index
                zi = 1000;
                actid = null;
            }else{
                // 取得最高zIndex
                for(i in oc){
                    k = Math.max(m, oc[i][0].css('zIndex'));
                    if(k>m){
                        m = k;
                        u = oc[i];
                    }
                }
                actid = u[0].attr('id');
            }
        };
        s.animate(oc[id], ty || 'hide', h);
    };
    
    show = function(){
        var fhd = $('div.fhd', o), vh, 
        os = function(){
            s.ubj(ct);
            win.unbind('.'+ id);
            doc.unbind('.'+ id);
        }, cl = function(){
            if(s.own[0] !== doc[0]){
                s.own.triggerHandler('dialog', ['close', id]);//发送对话框关闭事件
            }
            os();
            clear(o);
        };
        
        if(s.own[0] !== doc[0]){
            s.own.triggerHandler('dialog', ['show', id]);//发送显示对话框事件
        }
        
/*         if(pid){
            //s.animate(oc[pid], 'prevhide');
            clear(oc[pid][0], 'prevhide');
        } */
        
        s.animate(oc[id], 'show');
        
        if(s.isdrag && o[s.drag]){//拖动
            o[s.drag]({handle: fhd, ext: $('a[act=close]', fhd)[0], region: rg, movecls: s.movecls, own: s.own});
        }

        //窗口resize时自动居中
        if(s.fixedcenter){
            win.bind('resize.' + id, function(){
                var t = rg.offset()||{top:0,left:0};
                o[sf]({left:Math.round(t.left + (rg.width() - o.width())/2), top:Math.round(t.top + (rg.height() - o.height())/2)});
            });
        }
        
        //事件处理
        doc.bind('dialog.'+ id, function(e, m, n, x){
            if('close' === m && n === id && oc[n]){//关闭事件
                cl();
            }
        });
        
        //关闭对话框, 2010-12-29增加
        o.click(function(e){
            if($(e.target).closest('[act=close]', o)[0]){
                cl();
                e.preventDefault();
            }
        }).bind('close', cl).mousedown(function(){//调整zIndex
            if(id !== actid){
                zi++;
                o.css('zIndex', zi);
                actid = id;
            }
        });
    };
    
    //设置Title，如果服务器返回Title
    var setTitle = function(){
        var t = ct.children('div:first').attr('tit');
        if(t){
            $('div.fhd span', o)[0].innerHTML = t;
        }
    };

    if(s.html){
        if(typeof s.html === 'object'){
            ct.append(s.html);
        }else{
            ct[0].innerHTML = s.html;
        }
        //JS代码绑定
        s.bjs(ct);
        setTitle();
        show();
    }else if(s.url){
        s.load(s.url, {ct:ct, data: s.data, cache: s.cache, success: function(x, t){
            setTitle();
            show();
        }, error: function(){
            clear(o);
        }});
    }
    return id;
};
//==========================================================================
(function(){
    //alert需要的事件绑定
    var aid, cu = 0,
    alb = function(d){
        var id = aid, ke = 0;
        $(d).bind('empty', function(){//删除绑定的函数
            delete(st.xm[id]);
            delete(st.bj[id]);
        }).keydown(function(e){
            var t = $(e.target).closest('a.btn', d);
            if(t[0]){
                ke = 1;
                return false;
            }
        }).keyup(function(e){
            var t = $(e.target).closest('a.btn', d);
            if(t[0] && ke){
                ke = 0;
                t.trigger('click');
            }
        });
    };

    //模拟alert，t--要显示的文本，st--设置
    $.alert = function(t, s){
        s = s || {};
        var l = s.ln || st.ln;
        aid = 'alert'+ cu;
        cu++;
        s = {
            title: s.title || l.alert,
            html: '<div class="mod galt" id="'+ aid +'"><div class="hd"></div><div class="bd"><table class="tb"><tr><td>'+ t +'</td></tr></table></div><div class="ft"><a href="#" class="btn" act="close"><span><input type="button" value="'+ l.yes +'"/></span></a></div></div>'
        };
        st.xm[aid] = alb;
        st.bj[aid] = aid;
        return $.dialog(s);
    };
}());

(function(){
    //confirm需要的事件绑定
    var cid, cu = 0, cback,
    clb = function(d){
        var id= cid, xid = did, b = cback, co, ke = 0;
        $(d).bind('empty', function(){//删除绑定的函数
            if(b){
                b('close');//回调Close
                b = null;
            }
            delete(st.xm[id]);
            delete(st.bj[id]);
        }).click(function(e){
            var t = $(e.target).closest('a[act]', d);
            if(t[0]){
                co(t.attr('act'));
                return false;
            }
        }).keydown(function(e){
            var t = $(e.target).closest('a.btn', d);
            if(t[0]){
                ke = 1;
                return false;
            }
        }).keyup(function(e){ //模拟Click事件，取消在Close按键上的拖动
            var t = $(e.target).closest('a.btn', d);
            if(t[0] && ke){
                ke = 0;
                t.trigger('click');
            }
        });
        co = function(x){
            if(b){
                b(x);
                b = null;
            }
            doc.triggerHandler('dialog', ['close', xid]);
        };
    };

    //模拟confirm，t--要显示的文本，b--回调函数，st--设置
    $.confirm = function(t, b, s){
        s = s || {};
        s.act = (s.act || 'yes|no').split('|');
        var i, a, l = s.ln || st.ln, bn = [];
        cback = b;
        cid = 'confirm'+ cu;
        cu++;
        for(i=0; i<s.act.length; i++){
            a = s.act[i];
            bn.push('<a href="#" class="btn" act="'+ a +'"><span><input type="button" value="'+ l[a] +'"/></span></a>');
        }
        s = {
            title: s.title || l.confirm,
            html: '<div class="mod galt" id="'+ cid +'"><div class="hd coo"></div><div class="bd"><table class="tb"><tr><td>'+ t +'</td></tr></table></div><div class="ft">'+ bn.join(' ') +'</div></div>'
        };
        st.xm[cid] = clb;
        st.bj[cid] = cid;
        return $.dialog(s);
    };
}());


}(jQuery));

