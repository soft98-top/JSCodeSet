let url = "https://g.proxy.soft98.top/soft98-top/JSCodeSet/raw/main/NeatReaderAccountGen.js";
let jsid = "NeatReaderAccountGen"
let xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4 && xhr.status == 200){
            let code = xhr.responseText;
            let script = document.getElementById(jsid);
            if ( script != null) {
                script.remove();
            }
            script = document.createElement('script');
            script.setAttribute("type", "text/javascript");
            script.innerHTML = code;
            script.setAttribute("id", jsid);
            document.children[0].appendChild(script);
        }
    }
xhr.send();