var jsEditor, htmlEditor, cssEditor;
var isMinimize = false
const localStorageSavedKey = 'SAVED_VALUES';
const localStorageCurrentKey = 'CURRENT_VALUE';

window.onload = function() {
    document.addEventListener("keydown", function(e) {
      if ((navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83) {
        e.preventDefault();
        runCode()
      }
    }, false);

    setSavedSelect();
    setTextEditors();}    

function setTextEditors () {
  jsEditor = setTextEditor('js-textarea','javascript');
  htmlEditor = setTextEditor('html-textarea','text/html');
  cssEditor = setTextEditor('css-textarea','text/css');

  jsEditor.on("change", (cm, change) => {
    editorChanged('jsValue', cm.getValue())
  });

  jsEditor.on("focus", (cm, change) => {
    onfocusEditor('js-area')
  });

  htmlEditor.on("change", (cm, change) => {
    editorChanged('htmlValue', cm.getValue())
  });

  htmlEditor.on("focus", (cm, change) => {
    onfocusEditor('html-area')
  });

  cssEditor.on("change", (cm, change) => {
    editorChanged('cssValue', cm.getValue())
  });

  cssEditor.on("focus", (cm, change) => {
    onfocusEditor('css-area')
  });

  setDefaultValues()
}

function setTextEditor (id, type) {
  return CodeMirror.fromTextArea(document.getElementById(id), {
    mode: type,
    styleActiveLine: true,
    lineNumbers: true,
    theme: 'material-darker'
  });
}

function setDefaultValues () {
  let localStorageValue = localStorage.getItem(localStorageCurrentKey);
  let savedValue = localStorageValue ? JSON.parse(localStorageValue) : {};
  let defaultHtmlExist = false

  if (savedValue.jsValue) {
    jsEditor.setValue(savedValue.jsValue)
  } else {
    jsEditor.setValue('//You can set global variables\nvar variables = {\n}')
  }

  if (savedValue.htmlValue) {
    htmlEditor.setValue(savedValue.htmlValue)
    defaultHtmlExist = true
  }

  if (savedValue.cssValue) {
    cssEditor.setValue(savedValue.cssValue)
  }

  if (defaultHtmlExist) {
    runCode()
  }
}

function setSavedSelect (list) {
  if (!list) {
    let savedValues = localStorage.getItem(localStorageSavedKey)
    list = savedValues ? JSON.parse(savedValues) : []
  }
  let select = document.getElementById('saved-select')
  select.innerHTML = '';

  var opt = document.createElement('option');
  opt.value = -1;
  opt.innerHTML = 'History';
  opt.selected = true;
  opt.disabled = true;
  opt.hidden = true;
  select.appendChild(opt);

  list.forEach(item => {
    var opt = document.createElement('option');
    opt.value = JSON.stringify(item.value);
    opt.innerHTML = item.name;
    select.appendChild(opt);
  });
}

function runCode () {
  let htmlContent = document.getElementById('html-content');
  let jsValue = jsEditor.getValue();
  let cssValue = cssEditor.getValue();
  let htmlValue = htmlEditor.getValue();
  let variables = getVariables(jsValue);

  let style = document.createElement('style');
  style.innerHTML = setValuesWithVariables(cssValue, variables);

  let script = document.createElement('script');
  script.innerHTML = jsValue;

  htmlContent.innerHTML = setValuesWithVariables(htmlValue, variables);
  htmlContent.appendChild(style);
  htmlContent.appendChild(script);
}

function setValuesWithVariables(value, variables) {
  const matched = value.match(new RegExp('\\{{.*\\}}', 'g'))
  if (matched) {
    matched.forEach(variable => {
      let cleanVariable = variable.replaceAll('{', '').replaceAll(' ', '').replaceAll('}', '')
      if (variables[cleanVariable]) {
        value = value.replace(variable, variables[cleanVariable])
      }
    });
  }

  return value;
}

function getVariables (jsValue) {
  try {
    const matched = jsValue.match(new RegExp('var.*variables.*=.*{[^}]*}', 'g'));

    if (matched && matched.length > 0) {
      return eval(matched[0].replaceAll(' ', ''));
    }
  
    return {};
  }
  catch(err) {
    alert('There is compiler error!')
  }
}

function showModal (id) {
  let modal = document.getElementById(id)
  modal.classList.add('show')
  setTimeout(() => {
    modal.classList.add('display-block')
  }, 100)
}

function hideModal (id) {
  let modal = document.getElementById(id)
  modal.classList.remove('show')
  modal.classList.remove('display-block')
} 

function save () {
  const savedName = document.getElementById('saved-name').value;
  const jsValue = jsEditor.getValue();
  const cssValue = cssEditor.getValue();
  const htmlValue = htmlEditor.getValue();

  if (!savedName || savedName == '') {
    alert('Name is required!');
    return;
  }

  if (htmlValue == '') {
    alert('Html area is empty!');
    return;
  }

  let localStorageValue = localStorage.getItem(localStorageSavedKey)
  let savedValues = localStorageValue ? JSON.parse(localStorageValue) : []

  savedValues.push({
    name: savedName,
    value: {
      jsValue: jsValue,
      cssValue: cssValue,
      htmlValue: htmlValue
    }
  })

  localStorage.setItem(localStorageSavedKey, JSON.stringify(savedValues));
  setSavedSelect(savedValues)

  hideModal('save-modal');
  document.getElementById('saved-name').value = ''

  setTimeout(() => {
    alert('Changes are saved!');
  }, 100);
}

function selectChanged () {
  let selectValue = document.getElementById('saved-select').value

  if (selectValue != -1) {
    let value = JSON.parse(selectValue)
    jsEditor.setValue(value.jsValue)
    htmlEditor.setValue(value.htmlValue)
    cssEditor.setValue(value.cssValue)

    runCode()
  }
}

function editorChanged (valueKey, value) {
  let localStorageValue = localStorage.getItem(localStorageCurrentKey);
  let savedValue = localStorageValue ? JSON.parse(localStorageValue) : {};

  savedValue[valueKey]  = value;
  localStorage.setItem(localStorageCurrentKey, JSON.stringify(savedValue))
}

function onfocusEditor (id) {
  let jsArea = document.getElementById('js-area')
  let htmlArea = document.getElementById('html-area')
  let cssArea = document.getElementById('css-area')
  let element = document.getElementById(id)

  jsArea.classList.remove('code-area-transform')
  htmlArea.classList.remove('code-area-transform')
  cssArea.classList.remove('code-area-transform')
  
  element.classList.add('code-area-transform')
}

function minimize () {
  let displayContent = document.getElementById('display-content')
  let codeContent = document.getElementById('code-content')

  if (!isMinimize) {
    displayContent.classList.remove('normal')
    displayContent.classList.add('maximize')
    codeContent.classList.remove('normal')
    codeContent.classList.add('minimize')
  } else {
    displayContent.classList.add('normal')
    displayContent.classList.remove('maximize')
    codeContent.classList.add('normal')
    codeContent.classList.remove('minimize')
  }
  
  isMinimize = !isMinimize
}