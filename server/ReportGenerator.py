import json
import os
import pandas as pd
import re
import quiz

answers = {}
quizId = -1
for participant in os.listdir('db'):
  if os.path.isdir('db/' + participant):
    print(participant)
    with open('db/' + participant + '/graph_quiz.quiz.json') as f:
      answers[participant] = json.load(f)
      quizId = answers[participant]['quiz_id']

report = pd.DataFrame(columns=['user', 'question', 'answer'])

print(report)

quizObject = quiz.Quiz()
quiz = quizObject.get_quiz(quizId, 0, False)
for participant, submissions in answers.items():
  for qId, submission in enumerate(submissions['submissions']):
    ans = submission['submission']
    question = quiz['questions'][qId]
    refAns = question['answer']
    score = ""
    if question['type'] != 'text':
      if ans:
        if question['type'] == 'radio':
          score = 1 if ans[0] == refAns else 0
        else:
          score = 1 if ans == list(refAns) else 0
      ans = str(ans).replace("'","").replace('"','')
      refAns = str(refAns).replace("'","").replace('"','')
    elif ans:
      ans = ans[0]
    else:
      ans = str(ans)
    ans = re.sub("^'(.*)'$", "\1", ans)
    ans = re.sub('^"(.*)"$', "\1", ans)
    refAns = re.sub("^'(.*)'$", "\1", refAns)
    refAns = re.sub('^"(.*)"$', "\1", refAns)
    entry = {
             "quiz id": quizId,
             "type": question['type'],
             "user": participant,
             "question number": qId,
             "score": score,
             "answer": ans,
             "ref answ": refAns,
             "question": question['text']
             }
    # print(entry)
    report = report.append(entry, ignore_index=True)

for col in report.where(report['type'] != 'text'):
    report[col] = report[col].astype(str).str.replace("[","").str.replace("]","")#.str.replace("'","").str.replace('"','')
print(report)

report.to_csv("report.csv", sep=";", index=False, columns=['quiz id', 'user', 'question number', 'type', 'score', 'question', 'answer', 'ref answ'])
