import datetime
import json
import os
import os.path
import re
import yaml

# The default behavior for transforming a YAML field to JSON
# is to copy it exactly.  This means that certain fields like
# "placeholder", "meta", etc. do not need any special consideration
# in the compiler.
#
# There are two types of exceptions to rule:
#
# 1) The name of a YAML field is different in JSON
#    (e.g. "question" => "text")
# 2) There is special logic to transform the YAML data:
#    (e.g. answers as strings => answers as array index)
from globals import TRACE

KEY_QUESTIONS = "questions"
KEY_OPTIONS = "options"
KEY_CHOICES = "choices"
KEY_TYPE = "type"
KEY_ANSWER = "answer"
KEY_GRAPH = "graph"
KEY_LAYOUTS = "layouts"

TYPE_MAP = {
  "single": "radio",
  "multi": "checkbox",
  "text": "text",
  "select": "node",
}

# Fields in YAML that map to different names in JSON
NAME_MAP = {
  "choices": "options",
  "question": "text",
}

# Fields in YAML that have special logic to transform them
SPECIAL_NAMES = [
  "type",
  "answer",
]

LAYOUT_MAP = {
  'randomized': "RANDOMIZED",
  'circular': "CIRCULAR",
  'spectral': "SPECTRAL",
  'force directed': "FORCE_DIRECTED",
  "fm3": "FM_3",
  'force atlas 2': "FORCE_ATLAS",
  'openord': "OPENORD",
  'yifan hu': "YIFAN_HU",
}

def translateLayouts(layouts):
    '''
    Translate the layouts to the corresponding javascript keys
    :param layouts: a list of layouts
    :return: the transleted list
    '''
    if type(layouts) != list:
      layouts = [layouts]
    return [LAYOUT_MAP[l] if l in LAYOUT_MAP.keys() else "extra" for l in map(lambda x: x.lower(), layouts)]


# Take a YAML field and return the JSON field
def rename(name):
  if name in NAME_MAP.keys():
    return NAME_MAP[name]
  return name


# Take an array of questions as YAML text and return a dict
# which, when dumped to JSON, can be understood by the browser
def translate(quiz_name, quiz_yaml):
  '''
  Translate questions to browser-ready format.
  :param quiz_name: name of the quiz
  :param quiz_yaml: array of strings representing YAML-formatted questions
  :return: dict to be dumped to JSON
  '''
  quiz = {}
  quiz["quizId"] = quiz_name
  quiz[KEY_QUESTIONS] = []

  quiz_pp = map((lambda x: yaml.load(x, Loader=yaml.FullLoader)), quiz_yaml)
  for question_pp in quiz_pp:
    question = {}

    # Copy over all fields that don't require special processing
    for field in filter(lambda x: x not in SPECIAL_NAMES,
                        question_pp.keys()):
      question[rename(field)] = question_pp[field]

    # Handle special fields -- maybe this should be refactored

    if KEY_TYPE in question_pp.keys():
      if question_pp[KEY_TYPE] in TYPE_MAP.keys():
        question[KEY_TYPE] = TYPE_MAP[question_pp[KEY_TYPE]]
      else:
        # TODO consider throwing an error here?
        question[KEY_TYPE] = question_pp[KEY_TYPE]

    if KEY_ANSWER in question_pp.keys():
      if KEY_OPTIONS in question.keys():
        if type(question_pp[KEY_ANSWER]) != list:
          question[KEY_ANSWER] = question_pp[KEY_ANSWER]
        else:
          question[KEY_ANSWER] = []
          for a in question_pp[KEY_ANSWER]:
            question[KEY_ANSWER].append(a)
      else:
        question[KEY_ANSWER] = question_pp[KEY_ANSWER]

    if KEY_GRAPH in question_pp.keys():
      if KEY_LAYOUTS in question[KEY_GRAPH]:
        question[KEY_GRAPH][KEY_LAYOUTS] = translateLayouts(question[KEY_GRAPH][KEY_LAYOUTS])
      else:
        question[KEY_GRAPH][KEY_LAYOUTS] = list(LAYOUT_MAP.values())
    quiz[KEY_QUESTIONS].append(question)

  return quiz


# Take YAML quiz questions in directory 'source', and output a JSON quiz file
# in file 'target'

def compile(source, target, timestamp=False):
  '''
  Creates a compiled JSON file given a path to a quiz in YAML format.
  :param source: path to yaml directory
  :param target: json output file
  :param timestamp: whether to additionally create a file
      with an ISO-8061-like timestamp prepended to its name
  :return: boolean (operation completed successfully)
  '''
  if not os.path.isdir(source):
    # Error reporting could be tweaked
    error(source + " is not a directory")
    return False
  quiz_name = os.path.normpath(target).split(os.sep)[-1].split('.')[0]
  i = 1
  fname = '1.yaml'
  quiz_yaml = []
  while os.path.exists(os.path.join(source, fname)):
    with open(os.path.join(source, fname), 'r') as f:
      data = f.read()
    quiz_yaml.append(data)
    i += 1
    fname = str(i) + '.yaml'

  if not quiz_yaml:
    error(source + " does not contain `1.yaml`")
    return False

  output = json.dumps(translate(quiz_name, quiz_yaml), indent=4)
  with open(target, 'w') as f:
    f.write(output)
  if timestamp:
    x, y = os.path.split(target)
    ts = datetime.datetime.now().replace(microsecond=0).isoformat('-')
    y = '-'.join(re.split('-|:', ts)) + '-' + y
    with open(os.path.join(x, y), 'w') as f:
      f.write(output)

  return True


def error(s):
  print("compilation error: ", s)

compile("../quiz/questions/", "../quiz/graph_quiz.json")
