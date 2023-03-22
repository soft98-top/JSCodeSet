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
// 加载fetch
loadScriptSrc("https://cdn.bootcss.com/fetch/2.0.4/fetch.min.js");
// 加载JSzip
loadScriptSrc("https://cdn.bootcss.com/jszip/3.7.1/jszip.min.js");
// 加载saveAs
loadScriptSrc("https://cdn.bootcss.com/FileSaver.js/2.0.5/FileSaver.min.js");

var sourcemapFiles = [];
var checkfiles = 0;
// 检测当前页面有没有sourcemap文件
function checkSourcemap() {
    let zip = new JSZip();
    let folder = zip.folder("sourcemap");
    let scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
        // 判断是否是自己注入的js文件
        if (scripts[i].id.indexOf('injectScript-') > -1) {
            checkfiles++;
            continue;
        }
        if (scripts[i].src.indexOf('.js') > -1) {
            let url = scripts[i].src + '.map';
            // 异步fetch请求sourcemap文件，携带cookie，判断是否存在，存在就下载保存到zip文件
            // 捕获异常，防止报错
            fetch(url, {
                credentials: 'include'
            }).then(res => {
                if (res.status == 200) {
                    res.text().then(text => {
                        // folder.file(url.substring(url.lastIndexOf("/") + 1), text);
                        folder.file(url.replace("https://", "").replace("http://", ""), text);
                        sourcemapFiles.push(url);
                        checkfiles++;
                    });
                } else {
                    checkfiles++;
                }
            }).catch(err => {
                console.log(err);
                checkfiles++;
            });
        }else{
            checkfiles++;
        }
    }
    // 定时器检测是否所有js文件都检测完毕
    let timer = setInterval(() => {
        if (checkfiles == scripts.length) {
            clearInterval(timer);
            // 保存zip文件
            zip.generateAsync({
                type: "blob"
            }).then(function (content) {
                saveAs(content, "sourcemap.zip");
            });
        }
    }, 1000);
}

setTimeout(checkSourcemap, 1000);