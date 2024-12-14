import json

from model import Model, ModelInfo
import requests
import json


class BaseBaichuan(Model):
    _INFO = ModelInfo(
        id="base_baichuan",
        name="ERROR",
        params="ERROR",
        desc="ERROR",
        type="ERROR",
        features="tpksP",
    )

    url = "https://api.baichuan-ai.com/v1/chat/completions"
    headers = {"Content-Type": "application/json", "Authorization": CHANGETHIS}

    @classmethod
    def predict(cls, data):
        # 构建请求数据
        text = data.get("text")
        messages = [
            {
                "role": "assistant",
                "content": data.get("prompt", "I Am a helpful assistant."),
            }
        ]
        if isinstance(text, list):
            messages.extend(text)
        else:
            messages.append({"role": "user", "content": text})
        data = {
            "model": cls._INFO.id,
            "messages": messages,
            "top_p": data.get("top_p", 0.8),
            "top_k": data.get("top_k", 50),
            "temperature": data.get("temperature", 0.85),
            "stream": False,
            "tools": [
                {
                    "type": "web_search",
                    "web_search": {"enable": data.get("search", False)},
                }
            ],
        }

        # 发送POST请求
        response = requests.post(cls.url, headers=cls.headers, json=data)

        # 解析响应数据为JSON格式
        result = response.json()

        # 返回结果
        # print(result)
        return result["choices"][0]["message"]["content"]

    @classmethod
    def stream_predict(cls, data):
        text = data.get("text")
        messages = [
            {
                "role": "assistant",
                "content": data.get("prompt", "I Am a helpful assistant."),
            }
        ]
        if isinstance(text, list):
            messages.extend(text)
        else:
            messages.append({"role": "user", "content": text})
        # 构建请求数据
        data = {
            "model": cls._INFO.id,
            "messages": messages,
            "top_p": data.get("top_p", 0.8),
            "top_k": data.get("top_k", 50),
            "temperature": data.get("temperature", 0.3),
            "stream": True,
            "tools": [
                {
                    "type": "web_search",
                    "web_search": {"enable": data.get("search", False)},
                }
            ],
        }
        # 发送POST请求
        response = requests.post(
            cls.url, headers=cls.headers, json=data, timeout=60, stream=True
        )
        _str = ""
        if response.status_code == 200:
            for line in response.iter_lines():
                if line:
                    result = line.decode("utf-8")
                    result = json.loads(result.replace("data:", ""))
                    _str += result["choices"][0]["delta"]["content"]
                    yield _str
        else:
            print("请求失败，状态码:", response.status_code)
            print("请求失败，body:", response.text)
            print("请求失败，X-BC-Request-Id:", response.headers.get("X-BC-Request-Id"))
