from model import Model, ModelInfo
import cv2
import numpy as np
import base64
from aip import AipOcr

""" 你的 APPID AK SK """
APP_ID = CHANGETHIS
API_KEY = CHANGETHIS
SECRET_KEY = CHANGETHIS

client = AipOcr(APP_ID, API_KEY, SECRET_KEY)


class Ocr(Model):
    _INFO = ModelInfo(
        id="BaiduOCR",
        name="BaiduOCR文字识别",
        params="未知",
        desc="BaiduOCR文字识别模型",
        type="I2T",
    )

    @classmethod
    def predict(cls, text):
        text = text["image"].split(",")[1]
        img = base64.b64decode(text)
        options = {
            "language_type": "CHN_ENG",
            "detect_direction": "true",
            "detect_language": "true",
            "probability": "true",
        }
        res_text = client.basicGeneral(img, options)
        res_text = res_text["words_result"]
        result = [_dict["words"] for _dict in res_text]
        return "".join(result)

    @classmethod
    def base64_to_byte(cls, base64_string):
        # Base64字符串通常包含数据头，例如"data:image/png;base64,"，需要先将其删除
        if "," in base64_string:
            header, base64_string = base64_string.split(",", 1)

        # 将Base64字符串解码为二进制数据
        image_data = base64.b64decode(base64_string)

        return image_data
