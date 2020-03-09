
let questionInputs = '<input id="${this.aId}" name="question${this.qNum}" type="${this.qType}" label="${this.qOption}">&#9; ${this.qOption}<br>';
// let textArea = '<textarea id="${this.qNum}" style="width:100%;" rows="6" placeholder="${this.qPlaceholder}"></textarea>';
let textArea = '<textarea id="${this.qNum}" style="width:100%;" rows="6" placeholder="Briefly state your answer and explain your decision."></textarea>';
let selectHint = '<i class="hint">To answer this question, select the corresponding node in the graph and press next</i>';


function fillTemplate(templateString, templateVars)
{
  return new Function("return `"+templateString +"`;").call(templateVars);
}




let questionnaireRow = '<div class="row question rounded ${this.class}" align="center">' +
  '    <div class="col-md-8" align="left">' +
  '      ${this.question}' +
  '    </div>' +
  '    <div class="col-md-1">' +
  '      <input type="radio" name="radio" value="1">' +
  '    </div>' +
  '    <div class="col-md-1">' +
  '      <input type="radio" name="radio" value="2">' +
  '    </div>' +
  '    <div class="col-md-1">' +
  '      <input type="radio" name="radio" value="3">' +
  '    </div>' +
  '    <div class="col-md-1">' +
  '      <input type="radio" name="radio" value="4">' +
  '    </div>' +
  '  </div>';