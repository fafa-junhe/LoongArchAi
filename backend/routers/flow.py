from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from database.model import Flow, db, User

flow_page = Blueprint('flow', __name__)


@flow_page.route('/api/flow', methods=['POST'])
@jwt_required()
def create_flow():
    data = request.get_json()
    new_flow = Flow(
        author=User.find_by_username(get_jwt_identity()).id
    )
    try:
        new_flow.flow_name = data.get("name", "")
        new_flow.flow_desc = data.get("desc", "")
        new_flow.public = data.get("public", False)
        new_flow.flow_type = data.get("flow_type", 0)
        new_flow.save_to_db()
        return {
            'message': '流程图成功创建',
            'flow_id': new_flow.id,
        }
    except Exception as e:
        print(e)
        return {'message': '糟糕！坏掉了'}, 500


@flow_page.route('/api/flow/<int:flow_id>', methods=['PUT'])
@jwt_required()
def save_flow(flow_id):
    data = request.get_json()
    flow = Flow.query.filter_by(id=flow_id).first()
    if not flow:
        return {'message': '流程图不存在'}, 404
    if flow.author != User.find_by_username(get_jwt_identity()).id:
        return {'message': '你没有权限修改此流程图'}, 403
    try:
        flow.flow_name = data.get("name", flow.flow_name)
        flow.flow_desc = data.get("desc", flow.flow_desc)
        flow.flow_img = data.get("img", flow.flow_img)
        flow.public = data.get("public", flow.public)
        flow.flow_json = data.get("json", flow.flow_json)
        flow.save_to_db()
        return {
            'message': '成功修改'
        }
    except Exception as e:
        print(e)
        return {'message': '糟糕！坏掉了'}, 500


@flow_page.route('/api/flow/<int:flow_id>', methods=['DELETE'])
@jwt_required()
def del_flow(flow_id):
    flow = Flow.query.filter_by(id=flow_id).first()
    if not flow:
        return {'message': '流程图不存在'}, 404
    if flow.author != User.find_by_username(get_jwt_identity()).id:
        return {'message': '你没有权限删除此流程图'}, 403
    try:
        db.session.delete(flow)
        db.session.commit()
        return {
            'message': '成功删除'
        }
    except Exception as e:
        print(e)
        return {'message': '糟糕！坏掉了'}, 500


@flow_page.route('/api/flows', methods=['GET'])
def flows():
    flow_list = [flow.to_dict_without_img_json() for flow in Flow.query.all()]
    return jsonify({'message': flow_list})


@flow_page.route('/api/my_flows', methods=['GET'])
@jwt_required()
def my_flows():
    flow_list = [flow.to_dict_without_img_json() for flow in Flow.query.filter_by(author=User.find_by_username(get_jwt_identity()).id).all()]
    return jsonify({'message': flow_list})


@flow_page.route('/api/flow/<int:flow_id>', methods=['GET'])
@jwt_required(optional=True)
def get_flow(flow_id):
    flow = Flow.query.filter_by(id=flow_id).first()
    user = User.find_by_username(get_jwt_identity())
    if not flow:
        return {'message': '流程图不存在'}, 404
    if not flow.public and (user is None or flow.author != user.id):
        return {'message': '你没有权限查看此流程图'}, 403
    try:
        return {
            'message': flow.to_dict_without_img()
        }
    except Exception as e:
        print(e)
        return {'message': '糟糕！坏掉了'}, 500


@flow_page.route('/api/flow/<int:flow_id>/thumbnail', methods=['GET'])
@jwt_required(optional=True)
def get_thumbnail(flow_id):
    flow = Flow.query.filter_by(id=flow_id).first()
    user = User.find_by_username(get_jwt_identity())
    if not flow:
        return {'message': '流程图不存在'}, 404
    # print(not flow.public, user is None)
    print(user)
    if not flow.public:
        if user is None:
            return {'message': '你没有权限查看此流程图'}, 403
        elif flow.author != user.id:
            return {'message': '你没有权限查看此流程图'}, 403 
    try:
        if not flow.flow_img:
            return {'message': "此流程图暂无缩略图"}, 404
        return flow.flow_img
    except Exception as e:
        print(e)
        return {'message': '糟糕！坏掉了'}, 500
