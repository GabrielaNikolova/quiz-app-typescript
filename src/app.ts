import { getFunction } from './utils/universalModule';
import { encryptData, decryptQuestions, decryptAnswers } from './utils/dataEncryption';

const categoriesList = document.getElementById('category') as Select;
const quizFilterContainer = document.getElementById('filter-container') as HtmlElement;
const quizFilterForm = document.getElementById('filter') as Form;
const quizInfo = document.getElementById('quiz-info') as DivElement;
const currentCategory = document.getElementById('current-category') as Paragraph;
const currentDifficulty = document.getElementById('current-difficulty') as Paragraph;
const currentQuestion = document.getElementById('current-question') as Paragraph;
const skipQuiz = document.getElementById('skip-quiz') as Button;
const questionContainer = document.getElementById('q-container') as HtmlElement;
const questionTitle = document.getElementById('question') as Heading;
const answersList = document.getElementById('answers-list') as UnorderedList;
const nextQ = document.getElementById('nextq') as Button;
const newGameBtn = document.getElementById('new-game') as Button;
const downloadBtn = document.getElementById('download') as Button;
const checkRes = document.getElementById('check') as Button;
const results = document.getElementById('results') as HtmlElement;
const resultsSummary = document.getElementById('results-text') as Paragraph;

let i: number = 0;
let allQuestions: Question[];
let selectedAnswers: string[] = [];
let correct: string = '';

//function to fetch all categories from the API
async function getCategories() {
    try {
        const categories = await getFunction<Categories>('api_category.php');

        categories.trivia_categories.forEach((c: Category) => {
            const category = document.createElement('option');
            category.setAttribute('value', c.id);
            category.textContent = c.name;
            categoriesList?.appendChild(category);
        });

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
            const questions = await getFunction<Data>(endpoint);
            allQuestions = questions.results;

            // set item to local storage
            encryptData('questions-list', allQuestions);
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

function showQuizInfo() {
    const quizData = decryptQuestions('questions-list');
    if (currentCategory && currentDifficulty && currentQuestion) {
        currentCategory.textContent = HTMLDecode(`Category: ${quizData[i].category}`);
        currentDifficulty.textContent = `Difficulty: ${quizData[i].difficulty}`;
        let currentQNumber = i + 1;
        currentQuestion.textContent = `${currentQNumber} / ${quizData.length}`;
    }
}

skipQuiz?.addEventListener('click', resetQuiz);

// function for displaying the questions one by one
function displayQuestion(allQuestions: Array<Question> | '') {
    if (Array.isArray(allQuestions)) {
        if (quizInfo && questionContainer && nextQ && questionTitle) {
            quizInfo.style.display = '';
            questionContainer.style.display = '';
            nextQ.className = 'button nextq';
            showQuizInfo();
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
        return {
            title: HTMLDecode(q.question),
            correctAnswer: HTMLDecode(q.correct_answer),
        };
    });
    const answered = decryptAnswers('answers');

    questionsCorrectAnswers as QCorrectAns[];
    questionsCorrectAnswers.forEach((a: QCorrectAns, index: number) => {
        if (answered[index] === a.correct_answer) {
            rightAns++;
        }
    });

    displayResults(rightAns, questionsCorrectAnswers, answered);
}

// display results function
function displayResults(rightAns: number, questionsCorrectAnswers: QCorrectAns[], answered: string[]) {
    if (quizInfo && questionContainer) {
        questionContainer.style.display = 'none';
        quizInfo.style.display = 'none';
    }
    if (results && resultsSummary) {
        results.style.display = '';

        const resultsText = questionsCorrectAnswers.map((el: QCorrectAns, index: number) => {
            const i: number = index;
            return `- ${el.question}<br/>Correct answer: ${el.correct_answer}<br/>Your answer: ${answered[i]}<br/><br/>`;
        });

        resultsSummary.innerHTML = `Your score is ${rightAns} correct answer/s out of ${answered.length
            } questions!<br/><br/>${resultsText.join('')}`;
    }

    //download results feedback
    downloadZipFile(downloadBtn, resultsSummary);
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
newGameBtn?.addEventListener('click', resetQuiz);
function resetQuiz(e: Event) {
    e.preventDefault();
    i = 0;
    selectedAnswers = [];

    if (
        quizFilterContainer &&
        quizFilterForm &&
        quizInfo &&
        answersList &&
        questionContainer &&
        checkRes &&
        resultsSummary &&
        results
    ) {
        quizFilterContainer.style.display = '';
        quizFilterForm.style.display = '';
        quizInfo.style.display = 'none';
        questionContainer.style.display = 'none';
        answersList.innerHTML = '';
        checkRes.style.display = 'none';
        resultsSummary.innerHTML = '';
        results.style.display = 'none';
        localStorage.removeItem('answers');
        localStorage.removeItem('questions-list');
    }
}

// function to convert html text into normal text
function HTMLDecode(textString: string) {
    const doc = new DOMParser().parseFromString(textString, 'text/html');
    return doc.documentElement.textContent;
}

generateQuiz();
