from models.BaseAliyun import BaseAliyun
from model import ModelInfo


class Qwen32B(BaseAliyun):

    _INFO = ModelInfo(
        id='qwen1.5-32b-chat',
        name='通义千问1.5-32B',
        params='32B',
        desc='通义千问1.5对外开源的32B规模参数量的经过人类指令对齐的chat模型,支持32k tokens上下文，输入最大30k，输出最大2k tokens。',
        type='T2T',
                        features="tpkrsP"

    )
