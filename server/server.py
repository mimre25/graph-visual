from flask import Flask, request, send_from_directory, redirect, url_for, render_template
import flask_login
from flask_login import login_required, login_user, current_user
from auth import User, get_user, validate_user
import argparse as arg
import json
import os
import shutil
import compile_quiz
import config
import quiz

# set the project root directory as the static folder
from database import QuizDB
from globals import TRACE
from compile_quiz import compile

app = Flask(__name__, static_url_path = '', template_folder='../')

# TODO this is very bad.  find a better way to do this
app.secret_key = b'this_is_a_bad_secret_key'
login_manager = flask_login.LoginManager()


@login_manager.user_loader
def load_user(user_id):
    return get_user(user_id)


@app.route('/login', methods=['GET', 'POST'])
def login_handler():
    if request.method == 'POST':
        if validate_user(request.form['username'], request.form['password']):
            login_user(User(request.form['username'], True))
            return redirect(url_for('quiz_page'))
        else:
            return render_template('quiz-login.html', message="Incorrect User/Password combination")
    return render_template('quiz-login.html', message=None)


@app.route('/lib/<path:path>')
def send_lib(path):
    return send_from_directory('../lib', path)


@app.route('/js/<path:path>')
def send_js(path):
    if '.js' not in path[-3:]:
        path += '.js'
    return send_from_directory('../js', path)


@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('../css', path)


@app.route('/data/<path:path>')
def send_data(path):
    return send_from_directory('../data', path)


@app.route('/about.html')
def about():
    return send_from_directory('../', 'about.html')

@app.route('/')
def root():
    return send_from_directory('../', 'index.html')


@app.route('/quiz')
def quiz_page():
    if current_user.is_authenticated:
        return send_from_directory('../', 'quiz.html')
    else:
        return redirect(url_for('login_handler'))


@app.route('/submitted')
def submitted():
    if current_user.is_authenticated:
        return send_from_directory('../', 'submitted.html')
    else:
        return redirect(url_for('login_handler'))


@app.route('/api/get_quiz', methods=['POST'])
def handle_quiz_request():
    print(flask_login.current_user.get_id())
    j = TRACE(request.get_json(force=True))
    # Use flask_login username instead of browser-supplied name
    # start_at = quizObject.questions_answered(j["username"], j["quiz_id"])
    start_at = quizObject.questions_answered(current_user.get_id(), j["quiz_id"])
    q = quizObject.get_quiz(j["quiz_id"], start_at)
    if args.backup:
        q["backup"] = args.backup
    return TRACE(json.dumps(q, indent=4, ensure_ascii=False))


@app.route('/api/submit_answer', methods=['POST'])
def handle_answer_submission():
    print(request.get_json())
    j = request.get_json(force=True)
    j['username'] = current_user.get_id()
    TRACE(json.dumps(j, indent=4, ensure_ascii=False))
    s = quizObject.handle_submission(j)
    return ('', 200) if s else ('', 400)


if __name__ == "__main__":
#    compile_quiz(os.path.join(config.basedir, "example_quiz", "quiz"),
#            os.path.join(config.basedir, "quiz", "quiz.json"))
    parser = arg.ArgumentParser(description='Serve the GraphVisual website.')
    # Flags go here
    parser.add_argument('--backup') # TODO KYLE please fill in here
    parser.add_argument('--reset', action='store_true', help="Whether the server should delete the database upon startup (debug flag)")
    # End flags
    args = parser.parse_args()
    if args.reset:
        shutil.rmtree('db', True)
        compile("../quiz/questions/", "../quiz/graph_quiz.json")
    quizObject = quiz.Quiz()
    login_manager.init_app(app)
    #app.run(host='localhost', port='8080')#, ssl_context='adhoc')
    app.run(host='0.0.0.0', port='8081', ssl_context='adhoc')
