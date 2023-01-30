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
async function send(method,url,data="") {
    let ajaxConfig = {
        "type":method,
        "url":url,
        "data":JSON.stringify(data),
        "dataType":"json",
        "contentType":"application/json;charset=UTF-8",
        "headers":{
            "Content-Type":`application/json;charset=UTF-8`
        },
        "xhrFields":{
            "withCredentials":true
        }
    }
    if(data==""){
        ajaxConfig["data"] = null
    }
    let retval = await $.ajax(ajaxConfig);
    return retval;
}

function fuckDownload(fid) {
    let data = {
        "fids":[]
    }
    data.fids.push(fid);
    send("POST","https://drive.quark.cn/1/clouddrive/file/download?pr=ucpro&fr=pc",data).then((data) => {
        if(data.code == 0){
            window.open(data.data[0]["download_url"]);
        }else{
            alert("FuckDownload Fail, error: " + data["message"]);
        }
    })
}

function fuckDownloads() {
    fileTr = $("tr[data-row-key]");
    for (let i = 0 ; i < fileTr.length; i++) {
        file = fileTr[i];
        let fid = file.getAttribute("data-row-key");
        let sizeTd = file.getElementsByTagName("td")[2];
        if(sizeTd.getAttribute("isfucked") != "yes"){
            sizeTd.innerHTML = sizeTd.innerText + "<button onclick='fuckDownload(\"" + fid + "\")'>-> Download <-</button>"
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