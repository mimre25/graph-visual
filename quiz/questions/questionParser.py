import pandas as pd
import yaml
import numpy as np

questions = pd.read_csv('questions.tsv', delimiter='\t')
questions.head()
print(questions)
questions = questions.replace(np.NaN, '-', regex=True)

for i, q in questions.iterrows():
	# print(q["Data set"], q["Layouts"], q["Type"], q["Choices"], q["Answer"], q["Question"])
	print("question", i)
	choices = [x.strip() for x in q["Choices"].split(';')] if ';' in q["Choices"] else q["Choices"]
	answer = [x.strip() for x in q["Answer"].split(';')] if ';' in q["Answer"] else q["Answer"]
	layouts = [x.strip() for x in q["Layouts"].split(';')] if ';' in q["Layouts"] else q["Layouts"]
	q_ = {
	'question': q["Question"],
	'type': q["Type"],
	'choices': choices,
	'answer': answer,
	'graph': {'resource': q["Data set"], 'layouts': layouts} 
	}
	if q["Layouts"] == "-":
		del q_['graph']['layouts']
	if q["Data set"] == "-":
		del q_['graph']
	if q["Type"] == "text" or q["Type"] == "select":
		del q_['choices']

	print(yaml.dump(q_))
	with open(str(i+1)+'.yaml', 'w') as outfile:
		yaml.dump(q_, outfile)