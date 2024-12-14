import atexit
import os
import dashscope
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from flask_jwt_extended import JWTManager
from sqlalchemy.exc import OperationalError


basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__, static_folder="./public/", template_folder="./public/")
app.config["SQLALCHEMY_DATABASE_URI"] = CHANGETHIS
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True
app.config["JWT_SECRET_KEY"] = "wwx"
app.config["JWT_BLOCKLIST_TOKEN_CHECKS"] = ["access", "refresh"]
jwt = JWTManager(app)
db = SQLAlchemy(app)
with app.app_context():
    try:
        db.create_all()
    except OperationalError as e:
        # 无法连接就使用本地的sqlite数据库
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///local.db"
        del app.extensions["sqlalchemy"]
        db = SQLAlchemy(app)
        db.create_all()
print(app.config["SQLALCHEMY_DATABASE_URI"])
app.debug = True
CORS(app)


dashscope.api_key = CHANGETHIS
flow_data_path = "./flow_data"
temp_wav_path = "./temp_wav"
temp_img_path = "./temp_img"


kimi_api_key = CHANGETHIS
# Set up APScheduler
scheduler = BackgroundScheduler()
