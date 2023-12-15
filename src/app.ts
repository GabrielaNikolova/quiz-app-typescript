import { getFunction } from './utils/universalModule';
import { encryptData, decryptQuestions, decryptAnswers } from './utils/dataEncryption';

const categoriesList = document.getElementById('category') as Select;
const quizFilterContainer = document.getElementById('filter-container') as HtmlElement;
const quizFilterForm = document.getElementById('filter') as Form;
// const startQuiz = document.getElementById('start-quiz') as Button;
const questionContainer = document.getElementById('q-container') as HtmlElement;
const questionTitle = document.getElementById('question') as Heading;
const answersList = document.getElementById('answers-list') as UnorderedList;
const nextQ = document.getElementById('nextq') as Button;
const checkRes = document.getElementById('check') as Button;
const results = document.getElementById('results') as HtmlElement;

let i: number = 0;
let allQuestions: Question[];
let selectedAnswers: string[] = [];
let correct: string = '';

//function to fetch all categories from the API
async function getCategories() {
    try {
        const endpoint = 'api_category.php';

        const categories = await getFunction(endpoint);

        if ('trivia_categories' in categories) {
            categories as Categories;

            categories.trivia_categories.forEach((c: Category) => {
                const category = document.createElement('option');
                category.setAttribute('value', c.id);
                category.textContent = c.name;
                categoriesList?.appendChild(category);
            });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
getCategories();

// function for creating the endpoint according to user input
function createEndpoint() {
    const amount = (document.getElementById('amount') as Input)?.value;
    let category = categoriesList?.value;
    let difficulty = (document.getElementById('difficulty') as Options)?.value;

    category === 'any' ? (category = '') : (category = `&category=${category}`);

    difficulty === 'any' ? (difficulty = '') : (difficulty = `&difficulty=${difficulty}`);

    return `api.php?amount=${amount}${category}${difficulty}&type=multiple`;
}

// function for generation of the quiz based on user input
function generateQuiz() {
    quizFilterForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const endpoint = createEndpoint();

        // function for fetching the data
        try {
            const questions = await getFunction(endpoint);
            if ('results' in questions) {
                questions as Data;
                allQuestions = questions.results;

                // set item to local storage
                encryptData('questions-list', allQuestions);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        startQuiz();
    });
}

function startQuiz() {
    if (quizFilterContainer && quizFilterForm && nextQ) {
        quizFilterContainer.style.display = 'none';
        quizFilterForm.style.display = 'none';
        nextQ.style.display = '';
    }

    displayQuestion(allQuestions);

    i++;
}

// function for displaying the questions one by one
function displayQuestion(allQuestions: Array<Question> | '') {
    if (Array.isArray(allQuestions)) {
        if (questionContainer && nextQ && questionTitle) {
            questionContainer.style.display = '';
            nextQ.className = 'button nextq';
            questionTitle.innerHTML = allQuestions[i].question;
        }

        correct = allQuestions[i].correct_answer;
        const incorrectAnswers = allQuestions[i].incorrect_answers;
        const options = incorrectAnswers;
        options.splice(Math.floor(Math.random() * (incorrectAnswers.length + 1)), 0, correct);

        if (answersList) {
            answersList.innerHTML = ''; // Clear previous answers
        }

        options.forEach((option) => {
            const li = document.createElement('li');
            li.className = 'radio-btn';
            const label = document.createElement('label');
            label.className = 'answer';
            label.innerHTML = `<input class="radio" type="radio" name="answer"> ${option}`;
            li.appendChild(label);
            answersList?.appendChild(li);
        });
    }
}

//function for checking if there is a selected answer
function checkIfSelected(variable: Question[] | '', displayOrCheckFnc: (variable: Question[] | '') => void) {
    const checkedOption = document.querySelector('input[name = "answer"]:checked') as Input;

    if (checkedOption) {
        document.getElementById('alert')?.remove();

        //save answers to localStorage
        if (checkedOption?.parentNode?.textContent) {
            selectedAnswers.push(checkedOption.parentNode.textContent.trim());
        }

        encryptData('answers', selectedAnswers);

        displayOrCheckFnc(variable);
    } else {
        const p = document.createElement('p');
        p.id = 'alert';
        p.textContent = `Please select an Answer!`;
        questionContainer?.appendChild(p);
        i--;
    }
}

// function for changing the question
nextQ?.addEventListener('click', (e) => {
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

checkRes?.addEventListener('click', (e) => {
    e.preventDefault();

    checkIfSelected('', checkResult);
});

// check results function
function checkResult() {
    let rightAns = 0;

    // get data from localStorage
    const questionsCorrectAnswers = decryptQuestions('questions-list');
    questionsCorrectAnswers.forEach((q) => {
        const question = {
            title: HTMLDecode(q.question),
            correctAnswer: HTMLDecode(q.correct_answer),
        };
        return question;
    });
    const answered = decryptAnswers('answers');

    questionsCorrectAnswers as QCorrectAns[];
    questionsCorrectAnswers.forEach((a: QCorrectAns) => {
        if (answered.includes(a.correct_answer)) {
            rightAns++;
        }
    });

    displayResults(rightAns, questionsCorrectAnswers, answered);
}

// display results function
function displayResults(rightAns: number, questionsCorrectAnswers: QCorrectAns[], answered: string[]) {
    if (questionContainer) {
        questionContainer.style.display = 'none';
    }
    if (results) {
        results.style.display = '';
    }

    const div = document.createElement('div');
    div.className = 'result-buttons';

    const newGameBtn = document.createElement('button');
    newGameBtn.className = 'new-game button';
    newGameBtn.id = 'new-game';
    newGameBtn.textContent = 'New Game!';

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download button';
    downloadBtn.id = 'download';
    downloadBtn.textContent = 'Download Results';

    const text = questionsCorrectAnswers.map((el: QCorrectAns, index: number) => {
        const i: number = index;
        return `- ${el.question}<br/>Correct answer: ${el.correct_answer}<br/>Your answer: ${answered[i]}<br/><br/>`;
    });

    const resultsSummary = document.createElement('p');
    resultsSummary.className = 'result';
    resultsSummary.innerHTML = `Your score is ${rightAns} correct answer/s out of ${answered.length
        } questions!<br/><br/>${text.join('')}`;

    div?.appendChild(newGameBtn);
    div?.appendChild(downloadBtn);
    results?.appendChild(div);
    results?.appendChild(resultsSummary);

    //download results feedback
    downloadZipFile(downloadBtn, resultsSummary);

    resetQuiz(newGameBtn);
}

// function for download of the result in txt file
function downloadZipFile(downloadBtn: Button, resultsSummary: HTMLParagraphElement | undefined) {
    const worker = new Worker(new URL('/src/utils/worker.ts', import.meta.url));

    downloadBtn?.addEventListener('click', () => {
        worker.onmessage = (e) => {
            const blob = e.data;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'QuizResult.zip';
            link.click();
        };

        const feedback = resultsSummary?.innerText.toString();

        worker.postMessage({ feedback });
    });
}

// function for reseting the game
function resetQuiz(newGameBtn: Button) {
    newGameBtn?.addEventListener('click', () => {
        i = 0;
        selectedAnswers = [];

        if (
            quizFilterContainer &&
            quizFilterForm &&
            questionTitle &&
            answersList &&
            questionContainer &&
            checkRes &&
            results
        ) {
            quizFilterContainer.style.display = '';
            quizFilterForm.style.display = '';
            questionTitle.textContent = '';
            answersList.innerHTML = '';
            checkRes.style.display = 'none';
            results.innerHTML = '';
            results.style.display = 'none';
            localStorage.removeItem('answers');
            localStorage.removeItem('questions-list');
        }
    });
}

// function to convert html text into normal text
function HTMLDecode(textString: string) {
    const doc = new DOMParser().parseFromString(textString, 'text/html');
    return doc.documentElement.textContent;
}

generateQuiz();
