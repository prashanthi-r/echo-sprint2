// The window.onload callback is invoked when the window is first loaded by the browser
window.onload = () => {
  prepareKeypress();
  prepareClick();
};

// whenever a key is pressed, register event and invokes handleKeypress
function prepareKeypress() {
  // As far as TypeScript knows, there may be *many* elements with this class.
  const maybeInputs: HTMLCollectionOf<Element> =
    document.getElementsByClassName("repl-command-box");
  // Assumption: there's only one thing
  const maybeInput: Element | null = maybeInputs.item(0);
  // Is the thing there? Is it of the expected type?
  //  (Remember that the HTML author is free to assign the repl-input class to anything :-) )
  if (maybeInput == null) {
    console.log("Couldn't find input element");
  } else if (!(maybeInput instanceof HTMLInputElement)) {
    console.log(`Found element ${maybeInput}, but it wasn't an input`);
  } else {
    maybeInput.addEventListener("keypress", handleKeypress);
  }
}

/* if the "Enter" key is clicked, proceed to invoke the same function 
 that would be invoked if the user clicks the "submit" button 
   else, return nothing
*/
function handleKeypress(event: KeyboardEvent) {
  // The event has more fields than just the key pressed (e.g., Alt, Ctrl, etc.)

  if (event.key != "Enter") {
    return;
  }

  let mouseEvent: MouseEvent = new MouseEvent("keypress");
  return handleClick(mouseEvent);
}

// whenever the user clicks the "Submit button", register the event and invoke the handleClick method
function prepareClick() {
  // As far as TypeScript knows, there may be *many* elements with this class.
  const maybeButtons: HTMLCollectionOf<Element> =
    document.getElementsByClassName("btn btn-primary");
  // Assumption: there's only one thing
  const maybeButton: Element | null = maybeButtons.item(0);
  // Is the thing there? Is it of the expected type?
  //  (Remember that the HTML author is free to assign the repl-input class to anything :-) )
  if (maybeButton == null) {
    console.log("Couldn't find input element");
  } else if (!(maybeButton instanceof HTMLButtonElement)) {
    console.log(`Found element ${maybeButton}, but it wasn't an input`);
  } else {
    maybeButton.addEventListener("click", handleClick);
  }
}

// brief and verbose flags to set/unset the state
const BRIEF = 0;
const VERBOSE = 1;
var BorV = BRIEF; // variable that stores the state (mode)

// method to set the mode to brief/verbose
function setMode(mode: number) {
  BorV = mode;
}

// initialize the webapp
function initWhenLoad() {
  setMode(BRIEF);
  g_have_load_file = "";
}

// method that returns the result of the command with respect to the current mode
function genResultHtml(cmd: string, htmlTxt: string) {
  if (BorV === BRIEF) {
    return htmlTxt;
  } else {
    return (
      "<div>Command:" +
      cmd +
      "</div><div>Output:</div><div>" +
      htmlTxt +
      "</div>"
    );
  }
}

import { Server } from "http";
import { csvFileData } from "./mockedJson.js";

// method to handle simple search queries with mocked data
function simpleSearchWithMock(columnIndexOrName: string, searchValue: string) {
  if (g_have_load_file === "") {
    return "[Error]file not loaded.";
  }

  const headNames: string[] = new Map(
    Object.entries(csvFileData.fileContent)
  ).get(g_have_load_file)![0];
  const headLen = headNames.length;
  for (let i = 0; i < headLen; i++) {
    headNames.push(i.toString());
  }
  if (headNames.indexOf(columnIndexOrName) === -1) {
    return "[Error]columnIndex or columnName not found.";
  }

  if (g_have_load_file === "student.csv") {
    if (
      (columnIndexOrName === "0" || columnIndexOrName === "name") &&
      searchValue === "lucy"
    ) {
      const data: string[][] = [["lucy", "23"]];
      return (
        "<div style='color:red'>" + buildTableHtmlBy2dArray(data) + "</div>"
      );
    } else {
      return "[ERROR]no mock data,try:<br/>search 0 lucy<br/>search name lucy";
    }
  } else if (g_have_load_file === "grade.csv") {
    if (
      (columnIndexOrName === "1" || columnIndexOrName === "class") &&
      searchValue === "computer"
    ) {
      const data: string[][] = [["lucy", "computer", "80"]];
      return (
        "<div style='color:red'>" + buildTableHtmlBy2dArray(data) + "</div>"
      );
    } else {
      return "[ERROR]no mock data,try:<br/>search 1 computer<br/>search class computer";
    }
  } else {
    return "[Error]file not loaded.";
  }
}

// method to handle complex queries (with and, not, and or expressions) with mocked data

//and(column 1 contains lucy,column age contains 23)
//or(column 1 contains lucy,column name contains jack)
//and(column name contains lucy,column class contains computer)
//not(column class contains computer)

function expressionSearchWithMock(expression: string) {
  if (g_have_load_file === "student.csv") {
    if (expression === "and(column 1 contains lucy,column age contains 23)") {
      const data: string[][] = [["lucy", "23"]];
      const res =
        "<div style='color:red'>" + buildTableHtmlBy2dArray(data) + "</div>";
      console.log(res);
      return res;
    } else if (
      expression === "or(column 1 contains lucy,column name contains jack)"
    ) {
      const data: string[][] = [
        ["lucy", "23"],
        ["jack", "24"],
      ];
      const res =
        "<div style='color:red'>" + buildTableHtmlBy2dArray(data) + "</div>";
      console.log(res);
      return res;
    } else {
      return "[ERROR]no mock data,try:<br/>and(column 1 contains lucy,column age contains 23)";
    }
  } else if (g_have_load_file === "grade.csv") {
    if (
      expression ===
      "and(column name contains lucy,column class contains computer)"
    ) {
      const data: string[][] = [["lucy", "computer", "80"]];
      const res =
        "<div style='color:red'>" + buildTableHtmlBy2dArray(data) + "</div>";
      console.log(res);
      return res;
    } else if (expression === "not(column class contains computer)") {
      const data: string[][] = [["lucy", "math", "100"]];
      const res =
        "<div style='color:red'>" + buildTableHtmlBy2dArray(data) + "</div>";
      console.log(res);
      return res;
    } else {
      return "[ERROR]no mock data,try:<br/>and(column name contains lucy,column class contains computer)";
    }
  } else {
    return "[Error]file not loaded.";
  }
}

// method that is invoked when a user enters a search command
function handleSearch(expr: string) {
  console.log("expr:", expr);
  const simpleSearchRegex: RegExp =
    /^\s{0,}[a-zA-Z0-9_-]{1,}\s{1,}[a-zA-Z0-9_-]{1,}\s{0,}$/;
  if (g_have_load_file === "") {
    return "[Error]file not loaded.";
  } else if (simpleSearchRegex.test(expr)) {
    //search columnIndex|columnName value
    console.log("search columnIndex|columnName value");
    var strArr = expr.trim().split(/\s+/);
    return simpleSearchWithMock(strArr[0], strArr[1]);
  } else {
    // and or not expression  and(column starName contains zhangsan,column starName contains zhangsan)
    console.log("search with expression");
    return expressionSearchWithMock(expr);
  }
}

var g_have_load_file: string = ""; // variable to set the currently loaded file

// method that handles load_file commands
function handleLoadFile(fileName: string): string {
  console.log("loadFile", fileName);
  console.log("file names:", csvFileData.fileNames);

  if (csvFileData.fileNames.indexOf(fileName) > -1) {
    console.log("found", fileName);
    g_have_load_file = fileName;
    return fileName + " loaded.";
  } else {
    //file does not exist
    console.log("not found", fileName);
    return "[Error]File path is invalid.";
  }
}

// method to build a html table given a 2d string array
function buildTableHtmlBy2dArray(data: string[][]): string {
  const table = document.createElement("table");

  // Create table header
  // const headerRow = table.insertRow();
  // for (let i = 0; i < data[0].length; i++) {
  //   const header = headerRow.insertCell();
  //   header.innerHTML = "Column " + (i + 1);
  // }

  // Create table rows from data
  for (let i = 0; i < data.length; i++) {
    const row = table.insertRow();
    for (let j = 0; j < data[i].length; j++) {
      const cell = row.insertCell();
      cell.innerHTML = data[i][j];
    }
  }
  return table.outerHTML;
}

// method to handle the view command
function handleView() {
  if (g_have_load_file === "") {
    // if
    return "[Error]file not loaded.";
  } else {
    const data: string[][] = new Map(
      Object.entries(csvFileData.fileContent)
    ).get(g_have_load_file)!;
    return "<div>" + buildTableHtmlBy2dArray(data) + "</div>";
  }
}

// method to append the result of every query to history
function appendHtmlToHistory(htmlTxt: string) {
  const historyEles: HTMLCollectionOf<Element> =
    document.getElementsByClassName("repl-history");
  // Assumption: there's only one thing
  const historyEle: Element | null = historyEles.item(0);
  // Is the thing there? Is it of the expected type?
  //  (Remember that the HTML author is free to assign the repl-input class to anything :-) )
  if (historyEle == null) {
    console.log("Couldn't find input element");
  } else if (!(historyEle instanceof HTMLInputElement)) {
    console.log(`Found element ${historyEle}, but it wasn't an input`);
  }
  historyEle!.innerHTML += "<div>" + htmlTxt + "</div><hr/>";
}

// method to handle the switching between the modes (similar to setMode())
function handleMode() {
  if (BorV == BRIEF) {
    BorV = VERBOSE;
    return "Switched to verbose output mode.";
  } else {
    BorV = BRIEF;
    return "Switched to brief output mode.";
  }
}

// method to handle the clicking of the "Submit" button with if conditions for valid commands and print the "help" output otherwise
function handleClick(event: MouseEvent) {
  // The event has more fields than just the key pressed (e.g., Alt, Ctrl, etc.)
  const inputElement: HTMLElement = document.getElementById("entercmd")!;

  var inputValue: string = (<HTMLInputElement>inputElement).value;

  if (inputValue == "") {
    return;
  }

  var res: string;
  var resDiv: string;
  if (inputValue === "mode") {
    res = handleMode();
  } else if (inputValue.startsWith("load_file")) {
    var fileName: string = inputValue.split(" ")[1];
    res = handleLoadFile(fileName);
  } else if (inputValue.startsWith("search")) {
    var fileName: string = inputValue.split(" ")[1];
    var expression: string = inputValue.substring(
      "search ".length,
      inputValue.length
    );
    res = handleSearch(expression);
  } else if (inputValue === "view") {
    res = handleView();
  } else if (inputValue === "help") {
    res =
      "e.g:<br/>" +
      "mode<br/>" +
      "load_file student.csv<br/>" +
      "load_file grade.csv<br/>" +
      "view<br/>" +
      "search 0 lucy<br/>" +
      "search name lucy<br/>" +
      "search and(column 1 contains lucy,column age contains 23)<br/>" +
      "search or(column 1 contains lucy,column name contains jack)<br/>" +
      "search and(column name contains lucy,column class contains computer)<br/>" +
      "search not(column class contains computer)<br/>";
  } else {
    console.log(`Command entered: ${inputValue}`);
    res = "Please enter a valid command!";
  }

  console.log("result:", res);
  resDiv = genResultHtml(inputValue, res);
  appendHtmlToHistory(resDiv);

  (<HTMLInputElement>inputElement).value = "";
}

// Provide this to other modules (e.g., for testing!)
export {
  handleKeypress,
  prepareKeypress,
  handleClick,
  prepareClick,
  genResultHtml,
  handleMode,
  setMode,
  handleSearch,
  handleLoadFile,
  g_have_load_file,
  initWhenLoad,
};
