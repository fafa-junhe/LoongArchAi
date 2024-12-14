import base64
from http import HTTPStatus
from model import Model, ModelInfo
import dashscope
from dashscope.audio.tts import SpeechSynthesizer


class SambertMan(Model):
    _INFO = ModelInfo(
        id='sambert-zhichu-v1',
        name='Sambert语音合成(男)',
        params='未知',
        desc='语音合成API基于达摩院改良的自回归韵律模型，支持文本至语音的实时流式合成。',
        type='T2A',
    )

    @classmethod
    def predict(cls, data):
        text = data.get("text")

        # 调用语音合成器的call方法，传入模型ID、文本和采样率参数
        result = SpeechSynthesizer.call(model=cls._INFO.id,
                                        text=text,
                                        sample_rate=48000)

        # 如果语音合成结果中的音频数据不为空
        if result.get_audio_data() is not None:
            # 将音频数据编码为base64字符串，并解码为UTF-8格式的字符串
            base64_data = base64.b64encode(result.get_audio_data()).decode('utf-8')
            # 返回base64编码的音频数据
            return base64_data


