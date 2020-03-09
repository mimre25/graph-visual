import config
import glob
import json
import os
from globals import TRACE

# This file provides an API to the server for handling database writing
# operations (using a filesystem-based database).
#
# Eventually, we could write a drop-in replacement that uses an actual database

class QuizDB:
    submissions_data = {}
    location = ''

    def __init__(self, location):
        self.location = location
        for filename in glob.iglob(os.path.join(config.basedir, self.location, '**/*.quiz.json'), recursive=True):
            with open(filename) as f:
                self.submissions_data[filename] = json.loads(f.read())

    # Return dict of user's quiz submissions so far
    def get_submission(self, username, quiz_id):
        return TRACE(self.submissions_data[TRACE(self.get_filename(username, quiz_id))])

    # Update user submission entry and write to disk
    # 'submission' is dict
    def write_submission(self, username, quiz_id, submission):
        self.submissions_data[self.get_filename(username, quiz_id)] = submission
        os.makedirs(os.path.dirname(TRACE(self.get_filename(username, quiz_id))), exist_ok=True)
        with open(self.get_filename(username, quiz_id), mode='wt') as f:
            f.write(json.dumps(submission, indent=4, ensure_ascii=False))

    # (used internally)
    def get_filename(self, username, quiz_id):
        return os.path.join(config.basedir, self.location, username, quiz_id + ".quiz.json")

    def exists(self, username, quiz_id):
        return self.get_filename(username, quiz_id) in self.submissions_data.keys()

    def add(self, username, quiz_id):
        if not self.exists(username, quiz_id):
            self.submissions_data[self.get_filename(username, quiz_id)] = {"username": username, "quiz_id": quiz_id,
                                                                           "submissions": []}
