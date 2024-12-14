from model import ModelInfo
from models.BaseBaichuan import BaseBaichuan


class Baichuan3T128k(BaseBaichuan):

    _INFO = ModelInfo(
        type='T2T',
        id='Baichuan3-Turbo-128k',
        name='百川大语言模型3-Turbo-128k',
        params='53B',
        desc='具备 128k 超长上下文窗口，采用搜索增强技术实现大模型与领域知识、全网知识的全面链接。支持PDF、Word等多种文档上传及网址输入，信息获取及时、全面，输出结果准确、专业。',
        features="tpksP"

    )
