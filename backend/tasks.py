from datetime import datetime, timedelta, timezone, tzinfo

from config import db, app
from database.model import VerificationCode
import os
import time


def delete_expired_codes():
	with app.app_context():
		now = datetime.now().astimezone().astimezone(timezone.utc).replace(tzinfo=None)
		print(now)
		expiration_time = now - timedelta(minutes=10)
		expired_codes = VerificationCode.query.filter(VerificationCode.created_at < expiration_time).all()

		for code in expired_codes:
			db.session.delete(code)

		db.session.commit()
		print(f"Deleted {len(expired_codes)} expired codes")


def delete_temp_files():
	with app.app_context():
		now = datetime.now().astimezone().astimezone(timezone.utc).replace(tzinfo=None)
		expiration_time = now - timedelta(minutes=20)
		expired_files = [
			os.path.join("temp_wav", file)
			for file in os.listdir("temp_wav")
			if os.path.getctime(os.path.join("temp_wav", file)) <= expiration_time.timestamp()
		]
		expired_files.extend([
			os.path.join("temp_img", file)
			for file in os.listdir("temp_img")
			if os.path.getctime(os.path.join("temp_img", file)) <= expiration_time.timestamp()
		])

		for file in expired_files:
			os.remove(file)

		print(f"Deleted {len(expired_files)} expired files")
