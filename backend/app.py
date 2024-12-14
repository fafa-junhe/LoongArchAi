import atexit
import os
from datetime import datetime

from flask import render_template, send_from_directory, request
from config import app, db, scheduler
from routers.application import app_page
from routers.flow import flow_page
from routers.model import model_page
from routers.user import user_page
from tasks import delete_expired_codes, delete_temp_files

app.register_blueprint(model_page)
app.register_blueprint(app_page)
app.register_blueprint(flow_page)
app.register_blueprint(user_page)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
	return render_template("index.html")


@app.route("/assets/<path:path>")
def assets(path):
	return send_from_directory("public/assets", path)


@app.route("/api/log", methods=["POST"])
def log():
	open("frontend.log", "a").write("\n".join("[" + i["timestamp"] + "]" + i["error"] for i in request.json.get("errors")))
	return "OK"


if __name__ == '__main__':

	if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
		scheduler.add_job(func=delete_expired_codes, trigger="interval", minutes=1)
		scheduler.add_job(func=delete_temp_files, trigger="interval", minutes=20)
		scheduler.start()
		# Shut down the scheduler when exiting the app
		atexit.register(lambda: scheduler.shutdown())
	delete_temp_files()


	app.run(host="0.0.0.0", debug=True)
