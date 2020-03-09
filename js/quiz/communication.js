function getQuiz(quizRequest, callback) {
  $.post({
    url: "api/get_quiz",
    data: JSON.stringify(quizRequest),
    contentType: 'application/json',
    success: function(r) {
      let quiz = JSON.parse(r);
      callback(quiz);
    },
    error: function(r) { console.log(r); }
  });
}


/**
 * Sends an answer to the backend for the current question and loads the next question or forwards to submitted page
 * @param quiz the current quiz object
 * @param answer the answer object (types.js) containing the users answer to the question
 * @param currentQuestion the current question number
 */
function sendAnswer(quiz, answer, currentQuestion) {
  $.post({
    url: "api/submit_answer",
    data: JSON.stringify(answer.createRequest()),
    contentType: 'application/json',
    success: function(r) {
      if(currentQuestion + 1 === quiz.questions.length)
      {
        window.location.replace("/submitted");
      }
      else
      {
        printQuestion(quiz, currentQuestion+1);
      }
    },
    error: function(r) { handleError(r) }
  });
}


/**
 * Handles the error in communication
 * @param errorObject the error object
 */
function handleError(errorObject)
{
  //todo implement a proper error handler

  // alert("Your session is expired, please refresh this page.");
  $('.alert').show();
}