/**
* @author sr_<nmlixa@163.com>
* @date  2019/02/14 15:30:25
*/
layui.use(['element', 'layer'], function () {
  var $ = layui.$,
    layer = layui.layer,
    evClient;


  var contentBox = $('.main-content'),
    _line = _createLineDom('#00dffc', true),
    _oldLine,
    removeBtn = document.createElement('div');

  function initElement() {

    $(removeBtn).css({
      display: 'none',
      position: 'absolute',
      'border-radius': '50%',
      width: '30px',
      height: '30px',
      background: '#ccc',
      color: 'red'
    }).val('X')

    contentBox.append(removeBtn);

    $('#upload-img').on('change', uploadImg);

    contentBox.on('mouseenter', function () {
      $(contentBox).append(_line);
    });
    contentBox.on('mouseleave', function () {
      $(_line).remove();
    });

    contentBox.on('mousemove', contMove)

    contentBox.on('mousemove', contMove)

    $(window).on('scroll', function () {
      contMove();
    })

    contentBox.on('click', addLine)

    $('#split-btn').on('click', exportImg)
  }

  initElement();

 

  function _createLineDom(bgcolor, isglobal) {
    var line = document.createElement('div');
    bgcolor = bgcolor || '#00dffc'

    $(line).css({
      position: 'absolute',
      width: '100%',
      height: '1px',
      background: bgcolor
    })

    $(line).attr('class', 'line');

    if (!isglobal) {
      $(line).on('mouseover', function (ev) {
        ev = ev || event;

        $(removeBtn).css({
          top: parseInt($(this).css('top')) - (parseInt($(removeBtn).css('width')) / 2) + 'px',
          left: ev.clientX - parseInt(contentBox.offset().left) - (parseInt($(removeBtn).css('width')) / 2) + 'px',
          display: 'inline-block',
          zIndex: 999991
        })

        $(removeBtn).on('mouseenter', function () {
          $(removeBtn).show();
        }).on('mouseout', function () {
          setTimeout(function () {
            $(removeBtn).hide();
          }, 1000);
        }).on('click', function () {
          $(line).remove();
          return false;
        })

      }).on('mouseout', function () {
        $(removeBtn).hide();
      })
    }

    return line;
  }
  function _creMask() {
    var oDiv = document.createElement('div');

    $(oDiv).css({
      display: 'inline-block',
      width: '100%',
      background: 'rgba(0,0,0,.8)',
      border: '1px solid rgba(255,255,255,.8)'
    })

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

          contentbox.css({
            width: img.width + 'px',
            height: img.height + 'px',
            'background-image': 'url(' + reader.result + ')',
            'background-repeat': 'no-repeat',
            'background-size': 'contain',
            'background-position': 'top center',
            'box-shadow': '0 0 5px #999'
          })

          console.log('IMG width:', img.width, ', height:', img.height);
        })
      };


      reader.readAsDataURL(file);
    }
    
  }

  function contMove(ev) {
    ev = ev || event;
    
    $(_line).css({
      top: ev.clientY - contentBox.offset().top + $(window).scrollTop() + 'px'
    })
  }

  function addLine(ev) {
    ev = ev || event;

    var line = _createLineDom('#00f');

    console.log('add line of top:', $(_line).css('top'));

    if (_oldLine && parseInt($(_line).css('top')) > parseInt($(_oldLine).css('top'))) {
      var _oDiv = _creMask();

      $(_oDiv).css({
        position: 'absolute',
        top: parseInt($(_oldLine).css('top')) - 1 + 'px',
        height: parseInt($(_line).css('top')) - parseInt($(_oldLine).css('top')) + 'px'
      });

      contentBox.append(_oDiv);

    }

    $(line).css({
      top: $(_line).css('top')
    })

    contentBox.append(line);
    _oldLine = line;
  }

  function exportImg() {

  }
});