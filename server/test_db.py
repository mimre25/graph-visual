import json
import os
import requests

url_get = "http://localhost:8080/api/get_quiz"

url_submit = "http://localhost:8080/api/submit_answer"

request_get = '''
{
    "username": "jdoe",
    "quiz_id": "example_quiz"
}
'''

request_submit = '''
{
    "username": "jdoe",
    "quiz_id": "example_quiz",
    "question_number": 0,
    "submission": [0, 2],
    "metadata": {
        "time": "<insert timestamp here>"
    }
}
'''

request_get_dict = json.loads(request_get)

print(request_get_dict)

r_get = requests.post(url_get, json=request_get_dict)

print(r_get.status_code)

print(r_get.json())

request_submit_dict = json.loads(request_submit)

print(request_submit_dict)

r_submit = requests.post(url_submit, json=request_submit_dict)

print(r_submit.status_code)

print(r_submit.json())

# Add a submission
# (Succeeds if file doesn't exist)
# if (quiz.handle_submission(request_dict)):
#     print('Submission succeeded!')
# else:
#     print('Submission failed!')

# Attempt to submit answer to same question again
# (Should always fail)
# if (quiz.handle_submission(request_dict)):
#     print('Second submission succeeded!')
# else:
#     print('Second submission failed!')
