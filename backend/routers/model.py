import importlib
import json
import os
import time

from flask import Blueprint, request, jsonify, stream_with_context, Response
from config import app
from model import Model

# 导入models目录下的所有Python文件
for filename in os.listdir('./models'):
    # 检查文件是否是Python源文件
    if filename.endswith('.py'):
        # 构建模块名（去掉.py扩展名）
        module_name = filename[:-3]
        # 动态导入模块
        importlib.import_module(f'models.{module_name}')


def get_all_subclasses(cls):
    all_subclasses = []

    for subclass in cls.__subclasses__():
        all_subclasses.append(subclass)
        all_subclasses.extend(get_all_subclasses(subclass))

    return all_subclasses


models = []
model_dict = {}
for model in get_all_subclasses(Model):
    if not model.id().startswith("base"):
        models.append(model.to_json())
        model_dict[model.id()] = model

model_page = Blueprint('model', __name__)


@model_page.route('/api/models', methods=['GET'])
def model_list():
    return jsonify(models)


@model_page.route('/api/model/response', methods=['POST'])
def model_response():
    data = request.get_json()
    model_id = data["id"]
    model_prompt = data["data"]
    res = model_dict[model_id].predict(model_prompt)
    return jsonify({'message': res})


@model_page.route('/api/model/stream_response', methods=['POST'])
def model_stream_response():
    def generate():
        data = request.get_json()
        model_id = data["id"]
        model_prompt = data["data"]
        for res in model_dict[model_id].stream_predict(model_prompt):
            yield json.dumps({'message': res})
    return Response(stream_with_context(generate()), content_type='application/json')


@model_page.route('/api/model/python_response', methods=['POST'])
def model_python_response():
    pass