import { getFunction } from "./universalModule.js";

type Input = HTMLInputElement | undefined;
type Options = HTMLOptionElement | undefined;
type Element = HTMLHtmlElement | undefined;
type Button = HTMLButtonElement | undefined;
type Form = HTMLFormElement | undefined;

const categoriesList = document.getElementById("category") as HTMLSelectElement | undefined;
const quizFilterForm = document.getElementById("filter") as Form;
const startQuiz = document.getElementById("start-quiz") as Button;
const nextQ = document.getElementById("nextq") as Button;
const questionContainer = document.getElementById("q-container") as Element;
const questionTitle = document.getElementById("question") as HTMLHeadingElement | undefined;
const answersList = document.getElementById("answers-list") as HTMLUListElement | undefined;
const checkRes = document.getElementById("check") as Button;
const results = document.getElementById("results") as Element;

let i: number = 0;
let allQuestions: Array<Question>;
let selectedAnswers: Array<string> = [];
let correct: string = "";


//function to fetch all categories from the API
async function getCategories() {
    try {
        const endpoint = "api_category.php"
        let categories = await getFunction(endpoint);
        if ('trivia_categories' in categories) {
            categories as Categories;

            categories.trivia_categories.map((c: Category) => {
                let category = document.createElement("option");
                category.setAttribute('value', c.id);
                category.textContent = c.name;
                categoriesList?.appendChild(category);
            });
            console.log(categoriesList);

        }

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
getCategories();

// function for creating the endpoint according to user input
function createEndpoint() {

    let amount = (document.getElementById("amount") as Input)?.value;
    console.log(amount);
    let category = categoriesList?.value;
    console.log(category);
    let difficulty = (document.getElementById("difficulty") as Options)?.value;
    console.log(difficulty);

    if (category === "any") {
        category = "";
    } else {
        category = `&category=${category}`;
    }

    if (difficulty === "any") {
        difficulty = "";
    } else {
        difficulty = `&difficulty=${difficulty}`;
    }

    return `api.php?amount=${amount}${category}${difficulty}&type=multiple`;
}


// function for generation of the quiz based on user input
function generateQuiz() {
    if (questionContainer && results) {
        questionContainer.style.display = 'none';
        results.style.display = 'none';
    }

    quizFilterForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        let endpoint = createEndpoint();

        // function for fetching the data
        try {
            const questions = await getFunction(endpoint);
            if ('results' in questions) {
                questions as Data;
                allQuestions = questions.results;

                // set item to local storage
                localStorage.setItem("questions-list", JSON.stringify(allQuestions));

                console.log(allQuestions);
            }

            if (startQuiz) {
                startQuiz.style.display = '';
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    });
}

// function for starting the quiz
startQuiz?.addEventListener("click", (e) => {
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
function displayQuestion(allQuestions: Array<Question> | "") {
    if (Array.isArray(allQuestions)) {
        if (questionContainer && nextQ && questionTitle) {
            questionContainer.style.display = '';
            nextQ.className = "button nextq";
            questionTitle.innerHTML = allQuestions[i].question;
        }

        correct = allQuestions[i].correct_answer;
        let incorrectAnswer = allQuestions[i].incorrect_answers;
        let options = incorrectAnswer;
        options.splice(Math.floor(Math.random() * (incorrectAnswer.length + 1)), 0, correct);
        console.log(options);

        if (answersList) {
            answersList.innerHTML = ""; // Clear previous answers
        }

        options.map((option, index) => {
            const li = document.createElement("li");
            li.className = "radio-btn";
            const label = document.createElement("label");
            label.className = "answer";
            label.innerHTML = `<input class="radio" type="radio" name="answer" value="${index + 1}"> ${option}`;
            li.appendChild(label);
            answersList?.appendChild(li);
        });
    }
}

//function for checking if there is a selected answer
function checkIfSelected(variable: Array<Question> | "", func1: (variable: Array<Question> | "") => void) {

    let checked = document.querySelector('input[name = "answer"]:checked') as HTMLInputElement | undefined;

    if (checked) {
        //Test if something was checked
        const alert = document.getElementById("alert");
        if (alert) {
            alert.remove();
        }
        
        //save answers to localStorage
        if (checked?.parentNode?.textContent) {
            selectedAnswers.push(checked.parentNode.textContent.trim());
        }
        localStorage.setItem("answers", JSON.stringify(Array.from(selectedAnswers)));


        func1(variable);
    } else {
        const p = document.createElement("p");
        p.id = "alert";
        p.textContent = `Please select an Answer!`;
        questionContainer?.appendChild(p);
        i--;
    }
}

// function for changing the question
nextQ?.addEventListener("click", (e) => {
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

checkRes?.addEventListener("click", (e) => {
    e.preventDefault();

    checkIfSelected("", checkResult);
});

// check results function
function checkResult() {
    let count = 0;
    let rightAns = 0;

    // get data from localStorage
    let questionsCorrectAnswers: Array<QCorrectAns> = JSON.parse(
        localStorage.getItem("questions-list") || "").map((q: Question) => {
            let question = {
                question: HTMLDecode(q.question),
                correct_answer: HTMLDecode(q.correct_answer)
            }
            return question;
        });
    let answered: Array<string> = JSON.parse(localStorage.getItem("answers") || "");

    // compare data
    questionsCorrectAnswers.forEach((a: QCorrectAns) => {
        count++;
        if (answered.includes(a.correct_answer)) {
            rightAns++;
        }
    });

    // display results
    displayResults(rightAns, count, questionsCorrectAnswers, answered);
}

// display results function
function displayResults(rightAns: number, count: number, questionsCorrectAnswers: QCorrectAns[], answered: string[]) {
    if (questionContainer) {
        questionContainer.style.display = "none";
    }
    if (results) {
        results.style.display = '';
    }

    const div = document.createElement("div");
    div.className = "result-buttons";

    const newGameBtn = document.createElement("button");
    newGameBtn.className = "new-game button";
    newGameBtn.id = "new-game";
    newGameBtn.textContent = "New Game!";

    const text = questionsCorrectAnswers.map((el: QCorrectAns, index: number) => {
        let i: number = index;
        return `- ${el.question}<br>Correct answer: ${el.correct_answer}<br>Your answer: ${answered[i]}<br><br>`;

    });

    const p = document.createElement("p");
    p.className = "result";
    p.innerHTML = `Your score is ${rightAns} correct answer/s out of ${count} questions!<br><br>${text.join('')}`;


    div.appendChild(newGameBtn);
    results?.appendChild(div);
    results?.appendChild(p);


    // reset game
    resetQuiz(newGameBtn);
}

// function for reseting the game
function resetQuiz(newGameBtn: Button) {
    newGameBtn?.addEventListener("click", () => {
        i = 0;
        selectedAnswers = [];

        if (
            quizFilterForm &&
            questionTitle &&
            answersList &&
            questionContainer &&
            checkRes &&
            results
        ) {
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
function HTMLDecode(textString: string) {
    let doc = new DOMParser().parseFromString(textString, "text/html");
    return doc.documentElement.textContent;
}

generateQuiz();