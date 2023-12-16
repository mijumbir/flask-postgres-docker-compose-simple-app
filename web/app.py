from flask import Flask, json
from flask import request, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from config import BaseConfig
from flask_login      import LoginManager
from flask_bcrypt     import Bcrypt

app = Flask(__name__)
app.config.from_object(BaseConfig)
db = SQLAlchemy(app)

lm = LoginManager(   ) # flask-loginmanager
lm.init_app(app) # init the login manager

bc = Bcrypt      (app) # flask-bcrypt

# from models import *
from views import *

# @app.route('/', methods=['GET'])
# def index():
#     # posts = Post.query.order_by(Post.date_posted.desc()).all()
#     # data = [
#     #     {"label": "person a", "times": [{"color":"green", "label":"Weeee", "starting_time": 1355752800000, "ending_time": 1355759900000},
#     #                                     {"color":"blue", "label":"Weeee", "starting_time": 1355767900000, "ending_time": 1355774400000}]},
#     #     {"label": "person b", "times": [{"color":"pink", "label":"Weeee", "starting_time": 1355759910000, "ending_time": 1355761900000}]},
#     #     {"label": "person c", "times": [{"color":"yellow", "label":"Weeee", "starting_time": 1355761910000, "ending_time": 1355763910000}]}
#     #   ]
#     data = [{"times":"x"}]
#     posts = [{'date_posted':datetime.datetime.now(), 'text':'DATA'}, {'date_posted':datetime.datetime.now(), 'text':'DATA'}]
#     return render_template('index.html', posts=posts, timelines=data)
#
# @app.route('/submit', methods=['POST'])
# def submit():
#     text = request.form['text']
#     post = Post(text)
#     db.session.add(post)
#     db.session.commit()
#     return redirect(url_for('index'))


if __name__ == '__main__':
    app.run(port=5001)
