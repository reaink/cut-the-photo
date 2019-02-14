/**
* @author sr_<nmlixa@163.com>
* @date  2019/02/14 15:30:25
*/
layui.use(['element', 'layer'], function () {
  var $ = layui.$,
    layer = layui.layer;


  var contentBox = $('.main-content'),
    _line = _createLineDom('#00dffc', true),
    _oldLine,
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

    $('#split-btn').on('click', exportImg)
  }

  initElement();

 

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

    $(removeBtn).attr('class', 'removeBtn');

    contentBox.append(removeBtn);

    $(line).attr('class', 'line line-' + idNum++);

    if (!isglobal) {
      $(line).on('mouseover', function (ev) {
        ev = ev || event;
        var tmpId = $(this).attr('class').split(' ')[1];
        
        $(removeBtn).css({
          top: parseInt($(this).css('top')) - (parseInt($(removeBtn).css('width')) / 2) + 'px',
          left: ev.clientX - parseInt(contentBox.offset().left) - (parseInt($(removeBtn).css('width')) / 2) + 'px',
          display: 'inline-block',
          zIndex: 999992
        })

        $(removeBtn).on('mouseover', function () {
          $(this).show();
        }).on('mouseout', function () {
          setTimeout(function () {
            $(removeBtn).hide();
          }, 2000);
        }).on('click', function () {
          $('.' + tmpId).remove();
          $(removeBtn).remove();
          return false;
        })

      })
    }

    return line;
  }
  function _creMask() {
    var oDiv = document.createElement('div');

    $(oDiv).css({
      display: 'inline-block',
      width: '100%',
      background: 'rgba(0,0,0,.8)'
    }).attr('class', 'split-card mask')

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
      })

      contentBox.append(_oDiv);

    }

    $(line).css({
      top: $(_line).css('top')
    })

    contentBox.append(line);
    _oldLine = line;
  }

  function exportImg() {
    var splitCards = contentBox.find('.split-card');

    contentBox.find('.mask').css('background', '');
    contentBox.find('.line').remove();
    contentBox.find('.removeBtn').remove();
    
    setTimeout(function () {
      for (let el of splitCards) {
        html2canvas(el).then(function (canvas) {
          $('#returnNode').append(canvas);
        })
      }
    }, 10)
    

    
  }
});