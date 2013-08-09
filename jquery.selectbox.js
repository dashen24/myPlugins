/**
 * jQuery custom selectbox
 *
 * Copyright (c) 2009 Mike Chen (achievo.mike.chen@gmail.com)
 *
 * @version 1.2.0
 * @author Mike Chen
 * @mailto achievo.mike.chen@gmail.com
 * @modify Mike Chen
**/

(function($){
var op,//Selectbox 全局层变量
bd = $('body'), doc = $(document), win = $(window);
var clear = function(){
    if(op){
        op.empty();
        op.remove();
        op = null;
    }
};
//点击Document隐藏option层
doc.click(clear);
$.fn.selectbox = function(os) { //os: options
    //全局设置
    var setting = {
        mcls: 'module', //共同模组Class
        cls: 'g-sel',  //CSS样式
        owndom: document
    }, timehandle = [];
    if(os){setting = $.extend(setting, os);}
    //绑定注销事件
    $(setting.owndom).bind('empty', function(){
        $.each(timehandle, function(i, n){
            clearInterval(n);
        });
        timehandle = [];
        setTimeout(clear, 0);//为了解决异步进程的问题，增加了延时
    });
    return this.each(function(){
        if('SELECT' !== this.tagName){return;}
        var se = this,
        $se = $(this),
        dis = false, //是否Disabled 
        txt, //要显示的值缓存
        iskeyed = 0, //是否有操盘操作，为了回车能发出Change事件
        width, //Select宽度
        index = this.selectedIndex; //缓存选择项
        if(setting.width){
            width = setting.width;
        }else{
            width = $se.width();
        }
        var o = $('<em class="'+ setting.cls +'"'+ (se.title ? ' title="'+ se.title +'"': '') +'><a href="#"><span></span></a></em>');
        $se.css({position: 'absolute', left: -99999}).after(o);
        o.css({width: width});
        var sp = $('span', o);
        sp.css({width: sp.width()}); //为了兼容IE6，增加宽度样式
        //处理A的点击事件
        var da = $('a', o).click(function(e){
            if(op){
                clear();
                return false;
            }
            if(dis){return false;}
            var x = ['<dl class="'+ setting.mcls +' '+ setting.cls +'-op">'], idx = se.selectedIndex;
            $se.children().each(function(){
                var t = this;
                if('OPTION' == t.tagName){
                    var c = [];
                    if(t.className){
                        c.push(t.className);
                    }
                    if(t.index === idx){
                        c.push('on');
                    }
                    c = c.join(' ');
                    x.push('<dd'+ (c ? ' class="'+ c +'"': '') +' index="'+ t.index +'"'+ (t.title ? ' title="'+ t.title +'"': '') +'>'+ t.innerHTML +'</dd>');
                }else{
                    x.push('<dt'+ (t.className ? ' class="' + t.className + '"' : '') + (t.title ? ' title="'+ t.title +'"': '') +'>'+ t.label +'</dt>');
                }
            });
            x.push('</dl>');
            op = $(x.join(''));
            setTimeout(function(){//IE7在加DOM到Body时有个Bug，增加延迟
                bd.append(op);
                //为弹出层定位
                var pt = o.offset(), oh = o.outerHeight(), wh = win.height(), ph = op.outerHeight(), ws = win.scrollTop();
                if(wh + ws - pt.top - oh - ph >= 5){//理想情况，所有项都能显示出来
                    op.css({top: pt.top + oh, left: pt.left, width: width});
                }else if(pt.top - ws > ph + 5){//在顶部显示全部
                    op.css({top: pt.top - op.outerHeight(), left: pt.left, width: width});
                }else if(wh > (pt.top - ws) * 2){ //Select在中间偏上的位置, 在下面出现滚动条显示
                    op.css({top: pt.top + oh, left: pt.left, width: width, height: wh + ws - pt.top - oh - 5});
                }else{ //在顶部出现滚动条显示
                    op.css({height: pt.top - ws - 5, width: width});
                    op.css({top: pt.top - op.outerHeight(), left: pt.left});
                }
                
                //鼠标移动高亮
                $('dd', op).hover(function(e){
                    $(e.target).addClass('in');
                }, function(e){
                    $(e.target).removeClass('in');
                });
                op.click(function(e){
                    var t = e.target;
                    if('DD' == t.tagName){
                        var i = t.getAttribute('index');
                        if(i){
                            i = parseInt(i, 10);
                            if(index !== i){
                                txt = t.innerHTML;
                                sp.html(txt);
                                se.selectedIndex = i;
                                index = i;
                                iskeyed = 0;
                                $se.trigger('change');
                            }
                        }
                    }else{
                        return false;
                    }
                });
            }, 0);
            return false;
        }).keydown(function(e){//监听键盘事件
            if(dis){return;}
            var i = se.selectedIndex, o = se.options;
            var doit = function(i){
                iskeyed = 1;
                se.selectedIndex = i;
                txt = o[i].innerHTML;
                sp.html(txt);
                if(op){ //如果有弹出层，对应的高亮需要定位
                    $('dd.on', op).removeClass('on');
                    var s = $('dd[index='+ i +']', op).addClass('on');
                    var p = s.position();
                    //判断是否在可视范围内
                    var x = p.top + s.outerHeight() - op.height();
                    if(x > 0){ //在底部
                        op.scrollTop(x + op.scrollTop());
                    }else if(p.top < 0){ //在头部
                        op.scrollTop(op.scrollTop() + p.top);
                    }
                }
            };
            switch(e.keyCode){
                case 38: //Key up
                if(i > 0){
                    i--;
                    doit(i);
                }
                return false;
                case 40: //Key down
                if(i < o.length - 1){
                    i++;
                    doit(i);
                }
                return false;
                case 13: //Key Enter
                if(iskeyed){
                    iskeyed = 0;
                    $se.trigger('change');
                }
                break;
            }
        });
        //定时检查Select更新
        var dot = function(){
            index = se.selectedIndex;
            if(index >= 0){
                var x = se.options[index].innerHTML;
                if(x !== txt){
                    txt = x;
                    sp.html(txt);
                }
            }
            if(se.disabled !== dis){
                dis = se.disabled;
                if(dis){
                    da.addClass('ds');
                    clear();
                }else{
                    da.removeClass('ds');
                }
            }
        };
        dot();
        timehandle.push(setInterval(dot, 300));//如果值设得小反应比较快，但耗资源比较大；如果设得比较大反应慢，但耗资源比较小。测试证明0.3秒比较合适。
    });
};
})(jQuery);
