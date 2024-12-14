import base64
import os
import wave
from http import HTTPStatus
from dashscope.audio.asr import Recognition
import config
from model import Model, ModelInfo
import uuid


class Paraformer(Model):
    _INFO = ModelInfo(
        id='paraformer-realtime-v1',
        name='Paraformer语音识别',
        params='未知',
        desc='能够对长时间的语音数据流进行识别，并将结果流式返回给调用者，适用于会议演讲、视频直播等长时间不间断识别的场景',
        type='A2T',
    )

    @classmethod
    def predict(cls, data):
        text = data.get("text")
        # 如果临时图片路径不存在，则创建该路径
        if not os.path.exists(config.temp_wav_path):
            os.makedirs(config.temp_wav_path)
        name = str(uuid.uuid1())
        # Base64解码
        base64_to_pcm(text, f'./temp_wav/{name}.pcm')
        recognition = Recognition(model=cls._INFO.id,
                                  format='pcm',
                                  sample_rate=16000,
                                  callback=None)
        result = recognition.call(f'./temp_wav/{name}.pcm')
        if result.status_code == HTTPStatus.OK:
            print(result)
            if not result.get_sentence():
                return ""
            result = [j["text"] for j in result.get_sentence()]
            return "".join(result)

        else:
            return 'Error: ', result.message


def base64_to_pcm(base64_string, output_path):
    try:
        # 将Base64字符串解码为字节数据
        decoded_data = base64.b64decode(base64_string)

        # 创建一个wave对象，设置参数
        with wave.open(output_path, 'wb') as wav_file:
            # 设置声道数为1，即单声道
            wav_file.setnchannels(1)  # 单声道
            # 设置采样深度为16位，即每个样本占用2字节
            wav_file.setsampwidth(2)  # 采样深度为16位，每个样本2字节
            # 设置采样率为16kHz
            wav_file.setframerate(16000)  # 采样率为16kHz
            # 将解码后的字节数据写入wave文件
            wav_file.writeframes(decoded_data)  # 写入PCM数据

        print(f'PCM_s16le文件已保存到 {output_path}。')
    except Exception as e:
        print(f'转换过程中发生错误: {e}')