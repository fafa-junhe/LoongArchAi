import datetime
import random

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
import urllib.parse
import urllib.request

from config import db
from database.model import User, RevokedTokenModel, VerificationCode

user_page = Blueprint('user', __name__)
# 生成验证码的函数
def generate_verification_code():
    return f"{random.randint(100000, 999999)}"

# 发送验证码的接口
@user_page.route('/api/send_code', methods=['POST'])
def send_code():
    # 从请求中获取电话号码
    phone_number = request.json.get('phone')
    if not phone_number:
        return jsonify({"error": "电话号码为必填项"}), 400

    # 生成新的验证码
    code = generate_verification_code()
    verification_code = VerificationCode(phone_number=phone_number, code=code)
    db.session.add(verification_code)
    db.session.commit()
    # 接口地址
    url = 'http://106.ihuyi.com/webservice/sms.php?method=Submit'
    # 定义请求的数据
    values = {
      'account': 'C81013087',
      'password': '9d81b5eab76cf9a2d79f0d241cbcf7b7',
      'mobile': phone_number,
      'content': f'您的验证码是：{code}。请不要把验证码泄露给其他人。',
      'format': 'json',
    }
    # 将数据进行编码
    data = urllib.parse.urlencode(values).encode(encoding='UTF8')
    # 发起请求
    req = urllib.request.Request(url, data)
    response = urllib.request.urlopen(req)
    res = response.read()
    print(res.decode("utf8"))
    # 打印结果
    print(f"验证码 {code} 已发送到 {phone_number}")
    return jsonify({"message": "验证码已经发送"}), 200

# 获取用户的接口
@user_page.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.find_by_id(user_id).to_dict()
    return user

# 获取自己用户信息的接口
@user_page.route('/api/user', methods=['GET'])
@jwt_required()
def get_my_user():
    user = User.find_by_username(get_jwt_identity()).to_dict()
    return user

@user_page.route('/api/user', methods=['PUT'])
@jwt_required()
def set_user():
    data = request.get_json()
    user = User.query.filter_by(id=User.find_by_username(get_jwt_identity()).id).first()
    try:
        user.nickname = data.get("nickname", user.nickname)
        user.avatar = data.get("avatar", user.avatar)
        user.save_to_db()
        return {
            'message': '成功修改'
        }
    except Exception as e:
        print(e)
        return {'message': '糟糕！坏掉了'}, 500

# 创建用户的接口
@user_page.route('/api/user', methods=['POST'])
def create_user():
    data = request.get_json()
    username = None
    password = None
    nickname = None
    phone = None
    
    # 检查是否通过电话号码注册
    if data.get('phone'):
        phone_number = data.get('phone')
        code = data.get('code')
        if not phone_number or not code:
            return jsonify({"error": "必须填写电话号码和验证码"}), 404
        
        # 验证验证码
        verification_code = VerificationCode.query.filter_by(phone_number=phone_number, code=code).first()
        if verification_code and not verification_code.is_expired:
            db.session.delete(verification_code)
            db.session.commit()
            username = data.get('phone')
            current_user = User.find_by_username(username)
            if not current_user:
                password = User.generate_hash(data['phone'])
                nickname = data.get('phone')
                phone = data.get('phone')
                new_user = User(username=username, password=password, nickname=nickname, phone=phone)
                new_user.save_to_db()
                access_token = create_access_token(identity=data['phone'])
                refresh_token = create_refresh_token(identity=data['phone'])
                return {
                    'message': f'用户 {data["phone"]} 成功创建',
                    'access_token': access_token,
                    'refresh_token': refresh_token
                }
            access_token = create_access_token(identity=data['phone'])
            refresh_token = create_refresh_token(identity=data['phone'])
            return {
                'message': f'用户 {current_user.phone} 成功登陆',
                'access_token': access_token,
                'refresh_token': refresh_token
            }, 200
        else:
            return jsonify({"error": "验证码已过期"}), 400
    else:
        # 通过用户名和密码注册
        if User.find_by_username(data['username']):
            return {'message': f'用户 {data["username"]} 已存在'}
        username = data['username']
        password = User.generate_hash(data['password'])
        nickname = data['username']
        phone = None
    
    try:
        # 创建新用户并保存到数据库
        new_user = User(username=username, password=password, nickname=nickname, phone=phone)
        new_user.save_to_db()
        access_token = create_access_token(identity=data['username'])
        refresh_token = create_refresh_token(identity=data['username'])
        return {
            'message': f'用户 {data["username"]} 成功创建',
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    except Exception as e:
        print(e)
        return {'message': '糟糕！坏掉了'}, 500

# 用户登录接口
@user_page.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    current_user = User.find_by_username(data['username'])
    if not current_user:
        return {'message': f'用户 {data["username"]} 不存在'}, 404

    # 验证密码
    if User.verify_hash(data['password'], current_user.password):
        access_token = create_access_token(identity=data['username'])
        refresh_token = create_refresh_token(identity=data['username'])
        return {
            'message': f'用户 {current_user.username} 成功登陆',
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 200
    else:
        return {'message': '凭证错误'}, 500


@user_page.route('/api/access', methods=['GET'])
@jwt_required(refresh=True)
def get_access():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    return {'access_token': access_token}


@user_page.route('/api/logout_access', methods=['POST'])
@jwt_required()
def logout_access():
    jti = get_jwt()['jti']
    try:
        revoked_token = RevokedTokenModel(jti=jti)
        revoked_token.add()
        return {'message': '注销成功'}
    except:
        return {'message': '出了点问题'}, 500


@user_page.route('/api/logout_refresh', methods=['POST'])
@jwt_required(refresh=True)
def logout_refresh():
    jti = get_jwt()['jti']
    try:
        revoked_token = RevokedTokenModel(jti=jti)
        revoked_token.add()
        return {'message': '注销成功'}
    except:
        return {'message': '出了点问题'}, 500
