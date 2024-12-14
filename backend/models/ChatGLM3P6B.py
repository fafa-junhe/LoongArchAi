from models.BaseAliyun import BaseAliyun
from model import ModelInfo


class ChatGLM3P6B(BaseAliyun):
    _INFO = ModelInfo(
        type='T2T',
        id='chatglm3-6b',
        name='ChatGLM3-6B',
        params='6B',
        desc='该模型为ChatGLM3系列，支持输入输出token合计是7500，其中单轮最大输出token为1500，单轮最大输入token为6000'
             '(如果超过该阈值按最后一次完整的对话进行截断），支持message和prompt格式输入，支持流式调用。',
        features="tpkrsP"

    )
