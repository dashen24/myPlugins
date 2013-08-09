/**
 * jQuery custom spinner
 *
 * Copyright (c) 2009 Mike Chen (achievo.mike.chen@gmail.com)
 *
 * @version 1.2.0
 * @author Mike Chen
 * @mailto achievo.mike.chen@gmail.com
 * @modify Mike Chen
**/

(function($){
$.fn.spinner = function(os) { //os: options
    //全局设置
    var sts = {
        cls: 'g-spi',  //CSS样式
        owndom: document,
        delay: 500, //延时时间间隔
        intv: 50, //快速增长时间间隔
        insval: 1, //增长的步长
        alternateval: 5,//大幅度增长的步长
        alternatekey: 'shiftKey', //大幅度增长的控制键
        defaultval: 0, //默认值
        minval: null, //最小值
        maxval: null, //最大值
        val: undefined, //覆盖输入框原有的值，如果有值的话。
        fixed: 0, //限定小数位数
        allownull: 1, //值是否允许为空, !0--允许空，0--不允许空
        movezero: 1 //是否移除小数位的0，!0--移除，0--不移除
    }, oh = [], delayH, intvH;
    if(os){$.extend(sts, os);}
    //绑定注销事件
    $(sts.owndom).bind('empty', function(){
        for(var i=0; i<oh.length; i++){
            clearInterval(oh[i]);
        }
        oh = [];
    });
    return this.each(function(){
        if('text' !== this.type){return;}
        var st = $.extend(true, {}, sts),
        t = this, $t = $(this), x,
        keydelay = 1000,//手动输入延迟时间
        keyHandle, //延迟句柄
        dis = false;//是否可用
        //提出单独的设置
        $(['delay', 'intv', 'fixed', 'allownull', 'movezero']).each(function(i, v){//整数型
            x = t.getAttribute(v);
            if(x){
                x = parseInt(x, 10);
                if(!isNaN(x)){
                    st[v] = x;
                }
            }
        });
        $(['insval', 'alternateval', 'defaultval', 'minval', 'maxval']).each(function(i, v){//浮点数
            x = t.getAttribute(v);
            if(x){
                x = parseFloat(x);
                if(!isNaN(x)){
                    st[v] = x;
                }
            }
        });
        $(['cls', 'alternatekey', 'val']).each(function(i, v){//字符串
            x = t.getAttribute(v);
            if(x){
                st[v] = x;
            }
        });
        //设置初始化值
        if(undefined !== st.val){
            t.value = st.val;
        }
        var fix = function(v){//格式化值
            v = parseFloat(undefined === v ? t.value : v);
            if(isNaN(v)){
                if(st.allownull){
                    t.value = '';
                    return;
                }else{
                    v = st.defaultval;
                }
            }
            //控制最大和最小值
            if(null !== st.minval && v < st.minval){
                v = st.minval;
            }else if(null !== st.maxval && v > st.maxval){
                v = st.maxval;
            }
            v = v.toFixed(st.fixed);
            t.value = st.movezero ? parseFloat(v) : v;
        };
        fix();
        $t.attr('autocomplete', 'off').bind('setspinner', function(e, os){//绑定设置的事件 setspinner
            if(os){$.extend(st, os);}
            if(undefined !== os.val){
                t.value = os.val;
            }
            fix();
        }).wrap('<em class="'+ st.cls +'"></em>').after('<span><a href="#" class="u" act="u"></a><ins></ins><a href="#" class="d" act="d"></a></span>');
        var sp = $t.next();
        sp.click(function(e){e.preventDefault();});
        //事件绑定处理
        var spin = function(down, alternate){
            var v = parseFloat(t.value);
            if(isNaN(v)){
                v = st.defaultval;
            }else{
                var incr = alternate ? st.alternateval : st.insval;
                v = down ? v-incr : v+incr;
            }
            fix(v);
        };
        var clearTH = function(e){
            if(delayH){
                clearTimeout(delayH);
                delayH = null;
            }
            if(intvH){
                clearInterval(intvH);
                intvH = null;
            }
            if(!t.disabled && e && 'mouseup' == e.type){t.focus();}
        };
        //绑定定时器
        var timedo = function(){
            if(t.disabled !== dis){
                fix();
                dis = t.disabled;
                if(dis){
                    sp.addClass('ds');
                    $t.addClass('ds');
                }else{
                    sp.removeClass('ds');
                    $t.removeClass('ds');
                }
            }
        };
        timedo();
        oh.push(setInterval(timedo, 500));
        $(sp).mousedown(function(e){
            e.preventDefault();
            if(dis){return;}
            var t = e.target, down, alternate;
            switch(t.getAttribute('act')){
                case 'u':down = false;alternate=e[st.alternatekey];break;
                case 'd':down = true;alternate=e[st.alternatekey];break;
            }
            if(undefined !== down && undefined !== alternate){
                spin(down, alternate);
                if(delayH){clearTimeout(delayH);}
                delayH = setTimeout(function(){
                    delayH = null;
                    spin(down, alternate);
                    if(intvH){
                        clearInterval(intvH);
                    }
                    intvH = setInterval(function(){
                        spin(down, alternate);
                    }, st.intv);
                }, st.delay);
            }
        }).mouseout(clearTH).mouseup(clearTH).click(function(e){
            e.target.blur();
        });
        var qfix = function(){
            var sv = t.value.replace(/[^\d\-\.]/g, '').replace(/^(.+)([\-]+)/g, "$1").replace(/^(\-?)0+([^\.])/, "$1$2").replace(/(\..*)\..*/g, "$1").replace(/\..*/, function($0){
                return st.fixed>0? $0.substr(0, st.fixed + 1) : '';
            });//过滤非法字符
            var v = parseFloat(sv);//控制最大和最小值
            if(!isNaN(v)){
                if(null !== st.minval && v < st.minval){
                    sv = st.minval;
                }else if(null !== st.maxval && v > st.maxval){
                    sv = st.maxval;
                }
            }
            t.value = sv;
        };
        $t.blur(function(){
            fix();
        }).keyup(function(){
            if(keyHandle){
                clearTimeout(keyHandle);
            }
            keyHandle = setTimeout(qfix, keydelay);
        }).keydown(function(e){
            switch(e.keyCode){
                case 38:spin(false, e[st.alternatekey]);e.preventDefault();break;//key up
                case 40:spin(true, e[st.alternatekey]);e.preventDefault();break;//key down
                case 13:fix();e.preventDefault();break;//key Enter
            }
        }).bind('paste', function(){
            setTimeout(qfix, 0);
        });
    });
};
})(jQuery);
