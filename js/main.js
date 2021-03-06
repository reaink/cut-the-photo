/**
* @author sr_<nmlixa@163.com>
* @date  2019/02/14 15:30:25
*/
layui.use(['element', 'layer'], function () {
  var $ = layui.$,
    layer = layui.layer,
    version = 'beta 1.6.0';

  var contentBox = $('.main-content'),
    exportsBox = $('#exports-box'),
    rulerColor = '#00dffc',
    _line = _createLineDom(rulerColor, true),
    _globalRuler = {},
    _canvas,
    ContMenu,//控制
    contmenu = __creEl('div'),//全局右键菜单元素
    _oldLines = [],
    idNum = 1,
    cardNum = 1,
    contWidth = 1200 + 'px',
    imgFormat = 'jpeg',
    setCardID = 0,
    backHistory = {},
    shortcutCreateNames = ['top', 'nav', 'xx1', 'company', 'brand', 'pro', 'join', 'video', 'show', 'news', 'newpro', 'contact'] //;

  //初始化元素
  function initElement() {
    //internal
    initInternal();

    //view
    initContentBox();
    initSetFullCenter();
    ContMenu.init();
    setExportBoxWidth();

    //control
    initControlElEvent();
    initBeforeReload();
    initLocalStroageMgr();
  }
  //控制
  function initControlElEvent() {
    initToolsBtn();
    // initStartEndBtn();
    initExportsBtn();
    initTips();
    initsetContWidth();
    initsetContWidthInput();
    initExportsCode();
    $('#upload-img').on('change', uploadIMG);

    $('#clear-all').on('click', clearAll);
    $('#split-create').on('click', exportsCanvas)

    $('#down-image').on('click', downImage)
    $('#clear-exports').on('click', clearExports)
  }
  function initBeforeReload() {
    $(document).on('keydown', function (ev) {
      ev = ev || event;
      if (ev.keyCode === 116) {
        layer.confirm('是否要刷新页面？<br/>注意：若图片过大，将不会保存在记录中', {
          btn: ['刷新', '取消']
        }, function () {
          setLocalStroage();
          setTimeout(function () {
            $(window).unbind('beforeunload');
            window.location.reload();
          }, 200);
        })

        return false;
      }
    })
    $(window).bind('beforeunload',function () {
      setLocalStroage();
      confirm('是否关闭');
      return '是否关闭？'
    });
  }
  function initLocalStroageMgr() {
    if (isLocalStroage) {
      getLocalStroage();
    }
  }
  //初始内部数据
  function initInternal() {
    setVersionView();
  }
  function setVersionView() {
    $('.version').text(version);
  }
  //init
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
  function initSetFullCenter() {
    setFullScreenCenter();
    $(window).on('resize', setFullScreenCenter);   
  }
  function initToolsBtn(ev) {
    var addLineBtns = $('.top2-tools-box .addline'),
      toToolsBox2Btn = $('.top2-tools-box .to-tools-box2'),
      toToolsBox1Btn = $('#to-tools-box'),
      toolsBox1 = $('.tools-box1'),
      toolsBox2 = $('.tools-box2');
    
    addLineBtns.each(function (index, node) {
      $(node).on('click', function (){
        contMove(ev, $(this).attr('data-px'));
        addLine();
      }).on('mouseenter', function (){
        if ($(this).attr('data-name') === 'end-btn'){
          $(this).attr('data-px', contentBox.height()).attr('title', contentBox.height());
        }
      })
    })

    toToolsBox1Btn.on('click', function () {
      $('body,html').scrollTop($(toolsBox1).offset().top);
    })
    toToolsBox2Btn.on('click', function () {
      $('body,html').scrollTop($(toolsBox2).offset().top);
    })

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
  function initTips() {
    var tip;
    $('[data-tips]').each(function (index, el) {
      $(el).on('mouseenter', function () {
        tip = layer.tips($(el).attr('data-tips'), $(el), {
          tips: 1
        })
      }).on('mouseleave', function name() {
        layer.close(tip);
      })
    })
  }
  function initsetContWidth() {
    if (!$('.set-width-style').get(0)) {
      $('body').append(`
        <style class="set-width-style">
          .split-card .cont {
            width: ${contWidth};
          }
        </style>
      `)
    } else {
      $('style.set-width-style').html(`
        .split-card .cont {
          width: ${contWidth};
        }
    `)
    }
  }
  function initsetContWidthInput() {
    $('#cont-width-slider').on('keydown', function () {
      contWidth = parseInt($('#cont-width-slider').val() - 1) + 'px !important';
      initsetContWidth();
    }).val(parseInt(contWidth));
  }
  function initExportsCode() {
    $('#exports-code').on('click', function () {
      layer.open({
        title: '输出代码',
        scrollbar: false,
        area: ['650px', '500px'],
        content: `
        <div id="set-plate-div">
          <textarea class="layui-textarea exports-code" style="height: 100%"></textarea>
        </div>
        `,
        success: function () {
          var resultCodes = '',
            cards = contentBox.find('.split-card'),
            cardBack;
          
          cards.each(function (index, card) {
            cardBack = $(card).clone(true);

            var codeAll = '',
              setName = cardBack.find('.card-name').text(),
              idName = $(card).attr('class').split(' ')[4],
              nameHasNum = /\d/.test(setName);
            
            cardBack.find('.add-plate').each(function (index, el) {
              $(el).css({
                border: ''
              }).removeClass(`add-plate ${ $(el).attr('class').match(/num\d+/) }`);
              $(el).attr('class') === "" && $(el).removeAttr('class');

              codeAll += $(el).prop('outerHTML').replace(/&quot;/g, "'") + '\n';
            })

            exportTemp = `
  <div${(setName && !nameHasNum) ? ` id="${setName || idName}"` : ''} class="setHeight" style="background:url(images/${setName || idName}.jpg) no-repeat top center; height: ${$(card).height() + 'px'}">${
    codeAll && `
    <div class="cont">
      ${codeAll.trim()}
    </div>
`
}</div>
            `;
            
            resultCodes += '\n' + exportTemp.trim();
          })
          
          $('#set-plate-div').find('.exports-code').text(resultCodes.trim());
        }
      })
    })
  }

  //contmenu
  var ContMenu = {
    init: function () {
      $(window).on('scroll', function (){
        $(contmenu).hide();
        contentBox.on('mousemove', contMove);
        contentBox.on('click', addLine);
      })
      $(document).on('click', function (){
        $(contmenu).hide();
        contentBox.on('mousemove', contMove);
        contentBox.on('click', addLine);
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
    },
    hide: function () {
      $(contmenu).hide();
    },
    event: function (method) {
      if (method === 'on') {
        $(contmenu).on('mousemove', contMove).on('click', addLine);
      } else if (method === 'off') {
        $(contmenu).off('mousemove').off('click');
      }
    }
  }

  //contmove
  function contMove(ev, clientY) {
    ev = ev || event;
    
    if (clientY) {
      $(_line).css({
        top: clientY + 'px'
      })
    } else {
      $(_line).css({
        top: (ev.clientY - contentBox.offset().top + $(window).scrollTop()) + 'px'
      })
    }
  }

  //uploadIMG
  function uploadIMG() {
    var file = $(this).get(0).files[0],
      contentbox = contentBox,
      imageType = /images*/;
    
    if (!file.type.match(imageType)) {
      topMsg('请选择一张图片！');
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
          
          setContEl('clear');
          setFullScreenCenter();
          if (img.width && img.height) {
            topMsg('载入成功');
            idNum = 1;
            cardNum = 1;
            console.log('IMG width:', img.width, ', height:', img.height);
          } else {
            topMsg('载入失败，建议使用Chrome浏览器');
          }
        })
      };

      reader.readAsDataURL(file);
    }
    
  }

  //addline
  function addLine(ev) {
    ev = ev || event;
    
    if (_oldLines && parseInt($(_line).css('top')) > parseInt($(_oldLines[_oldLines.length - 1]).css('top'))) {
      var _oDiv = _creMask(),
        line = _createLineDom('#00f', false, _oDiv);

      $(_oDiv).addClass('card-mask card-' + (idNum++) + ' card-num' + cardNum++);

      console.log('add line of top:', $(_line).css('top'), 'cardNum: ', cardNum);

      $(_oDiv).css({
        position: 'absolute',
        top: parseInt($(_oldLines[_oldLines.length - 1]).css('top')) + 'px',
        height: parseInt($(_line).css('top')) - parseInt($(_oldLines[_oldLines.length - 1]).css('top')) + 'px',
        'background-image': contentBox.css('background-image'),
        'background-position': 0 + ' ' + -parseInt($(_oldLines[_oldLines.length - 1]).css('top')) + 'px',
        'background-repeat': 'no-repeat',
        'background-size': 'cover',
        filter: 'brightness(.8)'
      })
      setCardEvent(_oDiv, ev);
      contentBox.append(_oDiv);
    } else if (parseInt($(_line).css('top')) !== parseInt($(_oldLines[_oldLines.length - 1]).css('top'))) {
      var line = _createLineDom('#00f');
      console.log('add line of top:', $(_line).css('top'));
    }

    if (line) {
      $(line).css({
        top: $(_line).css('top')
      })
      contentBox.append(line);
      _oldLines.push(line);
    }
  }

  //get
  function getLocalStroage() {
    if (localStorage && localStorage.length > 1) {
      var confirmLayer = layer.confirm('读取到历史修改内容，是否载入历史？',{
        title: '历史记录',
        btn: ['读取', '清空记录', '放弃'],
        scrollbar: false
      }, function () {
        contentBox.html('');
        contentBox.attr('style', localStorage.getItem('cont'));

        for (let i = 0; i < localStorage.length; i++) {
          contentBox.append(localStorage.getItem(i));
        }

        setLineEvent($('.line'), $(this).prev()[0], '#00dffc');
        setCardEvent($('.split-card'));
        setAddElEvent($('.split-card .add-plate'));

        $('.line-global,.global-ruler-x,.global-ruler-y').remove();

        idNum = localStorage.getItem('idNum');
        cardNum = localStorage.getItem('cardNum');
        setCardID = localStorage.getItem('setCardID');
        layer.close(confirmLayer);
      }, function () {
        localStorage.clear();
        topMsg('已清空')
        layer.close(confirmLayer);
      }, function () {
        layer.close(confirmLayer);
      })
    }
  }

  //set
  function setFullScreenCenter(ev, node) {
    var clientWidth = document.documentElement.clientWidth;
    var left = parseInt(parseInt(parseInt(contentBox.css('width')) - clientWidth) / 2);
    if (node) {
      $(node).css('margin-left', -left + 'px');
    } else {
      contentBox.css('margin-left', -left + 'px');
      exportsBox.css('margin-left', -left + 'px');
    }
  }
  function setContEl(method) {
    method = method || 'remove';

    if (method === 'remove') {
      contentBox.find('.line,.card-name').remove();
    } else if (method === 'hide') {
      contentBox.find('.line,.card-name').hide();
    } else if (method === 'show') {
      contentBox.find('.line,.card-name').show();
    } else if (method === 'clear') {
      contentBox.find('.line,.card-mask').remove();
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
  function setLocalStroage() {
    if (isLocalStroage() && contentBox.children()) {
      localStorage.clear();
      contentBox.attr('style').length < 2097152 && localStorage.setItem('cont', contentBox.attr('style'));
      localStorage.setItem('idNum', idNum);
      localStorage.setItem('cardNum', cardNum);
      localStorage.setItem('setCardID', setCardID);
      for (let i = 0; i < contentBox.children().length; i++){
        let html = $(contentBox.children()[i]).prop('outerHTML');
        contentBox.attr('style').length < 2097152 && localStorage.setItem(i, html);
      }
    }
  }
  //setEvent
  function setCardEvent(el) {
    $(el).on('mousemove', function (){
      return false;
    }).on('click', function (){
       $(contmenu).is(':visible') &&  $(contmenu).hide();
      return false;
    }).on('mouseenter', function () {
      $(_line).is(':visible') && $(_line).hide();
      contentBox.off('click');
    }).on('mouseleave', function () {
      $(_line).is(':hidden') &&  $(_line).show();
      contentBox.on('click', addLine);
    }).on('contextmenu', function (ev) {
      _creContextMenuList(ev, [$(this)]);
      return false;
    })
    setAddElEvent($(el).find('.add-plate'));
  }
  function setAddElEvent(el) {
    $(el).on('contextmenu', function (ev) {
      _creContextMenuList(ev, [$(this)]);
      return false;
    })
  }
  function setLineEvent(el, cardId, bgcolor) {
    var timer;
    $(el).on('mouseover', function (ev) {
      ev = ev || event;
      $(this).css('transform', 'scaleY(5)');
      return false;
    }).on('mouseenter', function (){
      clearTimeout(timer);
      return false;
    }).on('mousemove', function (){
      $(this).css('background', '#09f');
      return false;
    }).on('mouseleave', function (){
      timer = setTimeout(function () {
        $(el).css({
          background: bgcolor,
          transform: 'scale(1)'
        });
      }, 1000);
    }).on('click', function (){
      return false;
    }).on('contextmenu', function (ev){
      _creContextMenuList(ev, [$(this), cardId]);
      return false;
    })
  }

  //topmsg
  function topMsg(msg, time, offset_) {
    msg = msg || '已清除';
    layer.msg(msg, {
      time: time || 2000,
      offset: offset_ || 't'
    })
  }

  //clear
  function clearExports() {
    exportsBox.html('');
  }
  function clearAll() {
    var clearLayer = layer.confirm('确认清除所有已添加元素？', {
      btn: ['确认', '取消']
    }, function () {
      setContEl('remove');
      _globalRuler.remove();
      idNum = 1;
      cardNum = 1;
      contentBox.find('.mask').remove();
      contentBox.find('.card-remove-btn').remove();
      layer.close(clearLayer);
    })
  }

  //conversion download cavas img
  function exportsCanvas() {
    var splitCards = contentBox.find('.split-card');

    if (!isHaveContCard()) return;
    if (!isDetectZoom()) return;

    clearExports();
    var loading = layer.load(1, {shade: 0.5});
    setContEl('hide');
    setExportBoxWidth();
    setFullScreenCenter(1, exportsBox);
    contentBox.find('.add-plate').hide();
    exportsBox.css('max-width', 'inherit');
    
    topMsg('请稍等……');

    setTimeout(function () {
      let i = 0,
        allLength = splitCards.length+1,
        aClass,
        setNameClass,
        scale = 2;

      splitCards.each(function (index, el) {
        var width = parseInt($(el).width()),
          height = parseInt($(el).height());
        
        _canvas = __creEl('canvas');
          
        var opts = {
          canvas: _canvas,
          // logging: true, // 日志开关，便于查看html2canvas的内部执行流程
          width: width,
          height: height,
          useCORS: true // 开启跨域配置
        };

        html2canvas(el, opts).then(function (canvas) {
          var context = canvas.getContext('2d');
          context.mozImageSmoothingEnabled = false;
          context.webkitImageSmoothingEnabled = false;
          context.msImageSmoothingEnabled = false;
          context.imageSmoothingEnabled = false;

          aClass = $(el).attr('class').split(' ');
          setNameClass = $(el).find('.card-name').text();

          $(canvas).addClass(aClass[4]).addClass(setNameClass);
          exportsBox.append(canvas);
          i++;
          topMsg(`共：${allLength}个，第${i}个`);
          if (i === splitCards.length) {
            layer.close(loading);
            topMsg('输出完成');
            setContEl('show');
            contentBox.find('.add-plate').show();
            setExportsCanvasContextMenu();
            _creContextMenuList(1, [exportsBox, exportsBox.find('canvas')]);
            ContMenu.hide();
          }
        })
      })
      
    }, 500)    
  }
  function toImage() {
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

    topMsg('已转换至' + imgFormat + '格式');
  
  }
  function canvasToImage(canvas) {
    var img = __creEl('img');
    var setClass = $(canvas).attr('class').split(' ')[1] ? $(canvas).attr('class').split(' ')[1] : $(canvas).attr('class').split(' ')[0];

    $(img).attr('src', canvas.toDataURL("image/" + imgFormat, 1))
    .addClass(setClass).addClass(imgFormat).css({
      width: $(canvas).css('width'),
      height: $(canvas).css('height')
    });
    return img;
  }
  function downImage() {
    setContEl('hide');
    if (isHaveCanvas() === 'notCanvas')return;

    var exportImgs = $('#exports-box img'),
      i = 0,
      img;
    
    var timer = setInterval(function () {
      if (i !== exportImgs.length) {
        img = $(exportImgs).get(i - 1);        
        download($(img).attr('class').split(' ')[0], $(img).attr('src'));
        topMsg(`下载第${i}张，共${exportImgs.length}张`);
        i++;
      } else {
        setContEl('show');
        topMsg(`下载共${exportImgs.length}张`, 3000);
        clearInterval(timer);
      }
    }, 200);
  }
  function download(name, data) {
    downloadFile(name, data);
  }
  function downloadFile(fileName, content) {
    let aLink = __creEl('a');
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

  //is
  function isHaveCanvas() {
    if (!exportsBox.html()) {
      topMsg('没有转换canvas元素！');
      return false;
    } else {
      return true;
    }
  }
  function isHaveContCard() {
    if (!contentBox.find('.card-mask').get(0)) {
      topMsg('没有card-mask层！');
      return false;
    } else {
      return true;
    }
  }
  function isLocalStroage() {
    return localStorage;
  }
  function isDelMask() {
    return backHistory['card'];
  }

  //zoom
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

  //_
  function _createLineDom(bgcolor, isglobal, cardId) {
    var line = __creEl('div');

    bgcolor = bgcolor || '#00dffc';
    globalLineColor = bgcolor;

    $(line).css({
      position: 'absolute',
      width: '100%',
      height: '1px',
      background: bgcolor,
      zIndex: 999991
    });

    if (!isglobal) {
      $(line).addClass('line line-' + idNum++);
      setLineEvent($(line), cardId, bgcolor);
    } else {
      $(line).addClass('line line-global');
    }
    return line;
  }

  _globalRuler = {
    init: function (ev) {
      var xRuler = __creEl('div'),
        yRuler = __creEl('div'),
        here = this;
      
      $(xRuler).css({
        position: 'fixed',
        width: '100%',
        height: '1px',
        left: 0,
        top: ev.clientY - 2 + 'px',
        backgroundColor: rulerColor,
        cursor: 'none',
        zIndex: 99999
      }).addClass('global-ruler-x').on('mouseover', function (ev) {
        here.setRulerPos(ev);
      }).on('mouseup', function () {
        here.hide()
      })
      
      $(yRuler).css({
        position: 'fixed',
        width: '1px',
        height: '100%',
        top: 0,
        left: ev.clientX - 2 + 'px',
        backgroundColor: rulerColor,
        cursor: 'none',
        zIndex: 99999
      }).addClass('global-ruler-y').on('mouseover', function (ev) {
        here.setRulerPos(ev);
      }).on('mouseup', function () {
        here.hide()
      })
      
      this.setRuler('x', xRuler);
      this.setRuler('y', yRuler);
      this.addGlobalRuler([xRuler, yRuler]);
    },
    setRuler: function (name, el) {
      this[name] = el;
    },
    getRuler: function (name) {
      return $(this[name])
    },
    setRulerPos: function (ev) {
      this.getRuler('x').show().css({
        top: ev.clientY - 1 + 'px'
      });
      this.getRuler('y').show().css({
        left: ev.clientX - 1 + 'px'
      });
    },
    addGlobalRuler: function (rulers) {
      rulers.map(el => {
        contentBox.append(el);
      })
    },
    isAdd: function () {
      return contentBox.find('.global-ruler-x').get(0)
    },
    hide: function () {
      this.getRuler('x').hide();
      this.getRuler('y').hide();
    },
    remove: function () {
      this.getRuler('x').remove();
      this.getRuler('y').remove();
    }
  }

  function _creContextMenuList(ev, nodes) {
    var removeBtn = __creEl('button'),
      setBtn = __creEl('button'),
      addBtn = __creEl('button'),
      exportsCode = __creEl('button'),
      isMainContent = $(nodes[0]).hasClass('main-content'),
      isCardMask = $(nodes[0]).hasClass('card-mask'),
      isExportsBox = $(nodes[0]).hasClass('exports-box'),
      isLine = $(nodes[0]).hasClass('line'),
      isCustom = $(nodes[0]).hasClass('add-plate'),
      card = $(nodes[0]),
      cardBack,
      setName = '',
      setLayer;
    
    $(contmenu).html('');
    contentBox.off('click');

    if (isMainContent){
      var startBtn = __creEl('button'),
        endBtn = __creEl('button'),
        recoveryCardBtn = __creEl('button');
    
      $(contmenu).append(`<div class="layui-field-box">设置 <small>${card.attr('class')}</small></div>`);
      
      $(startBtn).addClass('layui-btn layui-btn-fluid').on('click', function(ev) {
        contMove(ev, '0');
        addLine();
        ContMenu.hide();
        contentBox.on('mousemove', contMove);
        return false;
      }).text('添加顶部分隔线');
      $(endBtn).addClass('layui-btn layui-btn-fluid').on('click', function(ev) {
        contMove(ev, parseInt(contentBox.height()));
        addLine();
        ContMenu.hide();
        contentBox.on('mousemove', contMove);
        return false;
      }).text('添加底部分隔线');

      $(recoveryCardBtn).addClass('layui-btn layui-btn-fluid').on('click', function (ev) {
        var backCard = backHistory['card'];

        setCardEvent(backCard, ev);
        setAddElEvent(backCard.find('.add-plate'));

        contentBox.append(backCard);
        backHistory['card'] = '';

        ContMenu.hide();
        contentBox.on('mousemove', contMove);
        return false;
      }).text('恢复删除版块');
      
      isDelMask() && $(contmenu).append(recoveryCardBtn);
      $(contmenu).append(startBtn);
      $(contmenu).append(endBtn);
    } else if (isCardMask) {
      if (card.find('.card-name').get(0)) {
        setName = card.find('.card-name').text();
      } else {
        setName = card.attr('class').split(' ')[4];
      }
      
      if (!card.find('.cont').get(0)) {
        cont = __creEl('div');
        $(cont).addClass('cont');
        card.append(cont);
      } else {
        cont = card.find('.cont');
      }

      $(contmenu).append(`<div class="layui-field-box">设置 <small>${setName}</small></div>`)

      $(removeBtn).addClass('layui-btn layui-btn-fluid').text('删除节点').on('click', function(){
        backHistory['card'] = card;
        card.remove();
        _oldLines.pop();
        topMsg('已删除');
        ContMenu.hide();
        contentBox.on('mousemove', contMove).on('click', addLine);
      });
  
      $(setBtn).addClass('layui-btn layui-btn-fluid').text('设置节点').on('click', function(){
        setLayer = layer.open({
          btn: ['设置', '清除', '取消'],
          title: '设置当前版块',
          area: '312px',
          scrollbar: false,
          content: `
          <div id="set-plate-div">
            <div class="layui-btn-container"></div>
            <form class="layui-form card-data-form">
              <label>版块名称：</label>
              <div class="layui-form-item">
                <div class="form-input-box">
                  <input class="layui-input card-name" type="text" placeholder="输入版块名称">
                  <i class="layui-icon layui-icon-close"></i>
                </div>
              </div>
              <span class="badge-box"></span>
            </form>
          </div>
          `,
          success: function () {
            var here = this,
              tmpBtn;
            $('.card-data-form').on('submit', function (){
              return false;
            })

            //如果有历史cardName则填入，如果有数字，则自增
            if (backHistory['cardName']) {
              if (backHistory['cardName'].match(/\d+/)) {
                backHistory['cardName'] = backHistory['cardName'].replace(/\d+/, ~~backHistory['cardName'].match(/\d+/)[0]+1);
              }
              $('#set-plate-div .card-name').val(backHistory['cardName']);
            }

            for (let index in shortcutCreateNames) {
              tmpBtn = $(`<button class="layui-btn layui-btn-xs">${shortcutCreateNames[index]}</button>`);
              tmpBtn.on('click', function () {
                $('#set-plate-div .card-name').val('').val($('#set-plate-div .card-name').val()+shortcutCreateNames[index]).focus();
                backHistory['cardName'] = $(cont).find('.card-name').text();
              });
              $('#set-plate-div .layui-btn-container').append(tmpBtn)
            }

            $('#set-plate-div .card-name').focus().keyup(function (ev){
              if (ev.keyCode === 13 && $('#set-plate-div .card-name').val()){
                here.isInputName();
                return false;
              } else if (ev.keyCode === 13 && !$('#set-plate-div .card-name').val()) {
                here.notInputName();
              }
            })

            $('#set-plate-div .layui-icon-close').on('click', function () {
              $('#set-plate-div .card-name').val('').focus();
            })

            ContMenu.hide();
          },
          yes: function (index){
            if ($('#set-plate-div .card-name').val()){
              this.isInputName();
              return false;
            } else if (!$('#set-plate-div .card-name').val()) {
              this.notInputName();
            }
          },
          isInputName: function (name){
            if (!card.find('.card-name').get(0)){
              $(cont).append(`<span class="card-name">${name || $('#set-plate-div .card-name').val()}</span>`);
            } else {
              $(cont).find('.card-name').text(name || $('#set-plate-div .card-name').val());
            }
            
            $(cont).css({
              width: contWidth,
              height: '100%'
            });
            
            backHistory['cardName'] = $(cont).find('.card-name').text();
            layer.close(setLayer);
          },
          notInputName: function (){
            $('#set-plate-div .badge-box').html('<span class="layui-badge-dot"></span> <span>内容不能为空</span>');
          },
          btn2: function (index) {
            $(cont).find('.card-name').get(0) && $(cont).find('.card-name').remove();
            layer.close(setLayer);
          },
          btn3: function (index) {
            layer.close(setLayer);
          }
        })
      });

      $(addBtn).addClass('layui-btn layui-btn-fluid').text('添加节点').on('click', function () {
        setLayer = layer.open({
          btn: ['设置', '取消'],
          title: '添加节点',
          scrollbar: false,
          content: `
          <div id="set-plate-div">
            <form class="layui-form card-data-form">
              <label>元素名称：</label>
              <input class="layui-input el-name" type="text" placeholder="输入元素名称" value="div">
              <label>元素内容：</label>
              <textarea class="layui-textarea el-cont" type="text" placeholder="输入元素内容"></textarea>
              <label>元素样式：</label>
              <textarea class="layui-textarea el-style" type="text" placeholder="输入元素样式"></textarea>
            </form>
          </div>
          `,
          success: function () {
            var elName = $('#set-plate-div .el-name'),
              elCont = $('#set-plate-div .el-cont'),
              elStyle = $('#set-plate-div .el-style');
            $('.card-data-form').on('submit', function (){
              return false;
            })

            backHistory['setElName'] && elName.val(backHistory['setElName']);
            backHistory['setElCont'] && elCont.val(backHistory['setElCont']);
            backHistory['setElStyle'] && elStyle.val(backHistory['setElStyle']);

            ContMenu.hide();
            elCont.focus().select();
          },
          yes: function (){
            var setDiv = $('#set-plate-div'),
              setElName = setDiv.find('.el-name').val(),
              setElCont = setDiv.find('.el-cont').val(),
              setElStyle = setDiv.find('.el-style').val(),
              node = __creEl(setElName),
              cont,
              currTop = 0,
              currLeft = 0,
              currTop2,
              currLeft2;

            if (!card.find('.cont').get(0)) {
              cont = __creEl('div');
              $(cont).addClass('cont');
              card.append(cont);
            } else {
              cont = card.find('.cont');
            }

            backHistory['setElName'] = setElName;
            backHistory['setElCont'] = setElCont;
            backHistory['setElStyle'] = setElStyle;

            $(cont).css({
              width: contWidth,
              height: '100%'
            });
            
            // format content
            setElCont = `
            ${setElCont.replace(/\n/g, '<br>\n').replace(/\s{2}/g, '&emsp;')}
`;
            card.on('mousedown', function (ev) {
              topMsg('拖动以设置元素宽高');

              $('body').addClass('no-select');
              card.find(`.num${setCardID - 1}`).css('opacity','');
              

              currTop = ev.clientY - ($(cont).offset().top - $(window).scrollTop());
              currLeft = ev.clientX - $(cont).offset().left;
              
              $(this).off('mouseenter').off('mousemove').on('mousemove', function (ev) {
                currTop2 = ev.clientY - ($(cont).offset().top - $(window).scrollTop()),
                currLeft2 = ev.clientX - $(cont).offset().left;
                
                card.find(`.num${setCardID - 1}`).css({
                  width: parseInt(currLeft2 - currLeft) -3 + 'px',
                  height: parseInt(currTop2 - currTop) - 2 + 'px',
                  border: '1px solid #09f',
                  opacity: ''
                })
                if (parseInt(currLeft2 - currLeft) <= 0) {
                  card.find(`.num${setCardID - 1}`).css({
                    width: '',
                    height: '',
                  });
                }

                _globalRuler.setRulerPos(ev);
                return false;
              })
            }).on('contextmenu', function () {
              $(this).off('mouseenter').off('mousemove').off('mousedown');
              $(this).on('mousedown', function () {
                return false;
              }).on('mousemove', function () {
                return false;
              }).on('mouseenter', function () {
                return false;
              })
              return false;
            }).on('mouseenter', function (ev) {
              $(_line).remove();
              $(cont).css('cursor', 'none');
              
              if (!_globalRuler.isAdd()) {
                topMsg('请在当前版块点击并拖动选择添加元素宽高');
                _globalRuler.init(ev);
              }

              currTop = ev.clientY - ($(cont).offset().top - $(window).scrollTop());
              currLeft = ev.clientX - $(cont).offset().left;
              
              if (!$(node).hasClass(`num${setCardID - 1}`)) {
                $(node).addClass(`pos-a add-plate num${setCardID++}`).attr('style', setElStyle).html(setElCont).css({
                  left: parseInt(currLeft) + 'px',
                  top: parseInt(currTop) + 'px',
                  opacity: .5
                })
                
                setAddElEvent(node);
                
                $(this).on('mousemove', function (ev){
                  currTop = ev.clientY - ($(cont).offset().top - $(window).scrollTop());
                  currLeft = ev.clientX - $(cont).offset().left;

                  $(node).css({
                    left: parseInt(currLeft) + 'px',
                    top: parseInt(currTop) + 'px'
                  })
                  _globalRuler.setRulerPos(ev);
                  return false;
                }).off('mouseleave')
              }

              !$(cont).find(node).get(0) && $(cont).append(node);
              !card.find(cont).get(0) && card.append(cont);
              return false;
            }).on('mouseleave', function () {
              _globalRuler.hide();
            }).on('mouseup', function () {
              _globalRuler.hide();
              
              $('body').removeClass('no-select');
              $(_line).show();
              contentBox.on('mousemove', contMove);
              
              $(cont).css('cursor', 'auto');
              card.find(`.num${setCardID - 1}`).css({
                border: ''
              })
              $(this).off('mousedown').off('mousemove').off('mouseup').off('mouseenter').on('mousemove', function () {
                return false;
              }).on('mouseenter', function () {
                return false;
              })
            })
            layer.close(setLayer);
          },
          btn2: function () {
            layer.close(setLayer);
          }
        })

        ContMenu.hide();
      });

      $(exportsCode).addClass('layui-btn layui-btn-fluid').text('输出代码').on('click', function () {
        setLayer = layer.open({
          title: '输出代码',
          scrollbar: false,
          area: ['650px', '500px'],
          content: `
          <div id="set-plate-div">
            <textarea class="layui-textarea exports-code" style="height: 100%"></textarea>
          </div>
          `,
          success: function () {
            var exportsCode = $('#set-plate-div .exports-code'),
              cardBack = card.clone(true),
              codeAll = '',
              setName = cardBack.find('.card-name').text();
      

            cardBack.find('.add-plate').each(function (index, el) {
              $(el).css({
                border: ''
              }).removeClass(`add-plate ${ $(el).attr('class').match(/num\d+/) }`);
              $(el).attr('class') === "" && $(el).removeAttr('class');

              codeAll += $(el).prop('outerHTML').replace(/&quot;/g, "'") + '\n';
            })
            
              exportTemp = `
  <div class="setHeight" style="background:url(images/${setName || card.attr('class').split(' ')[4]}.jpg) no-repeat top center; height: ${ card.height() + 'px'}">${
    codeAll && `<div class="cont">
      ${codeAll.trim()}
    </div>
`
}</div>
              `

            exportsCode.text(exportTemp.trim());
            ContMenu.hide();
            exportsCode.focus().select();
          }
        })

        ContMenu.hide();
      })
  
      $(contmenu).append(removeBtn);
      $(contmenu).append(setBtn);
      $(contmenu).append(addBtn);
      $(contmenu).append(exportsCode);

    } else if (isLine){      
      setName = card.attr('class').split(' ')[1];

      $(contmenu).append(`<div class="layui-field-box">设置 <small>${setName}</small></div>`)

      $(removeBtn).addClass('layui-btn layui-btn-fluid').text('删除节点').on('click', function(){
        card.remove();
        _oldLines.pop();
        ContMenu.hide();
        contentBox.on('mousemove', contMove).on('click', addLine);
      });

      $(contmenu).append(removeBtn);

    } else if (isExportsBox){
      $(nodes[1]).each(function (index, el) {
        $(el).on('contextmenu', function () {
          $(contmenu).html('').append(`<div class="layui-field-box">设置 <small>${$(el).attr('class')}</small></div>`);
          return false;
        })
      })
    } else if (isCustom) {
      $(contmenu).off('mousemove');
      var exportsCode = __creEl('textarea');
        cardBack = card.clone(true),
        removeBtn = $('<button class="layui-btn layui-btn-fluid">删除节点</button>'),
        exportTemp = '';

      //设置版块标题
      $(contmenu).append(`<div class="layui-field-box">设置 <small>${card.attr('class').split(' ')[0]}</small></div>`);

      //删除版块按钮
      $(removeBtn).on('click', function () {
        card.remove();
        ContMenu.hide();
        contentBox.on('mousemove', contMove).on('click', addLine);
      })
      $(contmenu).append(removeBtn);

      //输出代码版块
      cardBack.css({
        border: ''
      }).removeClass(`add-plate ${ cardBack.attr('class').match(/num\d+/) }`);

      cardBack.attr('class') === "" && cardBack.removeAttr('class');

      $(exportsCode).css('height', '180px').addClass('exports-code layui-textarea').text(cardBack.prop('outerHTML').replace(/&quot;/g, "'"));

      $(contmenu).append(exportsCode);
      setTimeout(function () {
        $(exportsCode).focus().select();
      }, 100);
    } else {
      $(contmenu).append(`<div class="layui-field-box">设置 <small>${card.attr('class')}</small></div>`);
    }

    $(contmenu).css({
      display: 'inline-block',
      top: ev.clientY + 'px',
      left: ev.clientX + 'px'
    })
  }
  
  function _creAddLineBtn(fontIcon, title) {
    var addLineBtn = __creEl('div');

    $(addLineBtn).css({
      position: 'absolute',
      right: '-30px',
      cursor: 'pointer',
      color: '#ccc',
      'font-size': 30 + 'px'
    }).addClass(`layui-icon ${fontIcon}`).attr('title', title);

    return addLineBtn;
  }
  function _creMask() {
    var oDiv = __creEl('div');

    $(oDiv).css({
      display: 'inline-block',
      width: '100%',
      background: 'rgba(0,0,0,.8)'
    }).addClass('split-card mask');

    return oDiv;
  }

  //__
  function __creEl(name) {
    return document.createElement(name);
  }

  initElement();
});