var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getFunction } from "./universalModule.js";
const categoriesList = document.getElementById("category");
const quizFilterForm = document.getElementById("filter");
const startQuiz = document.getElementById("start-quiz");
const questionContainer = document.getElementById("q-container");
const questionTitle = document.getElementById("question");
const answersList = document.getElementById("answers-list");
const nextQ = document.getElementById("nextq");
const checkRes = document.getElementById("check");
const results = document.getElementById("results");
let i = 0;
let allQuestions;
let selectedAnswers = [];
let correct = "";
//function to fetch all categories from the API
function getCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const endpoint = "api_category.php";
            let categories = yield getFunction(endpoint);
            if ('trivia_categories' in categories) {
                categories;
                categories.trivia_categories.map((c) => {
                    let category = document.createElement("option");
                    category.setAttribute('value', c.id);
                    category.textContent = c.name;
                    categoriesList === null || categoriesList === void 0 ? void 0 : categoriesList.appendChild(category);
                });
            }
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    });
}
getCategories();
// function for creating the endpoint according to user input
function createEndpoint() {
    var _a, _b;
    let amount = (_a = document.getElementById("amount")) === null || _a === void 0 ? void 0 : _a.value;
    let category = categoriesList === null || categoriesList === void 0 ? void 0 : categoriesList.value;
    let difficulty = (_b = document.getElementById("difficulty")) === null || _b === void 0 ? void 0 : _b.value;
    if (category === "any") {
        category = "";
    }
    else {
        category = `&category=${category}`;
    }
    if (difficulty === "any") {
        difficulty = "";
    }
    else {
        difficulty = `&difficulty=${difficulty}`;
    }
    return `api.php?amount=${amount}${category}${difficulty}&type=multiple`;
}
// function for generation of the quiz based on user input
function generateQuiz() {
    quizFilterForm === null || quizFilterForm === void 0 ? void 0 : quizFilterForm.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        let endpoint = createEndpoint();
        // function for fetching the data
        try {
            const questions = yield getFunction(endpoint);
            if ('results' in questions) {
                questions;
                allQuestions = questions.results;
                // set item to local storage
                localStorage.setItem("questions-list", JSON.stringify(allQuestions));
            }
            if (startQuiz) {
                startQuiz.style.display = '';
            }
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    }));
}
// function for starting the quiz
startQuiz === null || startQuiz === void 0 ? void 0 : startQuiz.addEventListener("click", (e) => {
    e.preventDefault();
    if (quizFilterForm && nextQ) {
        quizFilterForm.style.display = "none";
        nextQ.style.display = '';
    }
    startQuiz.style.display = 'none';
    displayQuestion(allQuestions);
    i++;
});
// function for displaying the questions one by one
function displayQuestion(allQuestions) {
    if (Array.isArray(allQuestions)) {
        if (questionContainer && nextQ && questionTitle) {
            questionContainer.style.display = '';
            nextQ.className = "button nextq";
            questionTitle.innerHTML = allQuestions[i].question;
        }
        correct = allQuestions[i].correct_answer;
        let incorrectAnswers = allQuestions[i].incorrect_answers;
        let options = incorrectAnswers;
        options.splice(Math.floor(Math.random() * (incorrectAnswers.length + 1)), 0, correct);
        if (answersList) {
            answersList.innerHTML = ""; // Clear previous answers
        }
        options.map((option) => {
            const li = document.createElement("li");
            li.className = "radio-btn";
            const label = document.createElement("label");
            label.className = "answer";
            label.innerHTML = `<input class="radio" type="radio" name="answer"> ${option}`;
            li.appendChild(label);
            answersList === null || answersList === void 0 ? void 0 : answersList.appendChild(li);
        });
    }
}
//function for checking if there is a selected answer
function checkIfSelected(variable, func1) {
    var _a;
    let checked = document.querySelector('input[name = "answer"]:checked');
    if (checked) {
        //Test if something was checked
        const alert = document.getElementById("alert");
        if (alert) {
            alert.remove();
        }
        //save answers to localStorage
        if ((_a = checked === null || checked === void 0 ? void 0 : checked.parentNode) === null || _a === void 0 ? void 0 : _a.textContent) {
            selectedAnswers.push(checked.parentNode.textContent.trim());
        }
        localStorage.setItem("answers", JSON.stringify(Array.from(selectedAnswers)));
        func1(variable);
    }
    else {
        const p = document.createElement("p");
        p.id = "alert";
        p.textContent = `Please select an Answer!`;
        questionContainer === null || questionContainer === void 0 ? void 0 : questionContainer.appendChild(p);
        i--;
    }
}
// function for changing the question
nextQ === null || nextQ === void 0 ? void 0 : nextQ.addEventListener("click", (e) => {
    e.preventDefault();
    checkIfSelected(allQuestions, displayQuestion);
    if (i === allQuestions.length - 1) {
        if (checkRes && nextQ) {
            checkRes.style.display = '';
            nextQ.style.display = 'none';
        }
    }
    i++;
});
checkRes === null || checkRes === void 0 ? void 0 : checkRes.addEventListener("click", (e) => {
    e.preventDefault();
    checkIfSelected("", checkResult);
});
// check results function
function checkResult() {
    let rightAns = 0;
    // get data from localStorage
    let questionsCorrectAnswers = JSON.parse(localStorage.getItem("questions-list") || "").map((q) => {
        let question = {
            question: HTMLDecode(q.question),
            correct_answer: HTMLDecode(q.correct_answer)
        };
        return question;
    });
    let answered = JSON.parse(localStorage.getItem("answers") || "");
    // compare data
    questionsCorrectAnswers.forEach((a) => {
        if (answered.includes(a.correct_answer)) {
            rightAns++;
        }
    });
    // display results
    displayResults(rightAns, questionsCorrectAnswers, answered);
}
// display results function
function displayResults(rightAns, questionsCorrectAnswers, answered) {
    if (questionContainer) {
        questionContainer.style.display = "none";
    }
    if (results) {
        results.style.display = '';
    }
    const newGameBtn = document.createElement("button");
    newGameBtn.className = "new-game button";
    newGameBtn.id = "new-game";
    newGameBtn.textContent = "New Game!";
    const text = questionsCorrectAnswers.map((el, index) => {
        let i = index;
        return `- ${el.question}<br>Correct answer: ${el.correct_answer}<br>Your answer: ${answered[i]}<br><br>`;
    });
    const p = document.createElement("p");
    p.className = "result";
    p.innerHTML = `Your score is ${rightAns} correct answer/s out of ${answered.length} questions!<br><br>${text.join('')}`;
    results === null || results === void 0 ? void 0 : results.appendChild(newGameBtn);
    results === null || results === void 0 ? void 0 : results.appendChild(p);
    // reset game
    resetQuiz(newGameBtn);
}
// function for reseting the game
function resetQuiz(newGameBtn) {
    newGameBtn === null || newGameBtn === void 0 ? void 0 : newGameBtn.addEventListener("click", () => {
        i = 0;
        selectedAnswers = [];
        if (quizFilterForm &&
            questionTitle &&
            answersList &&
            questionContainer &&
            checkRes &&
            results) {
            quizFilterForm.style.display = "";
            questionTitle.textContent = "";
            answersList.innerHTML = "";
            questionContainer.style.display = "";
            checkRes.style.display = 'none';
            results.innerHTML = "";
            localStorage.removeItem("answers");
            questionContainer.style.display = 'none';
            results.style.display = 'none';
        }
    });
}
// to convert html entities into normal text
function HTMLDecode(textString) {
    let doc = new DOMParser().parseFromString(textString, "text/html");
    return doc.documentElement.textContent;
}
generateQuiz();
