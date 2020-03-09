# Quiz Setup
The quiz needs to be set up properly.
Questions have to reside under '/questions' and need to be YAML (https://yaml.org/) files containing a single question each,
and are named by the question number (eg: 1.yaml, 2.yaml, ...).

## Question format

### Question

This is the text of the question.

Examples:

```
question: "What is three plus two"?
```

```
question: >
  What is the sum of the second-smallest prime number and the smallest prime number?
```

### Type

This is the type of response to this question.

Options:

- `single` denotes a multiple-choice question with exactly one answer.
Set the `answer` field to the value of the correct choice.

Example:
```
type: single
choices:
  - Greece
  - Slovenia
  - Italy
  - Austria
answer: Greece
```
- `multi` denotes a "select all choices that apply" question.
Here, the `answer` field is an array.

Example:
```
type: multi
choices:
  - Chicago
  - Paris
  - London
  - New York
answer:
  - Chicago
  - New York
```
- `text` denotes a free-response question.
Here the `answer` key only gives a reference answer to be shown in the report.
It is not used by GraphVisual directly.

### Graph

When including a graph in a quiz question,
two parameters can be included:

* `resource` denotes the name of the graph resource to be loaded.
* `layouts` is an array that denotes the allowable graph layouts.


#### Layouts
There are several layouts, however often it might be useful to reduce the number of possible layouts to just a few.
To do so, one can specify which layouts are allowed for this graph.
If this parameter is not present, all layouts are allowed.

### Example
Below are three full examples.

```
answer: <Reference Answer>
graph:
  layouts:
  - openord
  - yifan hu
  resource: Les Miserables
question: <Question>
type: text

```
This first example is an open text question using the Les Miserables dataset and allowing only the OpenOrd and Yifan Hu layout.

```
answer: z
choices:
- a
- z
- kqa
- a2
graph:
  resource: Cat Brain
question: <Question>
type: single
```
This second example is a single choice question that uses the Cat Brain graph and allows all layouts.
Some dummy values show that the choices can be in any order and the answer should have one of those values (and not the id).

```
answer:
- ABC
- XYZ
choices:
- ABC
- DEF
- QPR
- XYZ
question: <Question>
type: multi
```
This last example is a multiple choice question that does not use a graph.
The correct answers are specified similar to the ones in single choice questions.

For more examples, see 'tutorial.yaml'.


#### Quiz Compilation

The quiz is automatically compiled when the server is started.

There is also a script 'questionParser.py' in the 'questions' folder that takes a tab-separated file as input and generates the YAML files.
This is just a convenience tool and is not further documented.
