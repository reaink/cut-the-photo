/**
* @author sr_<nmlixa@163.com>
* @date  2019/02/14 15:30:25
*/
layui.use(['element', 'layer'], function () {
  var $ = layui.$,
    layer = layui.layer
    version = 'dev 1.3.1';


  var contentBox = $('.main-content'),
    exportsBox = $('#exports-box'),
    _line = _createLineDom('#00dffc', true),
    contmenu = document.createElement('div'),
    _oldLine,
    _scale = 1,
    idNum = 0;

  function initElement() {

    $('#upload-img').on('change', uploadImg);

    contentBox.on('mouseenter', function () {
      $(contentBox).append(_line);
    });
    contentBox.on('mouseleave', function () {
      $(_line).remove();
    });

    contentBox.on('mousemove', contMove)

    contentBox.on('mousemove', contMove)

    contentBox.on('click', addLine)

    $('#clear-other').on('click', clearOther);
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
    initContMenu();


    $('.version').text(version);
  }

  initElement();

  function _Tip(el, msg) {
    var Tip;
    $(el).on('mouseenter', function () {
      Tip = setTimeout(function () {
        layer.tips(msg, el, {
          tips: 3
        });
      }, 2000);
    }).on('mouseleave', function () {
      clearTimeout(Tip);
    })
  }

  function _createLineDom(bgcolor, isglobal) {
    var line = document.createElement('div'),
      removeBtn = document.createElement('div');
      bgcolor = bgcolor || '#00dffc';

    $(line).css({
      position: 'absolute',
      width: '100%',
      height: '1px',
      background: bgcolor,
      zIndex: 999991
    })

    $(removeBtn).css({
      display: 'none',
      position: 'absolute',
      'border-radius': '50%',
      width: '30px',
      height: '30px',
      background: '#ccc',
      color: 'red',
      'text-align': 'center',
      'line-height': '30px',
      cursor: 'pointer'
    }).text('X');

    $(removeBtn).addClass('removeBtn');

    contentBox.append(removeBtn);

    $(line).addClass('line line-' + idNum++);

    if (!isglobal) {
      $(line).on('mouseover', function (ev) {
        ev = ev || event;
        var tmpId = $(this).attr('class').split(' ')[1];
        
        $(removeBtn).css({
          top: parseInt($(this).css('top')) - (parseInt($(removeBtn).css('width')) / 2) + 'px',
          left: '-' + parseInt($(removeBtn).css('width')) + 'px',
          display: 'inline-block',
          zIndex: 999992
        })

        $(removeBtn).on('mouseover', function () {
          $(this).show();
          $('.card-remove-btn').hide();
        }).on('mouseout', function () {
          setTimeout(function () {
            $(removeBtn).hide();
          }, 500);
        }).on('click', function () {
          $('.' + tmpId).remove();
          $(removeBtn).remove();
          _oldLine = '';
          return false;
        })

      }).on('mouseleave', function (){
        setTimeout(function () {
          $(removeBtn).hide();
        }, 1000);
      })
    } else {
      $(line).addClass('pub_line');
    }
    return line;
  }
  function _creAddLineBtn(tipMsg) {
    var addLineBtn = document.createElement('div');

    $(addLineBtn).css({
      position: 'absolute',
      right: '-50px',
      cursor: 'pointer',
      padding: 0,
      width: '38px',
    }).addClass('layui-btn layui-btn-radius layui-btn-primary').text('←');

    _Tip(addLineBtn, tipMsg);

    return addLineBtn;
  }
  function initStartEndBtn(ev) {
    var startBtn = _creAddLineBtn('添加顶部分隔线'),
      endBtn = _creAddLineBtn('添加底部分隔线');
    
    $(startBtn).css('top', '-21px').on('mousemove', function() {
      contMove(ev, '0');
      contentBox.off('mousemove');
    }).on('mouseleave', function() {
      contentBox.on('mousemove', contMove);
    });
    $(endBtn).css('bottom', '-15px').on('mousemove', function() {
      contMove(ev, parseInt(contentBox.height()));
      contentBox.off('mousemove');
    }).on('mouseleave', function() {
      contentBox.on('mousemove', contMove);
    });

    contentBox.append(startBtn);
    contentBox.append(endBtn);
    
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
      $('body').css({
        zoom: (_scale -= 0.25)
      });
      setFullScreenCenter();
    })
    plusBtn.on('click', function (){
      $('body').css({
        zoom: (_scale += 0.25)
      });
      setFullScreenCenter();
    })
    initBtn.on('click', function (){
      $('body').css({
        zoom: 1
      });
      setFullScreenCenter();
      _scale = 1;
    })
  }
  function initContMenu(){
    $(window).on('scroll', function (){
      $(contmenu).hide();
      
      onContBoxEvent();
    })
    $(contmenu).css({
      display: 'none',
      position: 'fixed',
      width: 200 + 'px',
      height: 300 + 'px',
      background: '#eee',
      border: 'solid 1px #aaa',
      zIndex: 999999
    })
    contentBox.append(contmenu);
  }

  function setFullScreenCenter(s) {
    var clientWidth = document.documentElement.clientWidth;
    var left = (parseInt(contentBox.css('width')) - clientWidth) / 2;
    if (s) {
      $(s).css('margin-left', -left + 'px');
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

    console.log('add line of top:', $(_line).css('top'));

    if (_oldLine && parseInt($(_line).css('top')) > parseInt($(_oldLine).css('top'))) {
      var _oDiv = _creMask(),
        removeBtn = document.createElement('div'),
        isOut;

      $(removeBtn).attr('class', 'card-remove-btn');
      
      $(removeBtn).css({
        display: 'none',
        position: 'absolute',
        'border-radius': '50%',
        width: '30px',
        height: '30px',
        background: '#ccc',
        color: 'red',
        'text-align': 'center',
        'line-height': '30px',
        background: '#999',
        zIndex: 999992,
        cursor: 'pointer'
      }).text('X').on('mouseenter', function () {
        contentBox.off('mousemove');
        clearTimeout(isOut);
      }).on('mouseleave', function () {
        contentBox.on('mousemove', contMove);
        isOut = setTimeout(function () {
          $(removeBtn).hide();
        }, 500)
      });

      $(_oDiv).addClass('card-mask card-' + idNum++);

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
      }).on('mouseenter', function (ev) {
        $('.pub_line').hide();
        offContBoxEvent();
        $(removeBtn).css({
          top: parseInt($(_oDiv).css('top')) + (parseInt($(_oDiv).height()) / 2) - (parseInt($(removeBtn).height()) / 2) + 'px',
          right: '-' + $(removeBtn).css('width'),
          display: 'inline-block'
        })
        clearTimeout(isOut);
      }).on('mouseleave', function () {
        $('.pub_line').show();
        onContBoxEvent();
        isOut = setTimeout(function () {
          $(removeBtn).hide();
        }, 500)
      }).on('contextmenu', function (ev) {
          offContBoxEvent();
          var removeBtn = document.createElement('button');

          $(contmenu).html('');

          $(removeBtn).css({
            width: '100%',
            height: 30 + 'px'
          }).text('删除节点');

          $(contmenu).append(removeBtn);

          $(contmenu).css({
            display: 'inline-block',
            top: ev.clientY + 'px',
            left: ev.clientX + 'px'
          })
        
        return false;
      });
      $(removeBtn).on('click', function (){
        var tmpId = $(_oDiv).attr('class').split(' ')[3];
        $('.' + tmpId).remove();
        $(removeBtn).remove();
        
        return false;
      })

      contentBox.append(_oDiv);
    }

    $(line).css({
      top: $(_line).css('top')
    })

    contentBox.append(line);
    _oldLine = line;
  }

  function offContBoxEvent() {
    $(contentBox).off('mousemove');
    $(contentBox).off('click');
  }
  function onContBoxEvent() {
    $(contentBox).on('mousemove', contMove);
    $(contentBox).on('click', addLine);
  }

  function exportsCanvas() {
    var splitCards = contentBox.find('.split-card');

    clearOther();
    contentBox.find('.card-remove-btn').hide();

    setFullScreenCenter(exportsBox);
    
    setTimeout(function () {
      let i = 0;
      for (let el of splitCards) {
        html2canvas(el).then(function (canvas) {
          exportsBox.append(canvas);
          i++;
          if (i === splitCards.length) {
            layer.msg('输出完成');
          }
        })
      }
    }, 100)

    $('#down-image').text('转换图片');
    
  }

  function clearOther() {
    contentBox.find('.line').remove();
    contentBox.find('.removeBtn').remove();

    topMsg();
  }

  function topMsg(msg) {
    msg = msg || '已清除';
    layer.msg(msg, {
      offset: 't',
      anim: 6
    });
  }

  function clearAll() {
    clearOther();
    contentBox.find('.mask').remove();
    contentBox.find('.card-remove-btn').remove();

    topMsg();
  }

  function toImage() {
    var canvas = $('#exports-box canvas');
    testNullReturn();
    canvas.each(function (i, c) {
      $(c).replaceWith(canvasToImage(c));
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
    testNullReturn();

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
  function testNullReturn() {
    if (!exportsBox.html()) {
      layer.msg('没有转换canvas元素！');
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