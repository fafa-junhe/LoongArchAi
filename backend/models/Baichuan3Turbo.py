from model import ModelInfo
from models.BaseBaichuan import BaseBaichuan


class Baichuan3Turbo(BaseBaichuan):

    _INFO = ModelInfo(
        type='T2T',
        id='Baichuan3-Turbo',
        name='百川大语言模型3-Turbo',
        params='未知',
        desc='百川大语言模型3-Turbo支持32k上下文',
        features="tpksP"

    )
