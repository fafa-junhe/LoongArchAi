from models.BaseAliyun import BaseAliyun
from model import ModelInfo


class Qwen14B(BaseAliyun):
    _INFO = ModelInfo(
        id='qwen1.5-14b-chat',
        name='通义千问1.5-14B',
        params='14B',
        desc='通义千问1.5的14B规模参数量的经过人类指令对齐的chat模型,模型支持 8k tokens上下文，为了保障正常使用和正常输出，API限定用户输入为6k Tokens。',
        type='T2T',
                features="tpkrsP"

    )

