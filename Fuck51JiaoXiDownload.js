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
    if (jsonSwitch && method != "GET") {
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

var fuck51JiaoXiFiles = {}
var fuck51JiaoXiProxy = 'http://127.0.0.1:5000/proxy?url='
// 1 缩放 2 拉伸 3 图片即页面
var fuck51JiaoXiPdfMode = 3

async function downloadImage2Pdf(imageUrls, filename, zip) {
    // 创建一个新的 jsPDF 对象
    let pdf = new jspdf.jsPDF();
    // 定义加载图片的 Promise 函数
    let loadImage = url => {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.crossOrigin = "Anonymous";
            img.src = fuck51JiaoXiProxy + 'https:' + url;
        });
    };

    // 使用 <img> 加载所有图片，并将它们添加到 PDF 中
    await Promise.all(imageUrls.map(url => loadImage(url)))
        .then(images => {
            images.forEach((img, index) => {
                let imgWidth, imgHeight;
                if (fuck51JiaoXiPdfMode == 1) {
                    // 获取页面宽度和高度
                    let pageWidth = pdf.internal.pageSize.getWidth();
                    let pageHeight = pdf.internal.pageSize.getHeight();
                    // 根据图片宽高比例计算出它在 PDF 中的宽度和高度
                    let imgRatio = img.width / img.height;
                    if (imgRatio > pageWidth / pageHeight) {
                        imgWidth = pageWidth;
                        imgHeight = imgWidth / imgRatio;
                    } else {
                        imgHeight = pageHeight;
                        imgWidth = imgHeight * imgRatio;
                    }
                }
                if (fuck51JiaoXiPdfMode == 2) {
                    imgWidth = pdf.internal.pageSize.getWidth();
                    imgHeight = pdf.internal.pageSize.getHeight();
                }
                if (fuck51JiaoXiPdfMode == 3) {
                    if (img.width > img.height) {
                        imgWidth = pdf.internal.pageSize.getWidth();
                        imgHeight = img.height * width / img.width;
                    } else {
                        imgHeight = pdf.internal.pageSize.getHeight();
                        imgWidth = img.width * height / img.height;
                    }
                    // 设置页面的大小
                    pdf.setPageSize([imgWidth, imgHeight]);
                }
                pdf.addImage(img, 'JPEG', 0, 0, imgWidth, imgHeight);
                if (index < images.length - 1) {
                    pdf.addPage();
                }
            });
            if (zip) {
                zip.file(`${filename}.pdf`, pdf.output('arraybuffer'));
            } else {
                pdf.save(`${filename}.pdf`);
            }
        });
}


async function download2zip(files, zip) {
    for (let key of Object.keys(files)) {
        let fileUrls = files[key];
        let filename = key.split('.').slice(0, -1).join('.');
        await downloadImage2Pdf(fileUrls, filename, zip);
    }
}

async function getDocInfo(docId) {
    let url = `https://www.51jiaoxi.com/api/document/preview?document_id=${docId}&all=1`;
    await send("GET", url).then((data) => {
        let files = data['data'][0];
        if (files) {
            files = files['format_subsets'];
        } else {
            return;
        }
        if (files && files.length > 0) {
            for (let file of files) {
                let fileTitle = file['title'];
                if (fuck51JiaoXiFiles[fileTitle] == undefined) {
                    fuck51JiaoXiFiles[fileTitle] = [];
                }
                let fileItems = file['preview_files'];
                if (fileItems) {
                    for (let fileItem of fileItems) {
                        let url = fileItem['url'];
                        if (url) {
                            fuck51JiaoXiFiles[fileTitle].push(url);
                        }
                    }
                }
            }
        }
    });
}

async function fuck51JiaoXiDownload(docIds) {
    for (let docId of docIds) {
        await getDocInfo(docId);
    }
}

function fuck51JiaoXi() {
    fuck51JiaoXiProxy = prompt('下载需要代理过掉CORS, 默认是本地的代理。', fuck51JiaoXiProxy);
    fuck51JiaoXiPdfMode = prompt('设置图片转换PDF时的处理方式, 1缩放, 2拉伸, 3图片即页面。', fuck51JiaoXiPdfMode);
    let docIds = [];
    // 判断是否是合集,通过判断pathname是否以/album-开头
    if (location.pathname.startsWith('/album-')) {
        var albumTitle = document.getElementsByClassName('tit')[0].innerText;
        let docsHtml = document.getElementsByClassName('row-item');
        for (let doc of docsHtml) {
            docIds.push(doc.getAttribute('data-id'))
        }
    } else if (location.pathname.startsWith('/doc-')) {
        let docId = location.pathname.match(/\d+/);
        if (docId) {
            docIds.push(docId[0]);
        }
    } else {
        alert('网页识别错误！');
        return;
    }
    if (docIds.length > 0) {
        fuck51JiaoXiDownload(docIds).then(() => {
            if (fuck51JiaoXiFiles != {}) {
                if (Object.keys(fuck51JiaoXiFiles).length > 1) {
                    let zip = new JSZip();
                    download2zip(fuck51JiaoXiFiles, zip).then(() => {
                        // 生成ZIP文件并下载
                        zip.generateAsync({ type: 'blob' })
                            .then(function (blob) {
                                saveAs(blob, albumTitle + '.zip'); // 使用FileSaver.js库将生成的blob对象下载为ZIP文件
                            });
                        fuck51JiaoXiFiles = {};
                    })
                } else {
                    download2zip(fuck51JiaoXiFiles, undefined).then(() => {
                        fuck51JiaoXiFiles = {};
                    })
                }
            }
        })
    }
}

setTimeout(fuck51JiaoXi, 1000);