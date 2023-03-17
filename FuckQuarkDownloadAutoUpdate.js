function execJsCode(url){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4 && xhr.status == 200){
            let code = xhr.responseText;
            eval(code);
        }
    }
    xhr.send();
}
execJsCode("https://g.justproxy.ml/soft98-top/JSCodeSet/raw/main/FuckQuarkDownloads.js")