from model import ModelInfo
from models.BaseBaichuan import BaseBaichuan


class Baichuan4(BaseBaichuan):

    _INFO = ModelInfo(
        type='T2T',
        id='Baichuan4',
        name='百川大语言模型4',
        params='未知',
        desc='百川最新一代模型',
                features="tpksP"

    )
