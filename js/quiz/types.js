const QUESTION_TYPE = {
  SINGLE: 'radio',
  MULTI: 'checkbox',
  TEXT: 'text',
  SELECT: 'node'
};



function Answer(user, quizId, questionNum, submission, questionText, meta)
{
  this.user = user;
  this.quizId = quizId;
  this.questionNum = questionNum;
  this.questionText = questionText;
  this.submission = submission;
  this.meta = meta;
  this.createRequest = function()
  {
    return {
      "username": this.user,
      "quiz_id": this.quizId,
      "question_number": this.questionNum,
      "question_text": this.questionText,
      "submission": this.submission,
      "metadata": this.meta
    }
  }
}

function GraphSettings(jsonObject)
{
  this.interactions = jsonObject.interactions;
  this.layouts = jsonObject.layouts;
  this.layouts = this.layouts.map(x => x in LAYOUTS ? x : EXTRA_LAYOUT);
  this.resource = jsonObject.resource;
}

function Question(jsonObject)
{
  this.text = jsonObject.text;
  this.options = jsonObject.options;
  this.type = jsonObject.type;
  this.graph = jsonObject.graph === undefined ? null : new GraphSettings(jsonObject.graph);
  this.placeholder = jsonObject.placeholder === undefined ? null : jsonObject.placeholder;
  this.hasGraph = this.graph !== null;
}