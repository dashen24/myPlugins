/*global jQuery:false, $:false, window:false */
/**
 * jQuery 文件上传控件，参考 AJAX Upload ( http://valums.com/ajax-upload/ ),
 * request jquery 1.4
 * Thanks to Andris Valums
 *
 * Copyright (c) 2010 Mike Chen (mike.cyc@gmail.com)
 *
 * @version 1.2.8
 * @author Mike Chen
 * @mailto mike.cyc@gmail.com
 * @modify Mike Chen (mike.cyc@gmail.com)
**/

/**
 * 修改记录
 * 1.1.1 [2010-05-06] 新增HTML代码清除时清除一些无用的元素
 * 1.1.2 [2010-05-06] 修改鼠标移过去时高亮，如果移动速度太快时鼠标移出去还是保持高亮的问题
 * 1.1.3 [2010-05-06] 增加文件上传Disable的功能
 * 1.2.0 [2010-06-08] 增加自动从PDA上传文件
 * 1.2.1 [2010-12-28] 对一些变量进行缩写处理
 * 1.2.2 [2010-12-28] 增加没有自动上传时绑定表单上传的功能
 * 1.2.3 [2010-12-31] 增加action为函数的功能
 * 1.2.4 [2011-01-28] 修改绑定在所有者对象上的事情没有清除的Bug
 * 1.2.5 [2011-03-17] 修改默认返回responseJSON为true
 * 1.2.6 [2011-04-12] 增加文件上传的一些队列功能，避免并行上传
 * 1.2.7 [2011-09-09] 修改成功的方式，只有返回200状态的才表示成功；允许在元素附加的data里增加filedata={name:value,...}来附加数据发送到服务器
 * 1.2.8 [2011-11-03] 修改在弹出方式下清除对象出现错误的bug
**/

(function($){

var bd = $('body'), cu = (new Date()).getTime(), cv = $('<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:#FFF;z-index:9998;filter:Alpha(opacity=0);opacity:0;_padding:99px 0;"></div>'),
st = {// air: 判断是否运行在AIR
    // Location of the server-side upload script, String or Function
    action: '',
    // File upload name
    name: 'userfile',
    // Additional data to send, {name：value}
    data: [],
    // Submit file as soon as id's selected，当为false的时候，data将失效
    autoSubmit: true,
    // 队列名称
    queue: 'fileupload',
    //是否返回JSON格式
    responseJSON: true,
    // Class applied to button when mouse is hovered
    hoverClass: 'hover',
    // own dom
    own: document,
    // When user selects a file, useful with autoSubmit disabled
    // You can return false to cancel upload
    change: function(name, ext){
    },
    // Callback to fire before file is uploaded
    // You can return false to cancel upload
    beforeSend: function(name, ext){
    },
    // Fired when file upload is successed
    success: function(name, ext, res){
    },
    // Fired when file upload is completed
    complete: function(name, ext){
    },
    // Fired when file upload is failed
    error: function(name, ext, ex){
    }
};

//设置默认参数
$.fileuploadSetup = function(s){
    $.extend(st, s);
};

$.fn.fileupload = function(s) {
    //应用新设置
    s = $.extend({}, st, s);
    return this.each(function(){
        var d = this, $d = $(d), bridge = window.parentSandboxBridge, div, file, name, ext, ld,//指示是否正在加载数据
        id = 'fileupload' + (cu++);//产生随机数
        if(s.air && bridge && bridge[s.air]){
            window.childSandboxBridge[id] = function(x){
                s.complete.call(d, name, ext);
                try{
                    x = $.parseJSON(x);
                    if(x['200']){
                        s.success.call(d, name, ext, x);
                    }else{
                        s.error.call(d, name, ext, x);
                    }
                }catch(es){
                    s.error.call(d, name, ext, es);
                }
            };
            $d.click(function(){
                if(false !== s.beforeSend.call(d, name, ext)){
                    bridge[s.air]($('<a href="'+ ($.isFunction(s.action)? s.action(): s.action) +'"></a>')[0].href, id);
                }
            });
            $(s.own).bind('empty.'+id, function(){
                delete window.childSandboxBridge[id];
            });
            return;
        }
        var submit = function(){
            if(!name){return;}
            if(false === s.beforeSend.call(d, name, ext)){
                div.remove();
                cv.remove();
                div = 0;
                name = '';
                ext = '';
                return;
            }
            ld = 1;
            var i, j, sd = s.data,
            iframe = $('<iframe name="' + id + '" style="display:none;"/>'),
            form = $('<form method="post" enctype="multipart/form-data" action="'+ ($.isFunction(s.action)? s.action(): s.action) +'" target="'+ id +'" style="position:absolute;left:-99999px;width:0;"></form>'),
            clear = function(){
                form.remove();
                setTimeout(function(){iframe.remove();}, 999);//Fixed Firefox
                try{
                    div.remove();
                    cv.remove();
                }catch(e){}
                bd.data(s.queue, 0).dequeue(s.queue);
                div = 0;
                file = 0;
                name = '';
                ext = '';
                ld = 0;
                $(s.own).unbind('.'+id);//取消所有者绑定事件
            };
            bd.append(iframe).append(form);
            for(i=0,j=sd.length; i<j; i++){
                form.append('<input type="hidden" name="'+ sd[i].name +'" value="'+ (sd[i].value || '') +'"/>');
            }
            //增加在元素上附加数据的功能[20110909]
            sd = $d.data('filedata');
            if($.isPlainObject(sd)){
                for(i in sd){
                    form.append('<input type="hidden" name="'+ i +'" value="'+ (sd[i] || '') +'"/>');
                }
            }
            
            form.append(file);
            iframe.bind('load', function(e){
                var t = e.target, response, doc;
                try{
                    doc = t.contentDocument || window.frames[id].document;
                }catch(ex){//IE8 在返回的状态不是200时拒绝访问里面的内容
                    s.complete.call(d, name, ext);
                    s.error.call(d, name, ext, ex);
                    clear();
                    return;
                }
                // fixing Opera 9.26,10.00
                if (doc.readyState && doc.readyState !== 'complete') {
                   // Opera fires load event multiple times
                   // Even when the DOM is not ready yet
                   // this fix should not affect other browsers
                   return;
                }

                // fixing Opera 9.64
                if (doc.body && doc.body.innerHTML === "false") {
                    // In Opera 9.64 event was fired second time
                    // when body.innerHTML changed from false
                    // to server response approx. after 1 sec
                    return;
                }
                if(!doc.body){return;}
                
                // If the document was sent as 'application/javascript' or
                // 'text/javascript', then the browser wraps the text in a <pre>
                // tag and performs html encoding on the contents.  In this case,
                // we need to pull the original text content from the text node's
                // nodeValue property to retrieve the unmangled content.
                // Note that IE6 only understands text/html
                if (doc.body.firstChild && doc.body.firstChild.nodeName.toUpperCase() === 'PRE') {
                    response = doc.body.firstChild.firstChild.nodeValue;
                }else{
                    response = doc.body.innerHTML;
                }
                if(!response){
                    // s.complete.call(d, name, ext);
                    // s.error.call(d, name, ext, '');
                    // clear();
                    return;
                }
                if(s.responseJSON){
                    try{
                        response = $.parseJSON(response);
                    }catch(es){
                        s.complete.call(d, name, ext);
                        s.error.call(d, name, ext, es);
                        clear();
                        return;
                    }
                }
                s.complete.call(d, name, ext);
                if(response['200']){
                    s.success.call(d, name, ext, response);
                }else{
                    s.error.call(d, name, ext, response);
                }
                clear();
            });
            bd.delay(99, s.queue).queue(s.queue, function(){//Fixed Firefox for delay 99ms
                bd.data(s.queue, 1);
                form[0].submit();
            });
            if(!bd.data(s.queue)){
                bd.dequeue(s.queue);
            }
        };
        $d.mouseover(function(){
            if(ld || d.disabled || /(dis\s*$)|(dis\s+)/.test(d.className)){return;}
            var t = $(this).addClass(s.hoverClass), f = t.offset(),
            clr = function(){
                if(t){t.removeClass(s.hoverClass);}
                if(div){div.css({left:-99999});}
                cv.remove();
            };
            if(div){
                div.css({
                    top: Math.round(f.top),
                    left: Math.round(f.left),
                    width: Math.round(t.outerWidth(true)),
                    height: Math.round(t.outerHeight(true))
                });
                bd.append(cv);
                cv.mousemove(clr);
            }else{
                div = $('<div style="position:absolute;top:'+ Math.round(f.top) +'px;left:'+ Math.round(f.left) +'px;width:'+ Math.round(t.outerWidth(true)) +'px;height:'+ Math.round(t.outerHeight(true)) +'px;overflow:hidden;opacity:0;z-index:9999;"><input type="file" name="'+ s.name +'" style="position:absolute;right:-200px;top:-99px;margin:0;padding:0;font-size:480px;filter:alpha(opacity=0);cursor:pointer;"/></div>');
                bd.append(div).append(cv);
                cv.mousemove(clr);
                file = div.mouseout(clr).children(':file').change(function(){
                    var v = this.value;
                    if(v){
                        name = v.replace(/.*(\/|\\)/, "");
                        ext = (-1 !== v.indexOf('.')) ? v.replace(/.*[.]/, '') : '';
                        if(false === s.change.call(d, name, ext)){
                            div.remove();
                            cv.remove();
                            div = 0;
                            name = '';
                            ext = '';
                        }
                        if(s.autoSubmit){
                            submit();
                        }
                    }
                }).click(function(){
                    t.removeClass(s.hoverClass);
                });
            }
        });
        if(!s.autoSubmit){//绑定提交事件在From表单上,当表彰提交时提交对应的表单
            $d.closest('form').bind('submit', function(){
                s.data = $(this).serializeArray();
                submit();
                return false;
            });
        }
        
        $(s.own).bind('empty.'+ id, function(){
            if(div){
                div.remove();
                div = 0;
                name = '';
                ext = '';
            }
            cv.remove();
        });
    });
};
}(jQuery));
