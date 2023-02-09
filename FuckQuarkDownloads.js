try {
    if (typeof($.ajax) == 'function') {
        console.log('jQuery Loaded!');
    }else{
        script = document.createElement('script');
        script.setAttribute("src","https://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js");
        document.children[0].appendChild(script);
        console.log('jQuery Loading!');
    }
} catch (error) {
    script = document.createElement('script');
    script.setAttribute("src","https://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js");
    document.children[0].appendChild(script);
    console.log('jQuery Loading!');
}
async function send(method,url,data="",jsonSwitch=true) {
    let ajaxConfig = {
        "type":method,
        "url":url,
        "data":data,
        "xhrFields":{
            "withCredentials":true
        }
    }
    if (jsonSwitch) {
        ajaxConfig["data"] = JSON.stringify(data);
        ajaxConfig["dataType"] = "json";
        ajaxConfig["contentType"] = "application/json;charset=UTF-8";
        ajaxConfig["headers"] = {
            "Content-Type":`application/json;charset=UTF-8`
        };
    }
    if(data==""){
        ajaxConfig["data"] = null;
    }
    let retval = await $.ajax(ajaxConfig);
    return retval;
}

function fuckDownload(fid) {
    let data = {
        "fids":[]
    }
    if (typeof(fid) == "object") {
        data.fids = fid;
    }else{
        data.fids.push(fid);
    }
    send("POST","https://drive.quark.cn/1/clouddrive/file/download?pr=ucpro&fr=pc",data).then((data) => {
        if(data.code == 0){
            for (let download_data of data.data) {
                window.open(download_data["download_url"]);
            }
        }else{
            alert("FuckDownload Fail, error: " + data["message"]);
        }
    })
}

function exportDir(task_data) {
    send("GET","https://drive.quark.cn/1/clouddrive/download/list/export?pr=ucpro&fr=pc",task_data,false).then((data1) => {
        if (data1 == "") {
            setTimeout(exportDir(task_data),500);
        }else{
            let fidstr = data1.match(/\:([a-z0-9]+);/g);
            for (let fids of fidstr) {
                fuckDownload(fids.replace(":","").replace(";","").split(","));
            }
        }
    });
}

function fuckDownloadDir(fid) {
    let data = {
        "current_dir_fid":fid
    };
    send("POST","https://drive.quark.cn/1/clouddrive/download/list?pr=ucpro&fr=pc",data).then((data) => {
        if(data.code == 0){
            let task_data = {
                "task_id":data.data['task_id']
            };
            exportDir(task_data);
        }else{
            alert("FuckDownload Fail, error: " + data["message"]);
        }
    });
}

function fuckDownloads() {
    fileTr = $("tr[data-row-key]");
    for (let i = 0 ; i < fileTr.length; i++) {
        file = fileTr[i];
        let fid = file.getAttribute("data-row-key");
        let sizeTd = file.getElementsByTagName("td")[2];
        if(sizeTd.getAttribute("isfucked") != "yes"){
            if (sizeTd.innerText == "-") {
                sizeTd.innerHTML = sizeTd.innerText + "<button onclick='fuckDownloadDir(\"" + fid + "\")'>-> Download <-</button>";
            }else{
                sizeTd.innerHTML = sizeTd.innerText + "<button onclick='fuckDownload(\"" + fid + "\")'>-> Download <-</button>";
            }
            sizeTd.setAttribute("isfucked","yes");
        }
    }
}

function startFuck() {
    try {
        if (typeof($.ajax) == 'function'){
            fuckDownloads();
            console.log("Fuck Downloads Success!")
        }else{
            setTimeout(startFuck,100);
        }
    } catch (error) {
        setTimeout(startFuck,100);
    }
    
}

setTimeout(startFuck,100);