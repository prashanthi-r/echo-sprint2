// all exports from main will now be available as main.X
import { initWhenLoad, g_have_load_file, prepareClick, handleMode, genResultHtml, setMode, } from "./main.js";
import userEvent from "@testing-library/user-event";
import { screen, } from "@testing-library/dom";
// adds special assertions like toHaveTextContent
import "@testing-library/jest-dom";
test("genResultHtml", function () {
    setMode(0);
    expect(genResultHtml("11", "22")).toBe("22");
});
test("genResultHtml", function () {
    setMode(0);
    handleMode();
    expect(genResultHtml("11", "22")).toBe("<div>Command:11</div><div>Output:</div><div>22</div>");
});
var inputEle;
var historyEle;
var submitButton;
beforeEach(function () {
    document.body.innerHTML = getExampleDOM();
    prepareClick();
    initWhenLoad();
    inputEle = screen.getByTestId("entercmd");
    historyEle = screen.getByTestId("repl_history");
    submitButton = screen.getByTestId("submit_btn");
});
// always calls this first
function getExampleDOM() {
    return "<div class=\"repl\">\n    <!-- Prepare a region of the page to hold the command history -->\n    <div class=\"repl-history\" data-testid=\"repl_history\" id=\"repl_history\"></div>\n    <hr />\n    <!-- Prepare a region of the page to hold the command input box -->\n    <div class=\"repl-input\">\n    <label for=\"entercmd\">entercmd</label>\n      <input\n        id=\"entercmd\"\n        data-testid=\"entercmd\"\n        type=\"text\"\n        class=\"repl-command-box\"\n        placeholder=\"Enter command here!\"\n      />\n      <label for=\"submit_btn\">submit_btn</label>\n      <button id=\"submit_btn\" class=\"btn btn-primary\" data-testid=\"submit_btn\" >Submit</button>\n    </div></div>\n    ";
}
test("listens to keypress", function () {
    // const command = container.getEle
    setMode(0);
    userEvent.type(inputEle, "something");
    expect(inputEle.value).toBe("something");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toBe("Please enter a valid command!");
});
test("test mode to brief", function () {
    setMode(1);
    userEvent.type(inputEle, "mode");
    expect(inputEle.value).toBe("mode");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toBe("Switched to brief output mode.");
});
test("test mode to verbose", function () {
    setMode(0);
    userEvent.type(inputEle, "mode");
    expect(inputEle.value).toBe("mode");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toBe("<div>Command:mode</div><div>Output:</div><div>Switched to verbose output mode.</div>");
});
test("dom test for loaded file for correct filename", function () {
    setMode(0);
    userEvent.type(inputEle, "load_file student.csv");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toBe(g_have_load_file + " loaded.");
});
test("dom test when incorrect filename is loaded", function () {
    setMode(0);
    userEvent.type(inputEle, "load_file incorrect_filename");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toBe("[Error]File path is invalid.");
});
test("dom test view when filename is loaded", function () {
    setMode(0);
    userEvent.type(inputEle, "load_file student.csv");
    userEvent.click(submitButton);
    historyEle.innerHTML = "";
    userEvent.type(inputEle, "view");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toBe("<div><table><tbody><tr><td>name</td><td>age</td></tr><tr><td>lucy</td><td>23</td></tr><tr><td>jack</td><td>24</td></tr></tbody></table></div>");
});
test("dom test view when filename is not loaded", function () {
    setMode(0);
    historyEle.innerHTML = "";
    userEvent.type(inputEle, "view");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toBe("[Error]file not loaded.");
});
test("dom test search when filename is not loaded", function () {
    setMode(0);
    historyEle.innerHTML = "";
    userEvent.type(inputEle, "search 1 lucy");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toBe("[Error]file not loaded.");
});
test("dom test search by column index or column name, file not loaded.", function () {
    setMode(0);
    historyEle.innerHTML = "";
    userEvent.type(inputEle, "search 1 lucy");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toBe("[Error]file not loaded.");
});
test("dom test search by column index", function () {
    setMode(0);
    userEvent.type(inputEle, "load_file student.csv");
    userEvent.click(submitButton);
    historyEle.innerHTML = "";
    userEvent.type(inputEle, "search 0 lucy");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toBe('<div style="color:red"><table><tbody><tr><td>lucy</td><td>23</td></tr></tbody></table></div>');
});
test("dom test search by column name", function () {
    setMode(0);
    userEvent.type(inputEle, "load_file student.csv");
    userEvent.click(submitButton);
    historyEle.innerHTML = "";
    userEvent.type(inputEle, "search name lucy");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toBe('<div style="color:red"><table><tbody><tr><td>lucy</td><td>23</td></tr></tbody></table></div>');
});
test("dom test search by column name,no mock data", function () {
    setMode(0);
    userEvent.type(inputEle, "load_file student.csv");
    userEvent.click(submitButton);
    historyEle.innerHTML = "";
    userEvent.type(inputEle, "search name lili");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toContain("[ERROR]no mock data");
});
test("dom test search by column name,invalid column name or column index", function () {
    setMode(0);
    userEvent.type(inputEle, "load_file student.csv");
    userEvent.click(submitButton);
    historyEle.innerHTML = "";
    userEvent.type(inputEle, "search aaa lili");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toContain("[Error]columnIndex or columnName not found.");
});
test("dom test search by expression,no mock data", function () {
    setMode(0);
    userEvent.type(inputEle, "load_file student.csv");
    userEvent.click(submitButton);
    historyEle.innerHTML = "";
    userEvent.type(inputEle, "search column name contains lili");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toContain("[ERROR]no mock data");
});
test("dom test and query search by column name", function () {
    setMode(0);
    userEvent.type(inputEle, "load_file student.csv");
    userEvent.click(submitButton);
    historyEle.innerHTML = "";
    userEvent.type(inputEle, "search or(column 1 contains lucy,column name contains jack)");
    userEvent.click(submitButton);
    expect(historyEle.firstElementChild.innerHTML).toBe('<div style="color:red"><table><tbody><tr><td>lucy</td><td>23</td></tr><tr><td>jack</td><td>24</td></tr></tbody></table></div>');
});
