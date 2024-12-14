import base64
import os

from dashscope import MultiModalConversation
import uuid
import config
from model import Model, ModelInfo



class QwenVL(Model):
    _INFO = ModelInfo(
        id='qwen-vl-v1',
        name='通义千问VL(图意理解)',
        params='7B',
        desc='以 Qwen-7B 语言模型初始化，添加图像模型，图像输入分辨率为448的预训练模型。',
        type='I2T',
    )

    @classmethod
    def predict(cls, prompt):
        # 如果临时图片路径不存在，则创建该路径
        if not os.path.exists(config.temp_img_path):
            os.makedirs(config.temp_img_path)

        # 获取提示中的文本和图片
        text = prompt['text']
        image = prompt['image'].split(",")[1]
        # 将 base64 字符串解码为二进制数据
        image_data = base64.b64decode(image)
        name = str(uuid.uuid1())
        # 指定要保存的文件名
        path = os.path.join(config.temp_img_path, name + '.png')

        # 保存图片
        with open(path, 'wb') as f:
            f.write(image_data)

        """
            使用本地文件的示例。
            linux&mac 文件模式: file:///home/images/test.png
            windows 文件模式: file://D:/images/abc.png
        """
        # 构造消息列表
        messages = [{
            'role': 'system',
            'content': [{
                'text': 'You are a helpful assistant.'
            }]
        }, {
            'role':
                'user',
            'content': [
                {
                    # 使用保存的图片路径作为消息的图像
                    'image': path
                },
                {
                    # 使用提示中的文本作为消息的文本
                    'text': text
                },
            ]
        }]

        # 调用 MultiModalConversation 的 call 方法进行模型预测
        response = MultiModalConversation.call(model=MultiModalConversation.Models.qwen_vl_chat_v1, messages=messages)
        return response["output"]["choices"][0]["message"]["content"]


