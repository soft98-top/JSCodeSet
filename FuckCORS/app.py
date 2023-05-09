#!encoding=utf-8
from flask import Flask, request, Response
import requests

app = Flask("app")

@app.route('/proxy',methods=['GET'])
def proxy():
    url = request.args.get('url')
    if not url:
        return '使用方式: /proxy?url=https://www.example.com'

    headers = dict(request.headers)
    headers.pop('Host')
    headers['Origin'] = url.replace('https://','').replace('http://','')
    headers['Referer'] = url

    try:
        resp = requests.get(url, headers=headers)
        response_headers = dict(resp.headers)

        # 删除不必要的头信息
        if response_headers.get('Content-Encoding'):   
            del response_headers['Content-Encoding']
        if response_headers.get('Content-Length'):   
            del response_headers['Content-Length']
        response_headers['Access-Control-Allow-Origin'] = '*'

        return Response(
            resp.content,
            status=resp.status_code,
            headers=response_headers
        )

    except requests.exceptions.RequestException as e:
        return f'请求出错: {e}'
