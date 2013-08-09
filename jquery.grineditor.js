/*global jQuery:false, $:false, window:false */
/**
 * jQuery grineditor, 简单的表情编辑器
 * request jquery
 *
 * Copyright (c) 2011 Mike Chen (mike.cyc@gmail.com)
 *
 * @version 1.0.2
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
**/
// wx/pz/se/fd/dy/ll/hx/bz/shui/dk/gg/fn/tp/cy/jy/ng/kuk/lengh/zk/tuu/tx/ka/baiy/am/jie/kun/jk/lh/hanx/db/fendou/zhm/yiw/xu/yun/zhem/shuai/kl/qiao/zj/ch/kb/gz/qd/huaix/zhh/yhh/hq/bs/wq/kk/yx/qq/xia/kel
/**
 * 修改记录
 * 1.0.0 [2011-05-30] 初始化代码
 * 1.0.1 [2011-06-09] 增加工具定位
 * 1.0.2 [2011-06-13] 挑选笑脸表情
**/

(function($){
var bod = $('body'), ox, ot, ht,
st = {
    grin: 'wx/pz/se/fd/dy/ll/hx/bz/shui/dk/gg/fn/tp/cy/jy/ng/kuk/lengh/zk/tuu/tx/ka/baiy/am/jie/kun/jk/lh/hanx/db/fendou/zhm/yiw/xu/yun/zhem/shuai/kl/qiao/zj/ch/kb/gz/qd/huaix/zhh/yhh/hq/bs/wq/kk/yx/qq/xia/kel',//表情快捷键
    sel: '0,2,4,12-14,20-24', //选择要显示的表情，索引方式[,-]
    cls: 'gqq', //弹出Class
    //path: '/htdocs/style/qq/',//QQ表情文件路径
    ow: 24, //每个图标宽度
    oh: 24, //每个图标高度
    ht: 199, //延时隐藏(毫秒)
    pst: 2, //工具条位置，0--top,1--right,2--bottom,3--left
    con: bod, //$(dom)|| function, 在哪个容器生成图层
    own: document //所属的模板
};

//设置默认参数
$.grineditorSetup = function(s){
    $.extend(st, s);
};

$.fn.grineditor = function(s){
    s = $.extend({}, st, s);
    return this.each(function(){
        var t = this, $t = $(t);
        $t.focus(function(){
            var a, i, l, m, j, k;
            if(ht){
                clearTimeout(ht);
                ht = 0;
            }
            if(ot && ot === t){return;}
            ot = t;
            if(!ox){
                if(!$.isArray(s.grin)){
                    s.grin = s.grin.split('/');
                    a = s.sel.split('-');
                    l = [];
                    for(i=0; i<a.length; i++){
                        m = a[i].split(',');
                        if(i>0){
                            k = parseInt(m[0], 10);
                            for(j=parseInt(l[l.length-1], 10)+1; j<k; j++){
                                l.push(j);
                            }
                        }
                        l = l.concat(m);
                    }
                    s.sel = l;
                }
                a = ['<div class="'+ s.cls +'"><div class="fix">'];
                l = s.sel.length;
                for(i=0; i<l; i++){
                    m = parseInt(s.sel[i], 10);
                    a.push('<em title="/'+ s.grin[m] +'" style="background-position: -'+ m*s.ow +'px 0;"></em>');
                }
                a.push('</div></div>');
                ox = $(a.join(''));
            }
            ox.stop(true, true).hide().css(s.pst%2 ? {height:$t.outerHeight()}: {width:$t.outerWidth()}).appendTo($.isFunction(s.con) ? s.con($t): s.con).fadeIn();
            i = $t.offset();
            //定位
            switch(s.pst){
                case 0:i.top -= ox.height();break;
                case 1:i.left += $t.outerWidth();break;
                case 2:i.top += $t.outerHeight();break;
                case 3:i.left -= ox.width();break;
            }
            ox.offset(i).unbind('click').click(function(e){
                var em = $(e.target), ss, sl, x, v;
                t.focus();
                if(em.is('em')){
                    x = em.attr('title');
                    if(document.selection){//ie
                        sl = document.selection.createRange();
                        sl.text = x;
                    }else if(undefined !== t.selectionStart){
                        v = t.value;
                        ss = t.selectionStart;
                        sl = t.selectionEnd;
                        t.value = v.substring(0, ss) + x + v.substring(sl, v.length);
                        if(sl === ss){
                            sl += x.length;
                            t.selectionStart = sl;
                            t.selectionEnd = sl;
                        }else{
                            t.selectionStart = ss;
                            t.selectionEnd = ss + x.length;
                        }
                    }else{
                        t.value += x;
                    }
                    $t.change();//发送变化的消息
                }
            });
        }).blur(function(){
            if(ht){
                clearTimeout(ht);
            }
            ht = setTimeout(function(){
                if(ox){
                    ox.fadeOut();
                }
                ot = 0;
                ht = 0;
            }, s.ht);
        });
        
    });
};

}(jQuery));
