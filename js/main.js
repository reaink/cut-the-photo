layui.use(['element', 'layer'], function () {
  var $ = layui.$,
    layer = layui.layer;

  var contentBox = $('.main-content'),
    _line = _createLineDom();
  

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
  

  function _createLineDom(bgcolor) {
    var line = document.createElement('div');

    bgcolor = bgcolor || '#00dffc'

    $(line).css({
      position: 'absolute',
      width: '100%',
      height: '1px',
      background: bgcolor
    })

    return line;
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

          console.log(img.height);
          contentbox.css({
            width: '100%',
            height: img.height + 'px',
            'background-image': 'url(' + reader.result + ')',
            'background-repeat': 'no-repeat',
            'background-size': 'contain',
            'background-position': 'top center'
          })
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

    console.log('add line of:', $(_line).css('top'));

    $(line).css({
      top: $(_line).css('top')
    })

    contentBox.append(line);
    
  }
});