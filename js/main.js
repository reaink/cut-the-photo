layui.use(['element', 'layer'], function () {
  var $ = layui.$,
    layer = layui.layer;

  var img = new Image();

  $('#upload-img').on('change', uploadImg);

  function uploadImg() {

    var file = $(this).get(0).files[0],
      contentbox = $('.main-content'),
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
});