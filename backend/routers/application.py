from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
import traceback
from database.model import App, db, User, Flow

app_page = Blueprint('application', __name__)


@app_page.route('/api/app', methods=['POST'])
@jwt_required()
def create_app():
    new_app = App(
        author=User.find_by_username(get_jwt_identity()).id,
        app_name=request.json['name'],
        app_desc=request.json['desc'],
        public=request.json['public']
    )
    try:
        new_app.save_to_db()
        return {
            'message': '应用成功创建',
            'app_id': new_app.id,
        }
    except Exception as e:
        print(e)
        return {'message': '糟糕！坏掉了'}, 500


@app_page.route('/api/app/<int:app_id>', methods=['PUT'])
@jwt_required()
def update_app(app_id):
    _app = App.query.get(app_id)
    if not _app:
        return {'message': '应用不存在'}, 404
    if not _app.author == User.find_by_username(get_jwt_identity()).id:
        return {'message': '你没有权限修改此应用'}, 403
    try:
        _app.app_name = request.json.get('name', _app.app_name)
        _app.app_desc = request.json.get('desc', _app.app_desc)
        _app.app_img = request.json.get("img", _app.app_img)
        _app.app_theme = request.json.get('theme', _app.app_theme)
        _app.app_background = request.json.get("background", _app.app_background)
        _app.flows = [Flow.query.filter_by(id=flow).first() for flow in request.json.get('flows', [i.id for i in _app.flows])]
        _app.public = request.json.get('public', _app.public)
        _app.save_to_db()
        return {
            'message': '成功修改'
        }
    except Exception as e:
        traceback.print_exc()
        return {'message': '糟糕！坏掉了'}, 500


@app_page.route('/api/app/<int:app_id>', methods=['GET'])
@jwt_required(optional=True)
def get_app(app_id):
    app = App.query.filter_by(id=app_id).first()
    if not app:
        return {'message': '应用不存在'}, 404
    if not app.public and app.author != User.find_by_username(get_jwt_identity()).id:
        return {'message': '你没有权限查看此应用'}, 403
    try:
        return {
            'message': {
                **app.to_dict(), 
                "flows": [flow.to_dict_without_img_json() for flow in app.flows]
            } 
        }
    except Exception as e:
        print(e)
        return {'message': '糟糕！坏掉了'}, 500


@app_page.route('/api/app/<int:app_id>', methods=['DELETE'])
@jwt_required()
def del_app(app_id):
    _app = App.query.filter_by(id=app_id).first()
    if not _app:
        return {'message': '应用不存在'}, 404
    if _app.author != User.find_by_username(get_jwt_identity()).id:
        return {'message': '你没有权限删除此应用'}, 403
    try:
        db.session.delete(_app)
        db.session.commit()
        return {
            'message': '成功删除'
        }
    except Exception as e:
        print(e)
        return {'message': '糟糕！坏掉了'}, 500


@app_page.route('/api/apps', methods=['GET'])
def list_app():
    app_list = [app.to_dict() for app in App.query.all()]
    return jsonify({'message': app_list})


@app_page.route('/api/my_apps', methods=['GET'])
@jwt_required()
def my_flows():
    flow_list = [app.to_dict() for app in
                 App.query.filter_by(author=User.find_by_username(get_jwt_identity()).id).all()]
    return jsonify({'message': flow_list})


@app_page.route('/api/app/<int:app_id>/thumbnail', methods=['GET'])
@jwt_required(optional=True)
def get_thumbnail(app_id):
    app = App.query.filter_by(id=app_id).first()
    user = User.find_by_username(get_jwt_identity())
    if not app:
        return {'message': '应用不存在'}, 404
    if not app.public:
        if app is None:
            return {'message': '你没有权限查看此应用'}, 403
        elif app.author != user.id:
            return {'message': '你没有权限查看此应用'}, 403
    try:
        if not app.app_img:
            return {'message': "此应用暂无缩略图"}, 404
        return app.app_img
    except Exception as e:
        print(e)
        return {'message': '糟糕！坏掉了'}, 500
@app_page.route('/api/app/<int:app_id>/background', methods=['GET'])
@jwt_required(optional=True)
def get_background(app_id):
    app = App.query.filter_by(id=app_id).first()
    user = User.find_by_username(get_jwt_identity())
    if not app:
        return {'message': '应用不存在'}, 404
    if not app.public:
        if app is None:
            return {'message': '你没有权限查看此应用'}, 403
        elif app.author != user.id:
            return {'message': '你没有权限查看此应用'}, 403
    try:
        if not app.app_background:
            return {'message': "此应用暂无背景"}, 404
        return app.app_background
    except Exception as e:
        print(e)
        return {'message': '糟糕！坏掉了'}, 500