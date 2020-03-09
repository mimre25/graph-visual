import json
import config
import os

from database import QuizDB
from globals import TRACE


class Quiz:
  def __init__(self):
    self.database = QuizDB('db')

  # This file deals with the actual quiz-taking logic

  # Request should be pre-validated
  # Returns a dict
  def get_quiz(self, quiz_id, start_at, prepare=True):
    name = os.path.join(config.basedir, '../quiz', quiz_id + '.json')
    try:
      with open(name) as f:
        s = f.read()
      d = json.loads(s)
      if prepare:
        return self.prepare_quiz(d, start_at)
      else:
        return d
    except IOError:
      print('Error opening ' + name + ': file does not exist')
      return {}

  # Strips answers from quiz to send to client
  # Accepts and returns a dict
  def prepare_quiz(self, quiz_dict, cur):
    for question in quiz_dict["questions"]:
      question.pop("answer", None)
    for i in range(cur):
      quiz_dict["questions"][i]["answered"] = 1
    return quiz_dict

  # Adds the user's answer for one question to self.database
  def handle_submission(self, request):
    if not self.database.exists(request["username"], request["quiz_id"]):
      self.database.add(request["username"], request["quiz_id"])
    if int(request["question_number"]) == self.questions_answered(request["username"], request["quiz_id"]):
      submission_so_far = self.database.get_submission(request["username"], request["quiz_id"])
      # answer_to_add = {"submission": request["submission"],
      #                  "metadata": request["metadata"]}
      answer_to_add = request
      submission_so_far["submissions"].append(answer_to_add)
      self.database.write_submission(request["username"], request["quiz_id"], submission_so_far)
      return True
    else:
      print("Invalid submission -- out of order answers")
      return False

  # Returns the number of questions a user has answered so far
  def questions_answered(self, username, quiz_id):
    n = 0
    try:
      n = len(TRACE(self.database.get_submission(username, quiz_id)["submissions"]))
    except KeyError:
      pass
    return n
