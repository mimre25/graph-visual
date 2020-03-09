import config
import globals

import json
import os

# flask-login User object
class User:
    username = ''
    authd = False
    def __init__(self, username, authd):
        self.username = username
        self.authd = authd
    def is_authenticated(self):
        return self.authd
    def is_active(self):
        return True
    def is_anonymous(self):
        return False
    def get_id(self):
        return self.username

def get_user(username):
    path = os.path.join(config.basedir, 'db', username, '_auth.json')
    try:
        with open(path) as f:
            s = f.read()
        d = json.loads(s)
        return User(d["username"], d["authd"])
    except IOError:
        print("User " + username + " does not exist")
        return None

# return boolean of whether credentials are valid
def validate_user(username, password):
    path = os.path.join(config.basedir, 'db', username, '_auth.json')
    try:
        with open(path) as f:
            s = f.read()
        d = json.loads(s)
        return d["username"] == username and d["password"] == password
    except IOError:
        print("Invalid user:", username)
        return False

# def login_user(user):
#     user.authd = True
#     path = os.path.join(config.basedir, '../' + 'db', \
#             user.username, '_auth.json')
#     try:
#         with open(path) as f:
#             s = f.read()
#         d = json.loads(s)
#         d["authd"] = True
#         with open(path, mode='wt') as f:
#             f.write(json.dumps(d, indent=4, ensure_ascii=False))
#     except IOError:
#         print("IO error") # TODO handle better
