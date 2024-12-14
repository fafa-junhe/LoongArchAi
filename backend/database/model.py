from datetime import datetime, timedelta

from config import db, jwt
from passlib.hash import pbkdf2_sha256 as sha256


# 回调函数根据token是否在blocklist返回True或False
@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(jwt_header, decrypted_token):
    jti = decrypted_token['jti']
    return RevokedTokenModel.is_jti_blacklisted(jti)


class BaseModel(db.Model):
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)
    create_time = db.Column(db.DateTime, default=datetime.now)
    update_time = db.Column(db.DateTime, onupdate=datetime.now, default=datetime.now)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()


app_flows = db.Table('app_flows',
                     db.Column('app_id', db.Integer, db.ForeignKey('app.id'), primary_key=True),
                     db.Column('flow_id', db.Integer, db.ForeignKey('flow.id'), primary_key=True)
                     )


class User(BaseModel):
    __tablename__ = 'user'
    username = db.Column(db.String, unique=True, nullable=False)
    nickname = db.Column(db.String, nullable=False)
    password = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, unique=True, nullable=True)
    avatar = db.Column(db.String, default=None)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns if c.name != 'password'}


    @classmethod
    def find_by_username(cls, username):
        return cls.query.filter_by(username=username).first()
    
    @classmethod
    def find_by_id(cls, id):
        return cls.query.filter_by(id=id).first()

    @staticmethod
    def generate_hash(password):
        return sha256.hash(password)

    @staticmethod
    def verify_hash(password, hash):
        return sha256.verify(password, hash)


class Flow(BaseModel):
    __tablename__ = 'flow'
    flow_name = db.Column(db.String(120), unique=False, nullable=True)
    flow_desc = db.Column(db.String(120), unique=False, nullable=True)
    flow_json = db.Column(db.JSON, nullable=True)
    flow_img = db.Column(db.String, nullable=True)
    flow_type = db.Column(db.Integer, nullable=True)
    public = db.Column(db.Boolean, nullable=True)
    author = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # 添加外键

    def to_dict_without_img(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns if c.name != 'flow_img'}

    def to_dict_without_img_json(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns if c.name != 'flow_img' and c.name != 'flow_json'}


class App(BaseModel):
    __tablename__ = 'app'
    app_name = db.Column(db.String(100))
    app_desc = db.Column(db.String(150))
    app_background = db.Column(db.String, nullable=True)
    app_img = db.Column(db.String, nullable=True)
    app_theme = db.Column(db.String, nullable=True)
    flows = db.relationship('Flow', secondary=app_flows, lazy='subquery', backref=db.backref('app', lazy=True))
    public = db.Column(db.Boolean, nullable=False)
    author = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 添加外键y


class Trash(BaseModel):
    __tablename__ = 'trash'
    app_id = db.Column(db.Integer, db.ForeignKey('app.id'), nullable=False)
    flow_id = db.Column(db.Integer, db.ForeignKey('flow.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


class RevokedTokenModel(db.Model):
    __tablename__ = 'revoked_tokens'
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(120))

    def add(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def is_jti_blacklisted(cls, jti):
        query = cls.query.filter_by(jti=jti).first()
        return bool(query)

class VerificationCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    phone_number = db.Column(db.String(15), nullable=False)
    code = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def is_expired(self):
        return datetime.utcnow() > self.created_at + timedelta(minutes=10)
