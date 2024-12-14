from models.BaseKimi import BaseKimi
from model import ModelInfo


class MoonshotV18K(BaseKimi):
    _INFO = ModelInfo(
        id='moonshot-v1-32k',
        name='月之暗面v1-32k',
        params='未知',
        desc='Moonshot的文本生成模型（指moonshot-v1）是训练用于理解自然语言和书面语言的，它可以根据输入生成文本输出。',
        type='T2T',
                features="tpP"

    )
