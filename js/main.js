/**
* @author sr_<nmlixa@163.com>
* @date  2019/02/14 15:30:25
*/
layui.use(['element', 'layer'], function () {
  var $ = layui.$,
    layer = layui.layer
    version = 'beta 1.4.1';


  var contentBox = $('.main-content'),
    exportsBox = $('#exports-box'),
    _line = _createLineDom('#00dffc', true),
    contmenu = document.createElement('div'),
    _oldLine,
    _scale = 1,
    idNum = 1,
    cardNum = 1;

  function initElement() {
    $('#upload-img').on('change', uploadImg);

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

    $('#clear-other').on('click', setOther);
    _Tip('#clear-other', '清除内容面板中：分割线与删除按钮');

    $('#clear-all').on('click', clearAll);
    _Tip('#clear-all', '清除内容面板中：分割线、删除按钮、遮罩面板');

    $('#split-create').on('click', exportsCanvas)
    _Tip('#split-create', '输出选中遮罩面板到输出区');

    $('#to-image').on('click', toImage)
    $('#down-image').on('click', downImage)
    $('#clear-exports').on('click', clearExports)

    setFullScreenCenter();
    $(window).on('resize', setFullScreenCenter);

    initStartEndBtn();
    initScaleControls();
    ContMenu();
    initToolsBtn();
    $('.version').text(version);

    setExportBoxWidth();

  }

  initElement();

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

  function _createLineDom(bgcolor, isglobal) {
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
        var tmpId = $(this).attr('class').split(' ')[1];

        $(this).css('transform', 'scaleY(5)');
        
        $(removeBtn).css({
          top: parseInt($(this).css('top')) - (parseInt($(removeBtn).css('width')) / 2) + 'px',
          left: '-' + parseInt($(removeBtn).css('width')) + 'px',
          display: 'inline-block',
          zIndex: 999992
        }).on('click', function () {
          $('.' + tmpId).remove();
          $(removeBtn).remove();
          _oldLine = '';
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
  function initToolsBtn(ev) {
    var oBtns = $('.top2-ools-box .addline');
    
    oBtns.each(function (index, node) {
      $(node).on('click', function (){
        contMove(ev, $(this).attr('data-px'));
        addLine();
      }).on('mouseenter', function (){
        if ($(this).attr('data-px') === '100%'){
          $(this).attr('data-px', contentBox.height()).attr('title', contentBox.height());
        }
      })
    })    
  }

  function initScaleControls(){
    var subBtn = $('#scale-sub'),
      plusBtn =$('#scale-plus'),
      initBtn = $('#scale-init'),
      _scale = 1;

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
      height: 230 + 'px',
      background: '#eee',
      border: 'solid 1px #aaa',
      zIndex: 999999
    }).on('click', function () {
      return false;
    }).attr('class', 'contextMenu');

    contentBox.append(contmenu);

    return $(contmenu);
  }

  function setFullScreenCenter(ev, node) {
    var clientWidth = document.documentElement.clientWidth;
    var left = parseInt((parseInt(contentBox.css('width') * _scale) - clientWidth) / 2);
    if (node) {
      $(node).css('margin-left', -left + 'px');
    } else {
      contentBox.css('margin-left', -left + 'px');
    }    
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

  function uploadImg() {
    var file = $(this).get(0).files[0],
      contentbox = contentBox,
      imageType = /images*/;
    
    if (!file.type.match(imageType)) {
      layer.msg('请选择一张图片！');
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

    var line = _createLineDom('#00f');

    if (_oldLine && parseInt($(_line).css('top')) > parseInt($(_oldLine).css('top'))) {
      var _oDiv = _creMask(),
        removeBtn = document.createElement('div'),
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
        top: parseInt($(_oldLine).css('top')) - 1 + 'px',
        height: parseInt($(_line).css('top')) - parseInt($(_oldLine).css('top')) + 'px',
        'background-image': contentBox.css('background-image'),
        'background-position': 0 + ' ' + -parseInt($(_oldLine).css('top')) + 'px',
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
      console.log('add line of top:', $(_line).css('top'));
    }

    $(line).css({
      top: $(_line).css('top')
    })

    contentBox.append(line);
    _oldLine = line;
  }

  function __creEl(name) {
    return document.createElement(name);
  }

  function _creContextMenuList(ev, nodes) {
    var removeBtn = __creEl('button'),
      setBtn = __creEl('button');
    
    $(contmenu).html('');

    if ($(nodes[0]).attr('class') === 'main-content'){
      $(contmenu).append('<div class="layui-field-box">主内容区</di>')
    } else {
      $(contmenu).append('<div class="layui-field-box">设置</di>')
      var isLine = $(nodes[0]).hasClass('line'),
      card = $(nodes[0]),
      plateRemoveBtn = $(nodes[1]);

      $(removeBtn).css({
        width: '100%',
      }).addClass('layui-btn').text('删除节点').on('click', function(){
        nodes.forEach(function (node) {
          $(node).remove();
        })
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
            <input class="layui-input card-name" type="text" placeholder="输入版块名称">
          </div>
          `,
          success: function () {
            $('#set-plate-div .card-name').focus();
          },
          yes: function (index){
            card.append(`<span class="card-name">${$('#set-plate-div .card-name').val()}</span>`);
            layer.close(setLayer);
          },
          btn2: function (index) {
            layer.close(setLayer);
          }
        })
      });
  
      $(contmenu).append(removeBtn);
      !isLine && $(contmenu).append(setBtn);
    }

    $(contmenu).css({
      display: 'inline-block',
      top: ev.clientY + 'px',
      left: ev.clientX + 'px'
    })
  }

  function exportsCanvas() {
    var splitCards = contentBox.find('.split-card');

    if(!isHaveContCard()) return;

    var loading = layer.load(1, {shade: 0.5});
    setOther('hide');
    setExportBoxWidth();
    setFullScreenCenter(1, exportsBox);
    contentBox.find('.card-remove-btn').hide();
    
    setTimeout(function () {
      let i = 0,
        allLength = splitCards.length+1,
        aClass;
      for (let el of splitCards) {
        html2canvas(el).then(function (canvas) {
          aClass = $(el).attr('class').split(' ');
          $(canvas).attr('class', aClass[4]);
          exportsBox.append(canvas);
          i++;
          layer.msg(`共：${allLength}个，第${i}个`, {
            offset: 't'
          });
          if (i === splitCards.length) {
            layer.close(loading);
            layer.msg('输出完成');
            setOther('show');
          }
        })
      }
    }, 100)

    $('#down-image').text('转换图片');
    
  }

  function setOther(method) {
    method = method || 'remove';

    if (method === 'remove') {
      contentBox.find('.line').remove();
      contentBox.find('.remove-btn').remove();
      topMsg();
    } else if (method === 'hide') {
      contentBox.find('.line').hide();
      contentBox.find('.remove-btn').hide();
      topMsg('已隐藏');
    } else if (method === 'show') {
      contentBox.find('.line').show();
    }

  }
  function setExportBoxWidth() {
    exportsBox.css('width', contentBox.css('width'));
  }

  function topMsg(msg) {
    msg = msg || '已清除';
    layer.msg(msg, {
      time: 500,
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
    isHaveCanvas();

    $('#exports-box canvas').each(function (i, c) {
      $(c).replaceWith(canvasToImage(c));
    })
    
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
    var img = document.createElement('img');
    img.src =  canvas.toDataURL("image/jpg");
    return img;
  }
  function downImage() {
    contentBox.find('.line').remove();
    contentBox.find('.removeBtn').remove();
    if (isHaveCanvas() === 'notCanvas')return;

    var exportImgs = $('#exports-box img');

    if (!exportImgs.get(0)) {
      toImage();
      $('#down-image').text('点击下载');
    } else {
      exportImgs.each(function (i, val) {
        download('pro' + i, $(val).attr('src'));
      })
    }
    
  }
  function isHaveCanvas() {
    if (!exportsBox.html()) {
      layer.msg('没有转换canvas元素！');
      return 'notCanvas';
    }
  }
  function isHaveContCard() {
    if (!contentBox.find('.card-mask').get(0)) {
      layer.msg('没有card-mask层！');
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
});