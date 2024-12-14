from http import HTTPStatus
import random

from model import Model, ModelInfo
import dashscope
from dashscope import Generation


class BaseAliyun(Model):
    _INFO = ModelInfo(
        id='base_aliyun',
        name='ERROR',
        params='ERROR',
        desc='ERROR',
        type='ERROR',
        features="tpkrsP"
    )

    @classmethod
    def predict(cls, data):
        text = data['text']
        messages = [
            {'role': 'system', 'content': data.get('prompt', 'You are a helpful assistant.')}
        ]
        if isinstance(text, list):
            messages.extend(text)
        else:
            messages.append({
                "role": 'user', "content": text
            })
        print(messages)
        response = dashscope.Generation.call(
            model=cls._INFO.id,
            messages=messages,
            seed=random.randint(1, 10000),
            result_format='message',
            max_tokens=1500,
            top_p=data.get('top_p', 0.8),
            top_k=data.get('top_k', 50),
            temperature=data.get('temperature', 0.85),
            repetition_penalty=data.get('repeat_penalty', 0.85),
            enable_search=data.get('search', False)
        )
        if response.status_code == HTTPStatus.OK:
            _re = response.output.choices[0]['message']['content']
            return _re
        else:
            return {"error_code": response.code, "error_message": response.message}

    @classmethod
    def stream_predict(cls, data):
        text = data['text']
        messages = [
            {'role': 'system', 'content': data.get('prompt', 'You are a helpful assistant.')} 
        ]
        if isinstance(text, list):
            messages.extend(text)
        else:
            messages.append({
                "role": 'user', "content": text
            })
        responses = Generation.call(
            cls._INFO.id,
            messages=messages,
            seed=random.randint(1, 10000),  # set the random seed, optional, default to 1234 if not set
            result_format='message',  # set the result to be "message"  format.
            stream=True,
            output_in_full=True,  # get streaming output incrementally
            top_p=data.get('top_p', 0.8),
            top_k=data.get('top_k', 50),
            temperature=data.get('temperature', 0.85),
            repetition_penalty=data.get('repeat_penalty', 0.85),
            enable_search=data.get('search', False)

        )
        for response in responses:
            if response.status_code == HTTPStatus.OK:
                yield response.output.choices[0]['message']['content']
            else:
                print('Request id: %s, Status code: %s, error code: %s, error message: %s' % (
                    response.request_id, response.status_code,
                    response.code, response.message
                ))
