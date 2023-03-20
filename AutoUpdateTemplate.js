let url = "";
let jsid = ""
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