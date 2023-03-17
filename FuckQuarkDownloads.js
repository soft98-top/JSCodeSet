function loadScriptSrc(src) {
    let script = document.createElement('script');
    script.setAttribute("src", src);
    document.children[0].appendChild(script);
}

// 加载jQuery
loadScriptSrc("https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js");
// 判断jQuery是否加载完成
if (typeof ($) == "undefined") {
    setTimeout(() => {
        if (typeof ($) == "undefined") {
            loadScriptSrc("https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js");
        }
    }, 1000);
}
// 加载axios
loadScriptSrc("https://cdn.bootcss.com/axios/0.19.0/axios.min.js");
// 加载JSZip
loadScriptSrc("https://cdn.bootcss.com/jszip/3.1.5/jszip.min.js");
// 加载FileSaver
loadScriptSrc("https://cdn.bootcss.com/FileSaver.js/1.3.8/FileSaver.min.js");


async function send(method, url, data = "", jsonSwitch = true) {
    let ajaxConfig = {
        "type": method,
        "url": url,
        "data": data,
        "xhrFields": {
            "withCredentials": true
        }
    }
    if (jsonSwitch) {
        ajaxConfig["data"] = JSON.stringify(data);
        ajaxConfig["dataType"] = "json";
        ajaxConfig["contentType"] = "application/json;charset=UTF-8";
        ajaxConfig["headers"] = {
            "Content-Type": `application/json;charset=UTF-8`
        };
    }
    if (data == "") {
        ajaxConfig["data"] = null;
    }
    let retval = await $.ajax(ajaxConfig);
    return retval;
}

var urls = {};
var fileFlag = {};

// 通过fids获取下载地址
function getDownloadUrl(fids,key) {
    let data = {
        "fids": []
    }
    if (typeof (fids) == "object") {
        data.fids = fids;
    } else {
        data.fids.push(fids);
    }
    send("POST", "https://drive.quark.cn/1/clouddrive/file/download?pr=ucpro&fr=pc", data).then((data) => {
        if (data.code == 0) {
            urls[key] = [];
            for (let i = 0; i < data.data.length; i++) {
                let url = data.data[i].download_url
                urls[key].push(url);
            }
            fileFlag[key] = true;
            console.log(urls[key].join("\n"));
        } else {
            alert("FuckDownload Fail, error: " + data["message"]);
        }
    })
}

// 获取目录下载地址
function getDownloadUrl4Dir(task_data, retry = 0,key) {
    send("GET", "https://drive.quark.cn/1/clouddrive/download/list/export?pr=ucpro&fr=pc", task_data, false).then((data1) => {
        if (data1 == "") {
            // 重试
            if (retry < 5) {
                getDownloadUrl4Dir(task_data, retry + 1,key);
            }
        } else {
            let fids = data1.match(/([a-zA-Z0-9]{32}?)+/g);
            getDownloadUrl(fids,key);
        }
    });
}

function download2zip(urls) {
    // 在页面显示下载进度
    // 设置样式,变成一个固定在左上的弹窗
    // 内容过多时会自动滚动，有下拉条
    // 可能存在多个多个执行download2zip的情况，所以id不能重复
    let info = document.createElement("div");
    info.id = "downloadInfo" + new Date().getTime();
    info.style.position = "float";
    info.style.top = "0";
    info.style.left = "0";
    info.style.width = "300px";
    info.style.height = "200px";
    info.style.overflow = "auto";
    info.style.backgroundColor = "rgba(0,0,0,0.5)";
    info.style.color = "white";
    info.style.padding = "10px";
    info.style.zIndex = "999999";
    // 横向浮动
    info.style.cssFloat = "left";
    // 纵向浮动
    info.style.styleFloat = "left";
    // 添加到页面
    document.body.appendChild(info);

    let fileFlag = 0;
    // 存放正在下载的文件名
    let downloading = [];
    // 创建一个新的zip对象
    let zip = new JSZip();
    // 遍历文件列表
    urls.forEach(function (url) {
        // 获取文件名,使用正则表达式匹配,如果匹配不到则使用时间戳作为文件名,url中的文件名可能会被编码,所以需要decodeURIComponent解码
        var filename = url.match(/filename=(.+?)&/)[1];
        if (filename == undefined) {
            filename = new Date().getTime();
        } else {
            filename = decodeURIComponent(filename);
        }
        //使用axios获取文件的响应，携带cookie，设置responseType为arraybuffer,命令行显示下载进度
        axios({
            method: 'get',
            url: url,
            withCredentials: true,
            responseType: 'arraybuffer',
            onDownloadProgress: function (progressEvent) {
                let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                downloading[filename] = percentCompleted;
                // 遍历正在下载的文件，打印下载进度
                let infoStr = "";
                for (let key in downloading) {
                    infoStr += key + " : " + downloading[key] + "%<br>";
                }
                info.innerHTML = infoStr;
            }
        }).then(function (response) {
            // 将文件添加到zip对象中
            zip.file(filename, response.data);
            // 将文件标记为已下载完成
            fileFlag++;
            // 将文件从正在下载的文件列表中删除
            delete downloading[filename];
        });
    });
    // 判断是否所有的文件都已经下载完成
    var check = function () {
        // 如果所有的文件都已经下载完成，则生成一个zip blob对象，并保存到本地的下载目录中，命名为files.zip
        if (fileFlag == urls.length) {
            zip.generateAsync({ type: "blob" }).then(function (zipBlob) {
                saveAs(zipBlob, "files.zip");
                console.log("Zipped and saved files.zip");
            });
            // 删除页面上的下载进度显示
            document.body.removeChild(info);
        } else {
            // 如果还有文件未下载完成，则每隔1秒钟检查一次
            setTimeout(check, 1000);
        }
    };
    check();
}


// download函数，根据模式选择下载方式
function download(urls, mode) {
    if (mode == "zip") {
        download2zip(urls);
    } else {
        // 打开所有链接
        for (let i = 0; i < urls.length; i++) {
            window.open(urls[i]);
        }
    }
}

function fuckDownloadDir(fid, mode = "link") {
    let data = {
        "current_dir_fid": fid
    };
    send("POST", "https://drive.quark.cn/1/clouddrive/download/list?pr=ucpro&fr=pc", data).then((data) => {
        if (data.code == 0) {
            let task_data = {
                "task_id": data.data['task_id']
            };
            // 用时间戳做key，防止重复
            key=new Date().getTime();
            getDownloadUrl4Dir(task_data, 0,key);
            // 等待文件下载地址获取完成
            let timer = setInterval(() => {
                if (fileFlag[key]) {
                    clearInterval(timer);
                    download(urls[key], mode);
                }
            }, 1000);
        } else {
            alert("FuckDownload Fail, error: " + data["message"]);
        }
    });
}

function fuckDownload(fid) {
    // 用时间戳做key，防止重复
    key = new Date().getTime();
    getDownloadUrl(fid, key);
    // 等待文件下载地址获取完成
    let timer = setInterval(() => {
        if (fileFlag[key]) {
            clearInterval(timer);
            download(urls[key]);
        }
    }, 1000);
}

function fuckDownloads() {
    fileTr = $("tr[data-row-key]");
    for (let i = 0; i < fileTr.length; i++) {
        file = fileTr[i];
        let fid = file.getAttribute("data-row-key");
        let sizeTd = file.getElementsByTagName("td")[2];
        if (sizeTd.getAttribute("isfucked") != "yes") {
            if (sizeTd.innerText == "-") {
                sizeTd.innerHTML = sizeTd.innerText + "<button onclick='fuckDownloadDir(\"" + fid + "\")'>-> DownDir <-</button>" + "<button onclick='fuckDownloadDir(\"" + fid + "\",\"zip\")'>-> Down2Zip <-</button>";
            } else {
                sizeTd.innerHTML = sizeTd.innerText + "<button onclick='fuckDownload(\"" + fid + "\")'>-> Down <-</button>";
            }
            sizeTd.setAttribute("isfucked", "yes");
        }
    }
}

/*
    定义一个函数，下载
*/


function startFuck() {
    try {
        if (typeof ($.ajax) == 'function') {
            fuckDownloads();
            console.log("Fuck Downloads Success!")
        } else {
            setTimeout(startFuck, 100);
        }
    } catch (error) {
        setTimeout(startFuck, 100);
    }

}

setInterval(startFuck, 1000);