from model import Model, ModelInfo
from ppocronnx.predict_system import TextSystem
import cv2
import numpy as np
import base64

class Ocr(Model):
    _INFO = ModelInfo(id='PPOCR',
                      name='OCR文字识别(本地模型)',
                      params='未知',
                      desc='本地部署OCR文字识别模型',
                      type='I2T')

    @classmethod
    def predict(cls, text):
        words = []
        text_sys = TextSystem()
        text = text['image'].split(",")[1]
        img = cls.base64_to_opencv(text)

        res = text_sys.detect_and_ocr(img)
        for boxed_result in res:
            words.append(boxed_result.ocr_text)
        return ''.join(words)

    @staticmethod
    def base64_to_opencv(base64_str):
        # 解码 Base64 字符串
        img_data = base64.b64decode(base64_str)

        # 将二进制数据转换为 numpy 数组
        np_arr = np.frombuffer(img_data, np.uint8)

        # 使用 OpenCV 将 numpy 数组解码为图片
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        return img
