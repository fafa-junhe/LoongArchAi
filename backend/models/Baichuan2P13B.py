from models.BaseAliyun import BaseAliyun
from model import ModelInfo



class Baichuan2P13B(BaseAliyun):
    _INFO = ModelInfo(
        id='baichuan2-13b-chat-v1',
        type='T2T',
        name='百川大语言模型2-13B',
        params='13B',
        desc='通义千问1.5对外开源的110B规模参数量的经过人类指令对齐的chat模型,支持32k tokens上下文，输入最大30k，输出最大2k tokens。',
                features="tpkrsP"

    )

