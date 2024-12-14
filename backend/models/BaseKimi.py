
import time
from config import kimi_api_key
from model import Model, ModelInfo


from openai import OpenAI

class BaseKimi(Model):
    _INFO = ModelInfo(
        id='base_kimi',
        name='ERROR',
        params='ERROR',
        desc='ERROR',
        type='ERROR',
        features="tpP"
    )
    client = OpenAI(
        api_key=kimi_api_key,
        base_url="https://api.moonshot.cn/v1",
    )
    @classmethod
    def predict(cls, data):
        text = data.get("text")
        messages = [
            {'role': 'system',
            'content': data.get('prompt', '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。')} # TODO: 用户可以修改这句话
        ]
        if isinstance(text, list):
            messages.extend(text)
        else:
            messages.append({
                "role": 'user', "content": text
            })
        print(messages)
        completion = cls.client.chat.completions.create(
            model=cls._INFO.id,
            messages=messages,
            top_p=data.get('top_p', 0.8),
            temperature=data.get('temperature', 0.85),
            stream=False
        )

        return  completion.choices[0].message.content

    @classmethod
    def stream_predict(cls, data):
        text = data.get("text")
        messages = [
            {'role': 'system',
            'content': data.get('prompt', '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。')} # TODO: 用户可以修改这句话
        ]
        if isinstance(text, list):
            messages.extend(text)
        else:
            messages.append({
                "role": 'user', "content": text
            })
        print(messages)
        response = cls.client.chat.completions.create(
            model=cls._INFO.id,
            messages=messages,
            stream=True,
            top_p=float(data.get('top_p', 1)),
            temperature=float(data.get('temperature', 1))
        )

        collected_messages = []
        for idx, chunk in enumerate(response):
            chunk_message = chunk.choices[0].delta
            if not chunk_message.content:
                continue
            collected_messages.append(chunk_message)  # save the message
            yield ''.join([m.content for m in collected_messages])
