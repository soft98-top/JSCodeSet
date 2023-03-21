function loadScriptSrc(src) {
    let script = document.createElement('script');
    script.setAttribute("src", src);
    document.children[0].appendChild(script);
}

// 加载fetch
loadScriptSrc("https://cdn.bootcss.com/fetch/2.0.4/fetch.min.js");
// 加载md5
loadScriptSrc("https://cdn.bootcss.com/blueimp-md5/2.18.0/js/md5.js");
// 加载uuid
loadScriptSrc("https://cdn.bootcss.com/uuid/8.3.2/uuid.min.js");

function getAccount() {
    // 用户输入用户名，默认为随机不重复用户名（时间戳编码，截取前10位）
    let username = prompt("请输入用户名：", Date.now().toString(36).substr(0, 10));
    if (username == null) {
        return;
    }
    username = username + "@just.vip";
    // 用户输入密码，默认为用户名+随机码（3位字符）, md5加密
    let pwd = prompt("请输入密码：", username + Math.random().toString(36).substr(2, 3));
    if (pwd == null) {
        return;
    }
    password = md5(pwd);
    // deviceId为随机生成的UUID
    let deviceId = uuid.v4();
    // deviceInfo为浏览器信息
    let deviceInfo = {
        "userAgent": navigator.userAgent,
        "language": navigator.language,
        "vendor": navigator.vendor
    }
    // 获取当前窗口域名
    let domain = window.location.host;
    // 请求注册接口，获取账号
    fetch("https://" + domain +"/app/api_v2/registerAndGetTrialMembership", {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Google Chrome\";v=\"110\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": "https://www.neat-reader.cn/app/page/register",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "username=" + username + "&password=" + password + "&passwordAgain=" + password + "&deviceId=" + deviceId + "&deviceType=web-desk&deviceInfo=" + JSON.stringify(deviceInfo),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }).then(response => response.json())
        .then(data => {
            // 判断是否注册成功
            if (data.code == -1) {
                alert(data.msg);
            } else {
                prompt("账号信息如下：", "用户名：" + username + " 密码：" + pwd);
            }
        }
        );
}

// 延迟1秒执行
setTimeout(() => {
    getAccount();
}, 1000);