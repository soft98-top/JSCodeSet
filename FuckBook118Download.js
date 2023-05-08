function loadScriptSrc(src) {
    // 取src的文件名
    let filename = src.substring(src.lastIndexOf("/") + 1);
    let jsid = "injectScript-" + filename;
    let script = document.getElementById(jsid);
    if (script != null) {
        script.remove();
    }
    script = document.createElement('script');
    script.setAttribute("src", src);
    script.setAttribute("id", jsid);
    document.children[0].appendChild(script);
}

loadScriptSrc('https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js');

function downloadImage2Pdf(imageUrls,filename){
    // 创建一个新的 jsPDF 对象
    let pdf = new jspdf.jsPDF();
    
    // 定义加载图片的 Promise 函数
    let loadImage = url => {
      return new Promise((resolve, reject) => {
        let img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
    };
    
    // 用 Promise.all() 加载所有图片，并将它们添加到PDF中
    Promise.all(imageUrls.map(loadImage))
      .then(images => {
        images.forEach((img, index) => {
          let width = pdf.internal.pageSize.getWidth();
          let height = (img.height * width) / img.width;
          pdf.addImage(img, 'JPEG', 0, 0, width, height);
          if (index < images.length - 1) {
            pdf.addPage();
          }
        });
        
        // 保存并下载PDF文件
        pdf.save(filename + '.pdf');
        
      })
      .catch(error => {
        console.error(error);
      });

}

function fuckBook118(){
    let previewItems = document.getElementsByClassName('webpreview-item');
    let imageUrls = [];
    for (let item of previewItems) {
        imageUrls.push(item.getElementsByTagName('img')[0].src);
    }
    let filename = document.getElementsByTagName('h1')[0].innerText;
    // 将filename文件名后缀去掉
    filename = filename.split('.').slice(0, -1).join('.');
    let downloadIndex = prompt('你将要下载' + filename + ', 可拼接' + imageUrls.length + '张图片, 请输入区间，用逗号隔开，直接输入数字代表截止区间: ');
    let indeies = downloadIndex.split(',');
    if(indeies.length > 1){
        imageUrls = imageUrls.splice(indeies[0],indeies[1]);
    } else {
        imageUrls = imageUrls.splice(0,indeies[0]);
    }
    // 加载完jsPDF库后执行下载函数
    if (typeof jspdf !== 'undefined') {
        downloadImage2Pdf(imageUrls,filename);
    } else {
        setTimeout(fuckBook118, 100);
    }
}

setTimeout(fuckBook118, 1000);