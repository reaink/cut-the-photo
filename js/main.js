/**
* @author sr_<nmlixa@163.com>
* @date  2019/02/14 15:30:25
*/
layui.use(['element', 'layer', 'form'], function () {
  var $ = layui.$,
    layer = layui.layer,
    form = layui.form,
    version = 'beta 1.4.5';


  var contentBox = $('.main-content'),
    exportsBox = $('#exports-box'),
    _line = _createLineDom('#00dffc', true),
    _canvas,
    contmenu = __creEl('div'),
    _oldLines = [],
    _scale = 1,
    idNum = 1,
    cardNum = 1,
    imgFormat = 'jpeg';

  function initElement() {
    //control
    initControlBtnsEvent();
    initInternal();

    //view
    initContentBox();
    initSetFullCenter();
    initStartEndBtn();
    initScaleControls();
    ContMenu();
    initToolsBtn();
    setExportBoxWidth();

    //other
    setVersionView();
    initExportsBtn();
  }
  function _createLineDom(bgcolor, isglobal, cardId) {
    var line = document.createElement('div'),
      removeBtn = document.createElement('i'),
      timer;

    bgcolor = bgcolor || '#00dffc',

    $(line).css({
      position: 'absolute',
      width: '100%',
      height: '1px',
      background: bgcolor,
      zIndex: 999991
    }).addClass('line line-' + idNum++);

    $(removeBtn).css({
      display: 'none',
      'font-size': 30 + 'px',
      position: 'absolute',
      color: '#06f',
      cursor: 'pointer'
    }).addClass('layui-icon layui-icon-close remove-btn').on('mouseover', function () {
      clearTimeout(timer);
      return false;
    }).on('mouseout', function () {
      timer = setTimeout(function () {
        $(line).css({
          background: bgcolor,
          transform: 'scale(1)'
        });
        $(removeBtn).hide();
      }, 1000);
    }).on('mousemove', function () {
      return false;
    }).attr('title', `删除idNum：${idNum}分隔线`);

    if (!isglobal) {
      contentBox.append(removeBtn);

      $(line).on('mouseover', function (ev) {
        ev = ev || event;
        var lineId = $(this).attr('class').split(' ')[1];

        $(this).css('transform', 'scaleY(5)');
        
        $(removeBtn).css({
          top: parseInt($(this).css('top')) - (parseInt($(removeBtn).css('width')) / 2) + 'px',
          left: '-' + parseInt($(removeBtn).css('width')) + 'px',
          display: 'inline-block',
          zIndex: 999992
        }).on('click', function () {
          $('.' + lineId).remove();
          $(removeBtn).remove();
          _oldLines.pop();
          cardId.remove();
          return false;
        });

        return false;
      }).on('mouseenter', function (){
        clearTimeout(timer);
        return false;
      }).on('mousemove', function (){
        $(this).css('background', '#09f');
        return false;
      }).on('mouseleave', function (){
        timer = setTimeout(function () {
          $(line).css({
            background: bgcolor,
            transform: 'scale(1)'
          });
          $(removeBtn).hide();
        }, 1000);
      }).on('click', function (){
        return false;
      }).on('contextmenu', function (ev){
        _creContextMenuList(ev, [line, removeBtn]);
        return false;
      })
    }
    return line;
  }
  function _creAddLineBtn(fontIcon, tipMsg, tips) {
    var addLineBtn = document.createElement('div');

    $(addLineBtn).css({
      position: 'absolute',
      right: '-30px',
      cursor: 'pointer',
      color: '#ccc',
      'font-size': 30 + 'px'
    }).addClass(`layui-icon ${fontIcon}`);

    _Tip(addLineBtn, tipMsg, tips);

    return addLineBtn;
  }
  function _creMask() {
    var oDiv = document.createElement('div');

    $(oDiv).css({
      display: 'inline-block',
      width: '100%',
      background: 'rgba(0,0,0,.8)'
    }).addClass('split-card mask');

    return oDiv;
  }

  function _creContextMenuList(ev, nodes) {
    var removeBtn = __creEl('button'),
      setBtn = __creEl('button'),
      isMainContent = $(nodes[0]).hasClass('main-content'),
      isCardMask = $(nodes[0]).hasClass('card-mask'),
      isExportsBox = $(nodes[0]).hasClass('exports-box'),
      isLine = $(nodes[0]).hasClass('line'),
      card = $(nodes[0]);
    
    $(contmenu).html('');

    if (isMainContent){
      $(contmenu).append(`<div class="layui-field-box">设置 <small>${card.attr('class')}</small></div>`);
      $(contmenu).append(``)
    } else if (isCardMask || isLine) {
      var setName = '';

      //setName
      if (!isLine) {
        if (card.find('.card-name').get(0)) {
          setName = card.find('.card-name').text();
        } else {
          setName = card.attr('class').split(' ')[4];
        }
      } else {
        setName = card.attr('class').split(' ')[1];
      }

      $(contmenu).append(`<div class="layui-field-box">设置 <small>${setName}</small></div>`)

      $(removeBtn).css({
        width: '100%',
      }).addClass('layui-btn').text('删除节点').on('click', function(){
        nodes.forEach(function (node) {
          $(node).remove();
        })
        isLine && contentBox.find('.card-num' + (cardNum-1)).remove();
        _oldLines.pop();
        topMsg('已删除');
        ContMenu().hide();
      });
  
      $(setBtn).css({
        width: '100%',
      }).addClass('layui-btn').text('设置节点').on('click', function(){
        var setLayer = layer.open({
          btn: ['设置', '取消'],
          title: '设置当前版块',
          content: `
          <div id="set-plate-div">
            <form class="layui-form card-data-form">
              <label>版块名称：</label>
              <input class="layui-input card-name" type="text" placeholder="输入版块名称">
              <span class="badge-box"></span>
            </form>
          </div>
          `,
          success: function () {
            var here = this;
            $('.card-data-form').on('submit', function (){
              return false;
            })
            $('#set-plate-div .card-name').focus().keyup(function (ev){
              if (ev.keyCode === 13 && $('#set-plate-div .card-name').val()){
                here.isInputName();
                return false;
              } else if (ev.keyCode === 13 && !$('#set-plate-div .card-name').val()) {
                here.notInputName();
              }
            });

            ContMenu().hide();
          },
          yes: function (index){
            if ($('#set-plate-div .card-name').val()){
              this.isInputName();
              return false;
            } else if (!$('#set-plate-div .card-name').val()) {
              this.notInputName();
            }
          },
          isInputName: function (){
            if (!card.find('.card-name').get(0)){
              card.append(`<span class="card-name">${$('#set-plate-div .card-name').val()}</span>`);
            } else {
              card.find('.card-name').html(`<span class="card-name">${$('#set-plate-div .card-name').val()}</span>`);
            }
            layer.close(setLayer);
          },
          notInputName: function (){
            $('#set-plate-div .badge-box').html('<span class="layui-badge-dot"></span> <span>内容不能为空</span>');
          },
          btn2: function (index) {
            layer.close(setLayer);
          }
        })
      });
  
      $(contmenu).append(removeBtn);
      !isLine && $(contmenu).append(setBtn);
    } else if (isExportsBox){
      $(nodes[1]).each(function (index, el) {
        $(el).on('contextmenu', function () {
          $(contmenu).html('').append(`<div class="layui-field-box">设置 <small>${$(el).attr('class')}</small></div>`);
          return false;
        })
      })
    } else {
      $(contmenu).append(`<div class="layui-field-box">设置 <small>${card.attr('class')}</small></div>`);
    }

    $(contmenu).css({
      display: 'inline-block',
      top: ev.clientY + 'px',
      left: ev.clientX + 'px'
    })
  }
  function __creEl(name) {
    return document.createElement(name);
  }
  function _Tip(el, msg, tips) {
    var Tip;

    tips = tips || 3;

    $(el).on('mouseenter', function () {
      Tip = setTimeout(function () {
        layer.tips(msg, el, {
          tips: tips
        });
      }, 1000);
    }).on('mouseleave', function () {
      clearTimeout(Tip);
    })
  }
  function setVersionView() {
    $('.version').text(version);
  }

  function initInternal() {
  }
  function initContentBox() {
    contentBox.on('mouseenter', function () {
      $(contentBox).append(_line);
    });
    contentBox.on('mouseleave', function () {
      $(_line).remove();
    });

    contentBox.on('contextmenu',function(ev){
      _creContextMenuList(ev, [contentBox]);
      return false;
    }).on('mousemove', contMove).on('click', addLine)
  }
  function initStartEndBtn(ev) {
    var startBtn = _creAddLineBtn('layui-icon-left', '添加顶部分隔线', 2),
      endBtn = _creAddLineBtn('layui-icon-left', '添加底部分隔线', 2);
    
    $(startBtn).css('top', '-16px').on('mousemove', function() {
      contMove(ev, '0');
      return false;
    })
    $(endBtn).css('bottom', '-16px').on('mousemove', function() {
      contMove(ev, parseInt(contentBox.height()));
      return false;
    })

    contentBox.append(startBtn);
    contentBox.append(endBtn);
    
  }
  function initSetFullCenter() {
    setFullScreenCenter();
    $(window).on('resize', setFullScreenCenter);   
  }
  function initToolsBtn(ev) {
    var oBtns = $('.top2-ools-box .addline');
    
    oBtns.each(function (index, node) {
      $(node).on('click', function (){
        contMove(ev, $(this).attr('data-px'));
        addLine();
      }).on('mouseenter', function (){
        if ($(this).attr('data-name') === 'end-btn'){
          $(this).attr('data-px', contentBox.height()).attr('title', contentBox.height());
        }
      })
    })    
  }
  function initControlBtnsEvent() {
    $('#upload-img').on('change', uploadImg);

    $('#clear-other').on('click', setOther);
    _Tip('#clear-other', '清除内容面板中：分割线与删除按钮');

    $('#clear-all').on('click', clearAll);
    _Tip('#clear-all', '清除内容面板中：分割线、删除按钮、遮罩面板');

    $('#split-create').on('click', exportsCanvas)
    _Tip('#split-create', '输出选中遮罩面板到输出区');

    $('#down-image').on('click', downImage)
    $('#clear-exports').on('click', clearExports)
  }

  function initExportsBtn() {
    $('.set-img-format-box button').each(function (index, node) {
      $(node).on('click', function () {
        if (!isHaveCanvas()) return;
        var format = $(this).attr('format');
        $('.img-format').text(format);
        format === 'jpg' && (format = 'jpeg');
        imgFormat = format;
        toImage();
        console.log('setImg:', imgFormat);
      });
    })
  }

  function initScaleControls(){
    var subBtn = $('#scale-sub'),
      plusBtn =$('#scale-plus'),
      initBtn = $('#scale-init');

    initStyle = {
      width: contentBox.css('width'),
      height: contentBox.css('height'),
      margin: contentBox.css('margin')
    }
    
    subBtn.on('click', function (){
      setFullScreenCenter();
      $('body').css({
        zoom: (_scale -= 0.25)
      });
    })
    plusBtn.on('click', function (){
      setFullScreenCenter();
      $('body').css({
        zoom: (_scale += 0.25)
      });
    })
    initBtn.on('click', function (){
      setFullScreenCenter();
      $('body').css({
        zoom: 1
      });
      _scale = 1;
    })
  }
  function ContMenu(){
    $(window).on('scroll', function (){
      $(contmenu).hide();
    })
    $(document).on('click', function (){
        $(contmenu).hide();
    })
    $(contmenu).css({
      display: 'none',
      position: 'fixed',
      width: 200 + 'px',
      background: '#eee',
      border: 'solid 1px #aaa',
      zIndex: 999999
    }).on('mousemove', function () {
      return false;
    }).on('click', function () {
      return false;
    }).attr('class', 'contextMenu');

    $('body').append(contmenu);

    return $(contmenu);
  }

  function setFullScreenCenter(ev, node) {
    var clientWidth = document.documentElement.clientWidth;
    var left = parseInt((parseInt(parseInt(contentBox.css('width')) * _scale) - clientWidth) / 2);
    if (node) {
      $(node).css('margin-left', -left + 'px');
    } else {
      contentBox.css('margin-left', -left + 'px');
      exportsBox.css('margin-left', -left + 'px');
    }
  }

  function uploadImg() {
    var file = $(this).get(0).files[0],
      contentbox = contentBox,
      imageType = /images*/;
    
    if (!file.type.match(imageType)) {
      layer.msg('请选择一张图片！', {
        time: 2000
      });
      return;
    } else {
      var reader = new FileReader();

      reader.onload = function () {
        var img = new Image();
        img.src = reader.result;

        setTimeout(function () {
          $(img).width = img.width + 'px';
          $(img).height = img.height + 'px';

          exportsBox.css('width', img.width + 'px');
          contentbox.css({
            width: img.width + 'px',
            height: img.height + 'px',
            'background-image': 'url(' + reader.result + ')',
            'background-repeat': 'no-repeat',
            'background-size': 'contain',
            'background-position': 'top center',
            'box-shadow': '0 0 5px #999'
          })
          
          clearAll();
          setFullScreenCenter();
          console.log('IMG width:', img.width, ', height:', img.height);
        })
      };


      reader.readAsDataURL(file);
    }
    
  }

  function contMove(ev, clientY) {
    ev = ev || event;
    
    if (clientY) {
      $(_line).css({
        top: clientY + 'px'
      })
    } else {
      $(_line).css({
        top: (ev.clientY - contentBox.offset().top + $(window).scrollTop()) * _scale + 'px'
      })
    }
  }

  function addLine(ev) {
    ev = ev || event;
    
    console.log(parseInt($(_line).css('top')), parseInt($(_oldLines[_oldLines.length - 1]).css('top')));
    
    if (_oldLines && parseInt($(_line).css('top')) > parseInt($(_oldLines[_oldLines.length - 1]).css('top'))) {
      var _oDiv = _creMask(),
        removeBtn = document.createElement('div'),
        line = _createLineDom('#00f', false, _oDiv),
        isOut;

      $(removeBtn).addClass('remove-btn card-remove-btn');
      $(_oDiv).addClass('card-mask card-' + (idNum++) + ' card-num' + cardNum++);

      console.log('add line of top:', $(_line).css('top'), 'cardNum: ', cardNum);

      $(removeBtn).css({
        display: 'none',
        'font-size': 30 + 'px',
        color: '#0af',
        position: 'absolute',
        cursor: 'pointer'
      }).addClass('layui-icon layui-icon-close').on('mouseenter', function () {
        clearTimeout(isOut);
        return false;
      }).on('mousemove', function () {
        return false;
      }).on('mouseleave', function () {
        isOut = setTimeout(function () {
          $(removeBtn).hide();
        }, 500)
      }).attr('title', `删除idNum：${idNum}面板`);

      contentBox.append(removeBtn);

      $(_oDiv).css({
        position: 'absolute',
        top: parseInt($(_oldLines[_oldLines.length - 1]).css('top')) - 1 + 'px',
        height: parseInt($(_line).css('top')) - parseInt($(_oldLines[_oldLines.length - 1]).css('top')) + 'px',
        'background-image': contentBox.css('background-image'),
        'background-position': 0 + ' ' + -parseInt($(_oldLines[_oldLines.length - 1]).css('top')) + 'px',
        'background-repeat': 'no-repeat',
        'background-size': 'cover',
        filter: 'brightness(.8)'
      }).on('mousemove', function (){
        return false;
      }).on('click', function (){
        $(contmenu).is(':visible') && $(contmenu).hide();
        return false;
      }).on('mouseenter', function (ev) {
        $(_line).hide();
        $(removeBtn).css({
          top: parseInt($(_oDiv).css('top')) + (parseInt($(_oDiv).height()) / 2) - (parseInt($(removeBtn).height()) / 2) + 'px',
          right: '-' + $(removeBtn).css('width'),
          display: 'inline-block'
        })
        clearTimeout(isOut);
      }).on('mouseleave', function () {
        $(_line).show();
        isOut = setTimeout(function () {
          $(removeBtn).hide();
        }, 500)
      }).on('contextmenu', function (ev) {
        _creContextMenuList(ev, [_oDiv, removeBtn]);
        return false;
      });
      $(removeBtn).on('click', function (){
        var tmpId = $(_oDiv).attr('class').split(' ')[3];
        $('.' + tmpId).remove();
        $(removeBtn).remove();
        
        return false;
      })

      contentBox.append(_oDiv);
    } else {
      var line = _createLineDom('#00f');
      console.log('add line of top:', $(_line).css('top'));
    }

    $(line).css({
      top: $(_line).css('top')
    })

    contentBox.append(line);
    _oldLines.push(line);
  }

  function exportsCanvas() {
    var splitCards = contentBox.find('.split-card');

    if (!isHaveContCard()) return;
    if (!isDetectZoom()) return;

    var loading = layer.load(1, {shade: 0.5});
    setOther('hide');
    setExportBoxWidth();
    setFullScreenCenter(1, exportsBox);
    contentBox.find('.card-remove-btn').hide();
    exportsBox.css('max-width', 'inherit');
    
    setTimeout(function () {
      let i = 0,
        allLength = splitCards.length+1,
        aClass,
        setNameClass,
        scale = 2;

      for (let el of splitCards) {
        var width = parseInt($(el).width()),
          height = parseInt($(el).height()),
          _canvas = __creEl('canvas');
          
        var opts = {
          canvas: _canvas, //自定义 canvas
          // logging: true, //日志开关，便于查看html2canvas的内部执行流程
          width: width, //dom 原始宽度
          height: height,
          useCORS: true // 【重要】开启跨域配置
        };

        html2canvas(el, opts).then(function (canvas) {
          var context = canvas.getContext('2d');
          // 【重要】关闭抗锯齿
          context.mozImageSmoothingEnabled = false;
          context.webkitImageSmoothingEnabled = false;
          context.msImageSmoothingEnabled = false;
          context.imageSmoothingEnabled = false;

          aClass = $(el).attr('class').split(' ');
          setNameClass = $(el).find('.card-name').text();

          $(canvas).addClass(aClass[4]).addClass(setNameClass);
          exportsBox.append(canvas);
          i++;
          layer.msg(`共：${allLength}个，第${i}个`, {
            offset: 't'
          });
          if (i === splitCards.length) {
            layer.close(loading);
            layer.msg('输出完成', {
              time: 2000
            });
            setOther('show');
            setExportsCanvasContextMenu();
            _creContextMenuList(1, [exportsBox, exportsBox.find('canvas')]);
            ContMenu().hide();
          }
        })
      }
      
    }, 100)    
  }

  function setOther(method) {
    method = method || 'remove';

    if (method === 'remove') {
      contentBox.find('.line,.remove-btn,.card-name').remove();
      topMsg();
    } else if (method === 'hide') {
      contentBox.find('.line,.remove-btn,.card-name').hide();
      contentBox.find('').hide();
      contentBox.find('').hide();
      topMsg('已隐藏');
    } else if (method === 'show') {
      contentBox.find('.line,.card-name').show();
    }

  }
  function setExportBoxWidth() {
    exportsBox.css('width', contentBox.css('width'));
  }
  function setExportsCanvasContextMenu() {
    var canvas = exportsBox.find('canvas');

    canvas.on('contextmenu', function (ev) {
      _creContextMenuList(ev, [exportsBox, canvas]);
      return false;
    })
  }

  function topMsg(msg) {
    msg = msg || '已清除';
    layer.msg(msg, {
      time: 2000,
      offset: 't'
    })
  }

  function clearAll() {
    setOther('remove');
    contentBox.find('.mask').remove();
    contentBox.find('.card-remove-btn').remove();

    topMsg();
  }

  function toImage() {
    // sortCanvas();
    var isFormatJpg = imgFormat === 'jpeg';

    if (isFormatJpg){
      exportsBox.find('.png').remove();
    } else {
      exportsBox.find('.jpeg').remove();
    }

    exportsBox.find('canvas').each(function (i, c) {
      exportsBox.append(canvasToImage(c));
      $(c).hide();
    })

    topMsg('已转换至' + imgFormat + '格式', {
      time: 2000
    });
  
  }
  function sortCanvas() {
    var nNum, oNum, cloneNode;
    $('#exports-box canvas').each(function (i, c) {
      nNum = $(c).attr('class').substr($(c).attr('class').length - 1);
      if (nNum < oNum) {
        cloneNode = $(c).clone(true);
        exportsBox.append(cloneNode);
        $(c).remove();
      }
      console.log(nNum, oNum, nNum < oNum);
      
      oNum = nNum;
    })
    $('#exports-box canvas').each(function (i, c) {
      console.log($(c).attr('class'));
    })
  }
  function canvasToImage(canvas) {
    var img = __creEl('img');
    var setClass = $(canvas).attr('class').split(' ')[1] ? $(canvas).attr('class').split(' ')[1] : $(canvas).attr('class').split(' ')[0];

    $(img).attr('src', canvas.toDataURL("image/" + imgFormat))
    .addClass(setClass).addClass(imgFormat).css({
      width: $(canvas).css('width'),
      height: $(canvas).css('height')
    });
    return img;
  }
  function downImage() {
    contentBox.find('.line').remove();
    contentBox.find('.removeBtn').remove();
    if (isHaveCanvas() === 'notCanvas')return;

    var exportImgs = $('#exports-box img');

    exportImgs.each(function (i, val) {
      download($(val).attr('class').split(' ')[0], $(val).attr('src'));
    })
  }
  function isHaveCanvas() {
    if (!exportsBox.html()) {
      layer.msg('没有转换canvas元素！', {
        time: 2000
      });
      return false;
    } else {
      return true;
    }
  }
  function isHaveContCard() {
    if (!contentBox.find('.card-mask').get(0)) {
      layer.msg('没有card-mask层！', {
        time: 2000
      });
      return false;
    } else {
      return true;
    }
  }
  function clearExports() {
    exportsBox.html('');
  }
  function download(name, data) {
    downloadFile(name, data);
  }
  function downloadFile(fileName, content) {
    let aLink = document.createElement('a');
    let blob = base64ToBlob(content); //new Blob([content]);

    let evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", true, true);//initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);

    aLink.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));//兼容火狐
  }
  function base64ToBlob(code) {
    let parts = code.split(';base64,');
    let contentType = parts[0].split(':')[1];
    let raw = window.atob(parts[1]);
    let rawLength = raw.length;

    let uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], {type: contentType});
  }
  function detectZoom (){
    var ratio = 0,
      screen = window.screen,
      ua = navigator.userAgent.toLowerCase();
   
     if (window.devicePixelRatio !== undefined) {
        ratio = window.devicePixelRatio;
    }
    else if (~ua.indexOf('msie')) {  
      if (screen.deviceXDPI && screen.logicalXDPI) {
        ratio = screen.deviceXDPI / screen.logicalXDPI;
      }
    }
    else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
      ratio = window.outerWidth / window.innerWidth;
    }
     
     if (ratio){
      ratio = Math.round(ratio * 100);
    }
     
     return ratio;
  }
  function isDetectZoom() {
    var isZoom = detectZoom() === 100;
    
    if (!isZoom) {
      topMsg('当前缩放比例不是100%');
    }
    return isZoom;
  }
  

  initElement();
});