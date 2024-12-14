import base64
import cv2
import numpy as np
import onnxruntime as ort
from model import Model, ModelInfo

class FacadesModel(Model):
    _INFO = ModelInfo(
        id='landscape_pix2pix',
        name='风景画生成模型',
        params='未知',
        desc='使用pix2pix本地部署模型的风景画生成模型',
        type='I2I'
    )
    session = None

    @staticmethod
    def read_img(image):
        load_size = [256, 256]
        mean = [0.5, 0.5, 0.5]
        std = [0.5, 0.5, 0.5]

        img = cv2.resize(image, load_size).astype(np.float32)
        img = img[:, :, :3]
        img /= 255.0
        img = (img - mean) / std
        img = np.transpose(img, (2, 0, 1))
        img = img[np.newaxis, ...]
        return img.astype(np.float32)

    @classmethod
    def init_model(cls, model_path):
        sess_opt = ort.SessionOptions()
        sess_opt.log_severity_level = 4
        sess_opt.enable_cpu_mem_arena = False

        cls.session = ort.InferenceSession(model_path,
                                           sess_options=sess_opt,
                                           providers=['CPUExecutionProvider'])
        cls.input_name = cls.session.get_inputs()[0].name

    @classmethod
    def predict(cls, data):
        if cls.session is None:
            cls.init_model("weights/landscape_pix2pix.onnx")
        # read image
        text = data.get("text").split(",")[1]
        # 解码 Base64 字符串
        img_data = base64.b64decode(text)

        # 将二进制数据转换为 numpy 数组
        np_arr = np.frombuffer(img_data, np.uint8)

        # 使用 OpenCV 将 numpy 数组解码为图片
        im = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        im = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
        im = cls.read_img(im)
        ort_inputs = {cls.input_name: im.astype(np.float32)}
        result_img = cls.session.run(None, ort_inputs)[0]
        result_img = np.transpose(result_img.squeeze(), (1, 2, 0))
        result_img = (result_img + 1) / 2.0 * 255.0
        result_img = cv2.cvtColor(result_img, cv2.COLOR_BGR2RGB)
        base64_str = cv2.imencode('.jpg',result_img)[1].tostring()
        base64_str = base64.b64encode(base64_str).decode()
        return "data:image/png;base64," + base64_str


# Example usage:
# FacadesModel.launch_interface('models/facades_label2photo_pretrained.onnx')