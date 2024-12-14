from io import BytesIO
from model import Model, ModelInfo
from ppocronnx.predict_system import TextSystem
import cv2
import numpy as np
import base64
import onnx
import onnxruntime
from onnx import helper
from PIL import Image
class ModNet(Model):
    _INFO = ModelInfo(id='MODNET',
                      name='MODNet',
                      params='未知',
                      desc='本地部署MODNet图片抠图模型，MODNet是一个仅需RGB图片输入的实时人像抠图模型',
                      type='I2I')
    session = None


    @staticmethod
    def get_scale_factor(im_h, im_w, ref_size):
        if max(im_h, im_w) < ref_size or min(im_h, im_w) > ref_size:
            if im_w >= im_h:
                im_rh = ref_size
                im_rw = int(im_w / im_h * ref_size)
            elif im_w < im_h:
                im_rw = ref_size
                im_rh = int(im_h / im_w * ref_size)
        else:
            im_rh = im_h
            im_rw = im_w

        im_rw = im_rw - im_rw % 32
        im_rh = im_rh - im_rh % 32

        x_scale_factor = im_rw / im_w
        y_scale_factor = im_rh / im_h

        return x_scale_factor, y_scale_factor

    @classmethod
    def predict(cls, data):
        text = data["text"]
        if cls.session == None:
            cls.session = onnxruntime.InferenceSession("./weights/modnet.onnx", None)
        # Get x_scale_factor & y_scale_factor to resize image
        ref_size = 512

        ##############################################
        #  Main Inference part
        ##############################################

        # read image
        text = text.split(",")[1]
        # 解码 Base64 字符串
        img_data = base64.b64decode(text)

        # 将二进制数据转换为 numpy 数组
        np_arr = np.frombuffer(img_data, np.uint8)

        # 使用 OpenCV 将 numpy 数组解码为图片
        im = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        im = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)

        # unify image channels to 3
        if len(im.shape) == 2:
            im = im[:, :, None]
        if im.shape[2] == 1:
            im = np.repeat(im, 3, axis=2)
        elif im.shape[2] == 4:
            im = im[:, :, 0:3]

        # normalize values to scale it between -1 to 1
        im = (im - 127.5) / 127.5   

        im_h, im_w, _ = im.shape
        x, y = cls.get_scale_factor(im_h, im_w, ref_size) 

        # resize image
        im = cv2.resize(im, None, fx = x, fy = y, interpolation = cv2.INTER_AREA)

        # prepare input shape
        im = np.transpose(im)
        im = np.swapaxes(im, 1, 2)
        im = np.expand_dims(im, axis = 0).astype('float32')

        # Initialize session and get prediction
        input_name = cls.session.get_inputs()[0].name
        output_name = cls.session.get_outputs()[0].name
        result = cls.session.run([output_name], {input_name: im})

        # refine matte
        matte = (np.squeeze(result[0]) * 255).astype('uint8')
        matte = cv2.resize(matte, dsize=(im_w, im_h), interpolation = cv2.INTER_AREA)
        impil = Image.open(BytesIO(img_data))
        matte = Image.fromarray(matte)
        impil.putalpha(matte)   # add alpha channel to keep transparency
        img_buffer = BytesIO()
        impil.save(img_buffer, format='PNG')
        byte_data = img_buffer.getvalue()
        base64_str = base64.b64encode(byte_data).decode()
        return "data:image/png;base64," + base64_str
