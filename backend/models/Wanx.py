import base64
import os

import config
from model import Model, ModelInfo
from dashscope.audio.tts import SpeechSynthesizer
from http import HTTPStatus
from urllib.parse import urlparse, unquote
from pathlib import PurePosixPath
import requests
from dashscope import ImageSynthesis


class Wanx(Model):
    _INFO = ModelInfo(
        id='wanx-v1',
        name='通义万向',
        params='未知',
        desc='通义万相-文本生成图像是基于自研的Composer组合生成框架的AI绘画创作大模型，能够根据用户输入的文字内容，生成符合语义描述的多样化风格的图像。',
        type='T2I',
    )

    @classmethod
    def predict(cls, data):
        text = data["text"]
        global path
        # 检查临时图片路径是否存在，如果不存在则创建
        if not os.path.exists(config.temp_img_path):
            os.makedirs(config.temp_img_path)

        # 调用图片生成模型的call方法，传入相关参数
        rsp = ImageSynthesis.call(model=ImageSynthesis.Models.wanx_v1,
                                  prompt=text,
                                  n=1,
                                  size='1280*720')

        # 如果返回状态码为HTTPStatus.OK，表示成功
        if rsp.status_code == HTTPStatus.OK:
            # 保存文件到当前目录
            image_base64 = base64.b64encode(requests.get(rsp.output.results[0].url).content)

            # 将base64字符串解码为UTF-8格式的字符串，以便可以打印或存储
            image_base64_str = image_base64.decode('utf-8')

            return "data:image/png;base64," + image_base64_str
        else:
            # 如果状态码不是HTTPStatus.OK，则返回错误信息
            return ('Failed, status_code: %s, code: %s, message: %s' %
                    (rsp.status_code, rsp.code, rsp.message))
