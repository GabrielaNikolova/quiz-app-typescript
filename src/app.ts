import { getFunction } from './utils/universalModule';
import { encryptData, decryptQuestions, decryptAnswers } from './utils/dataEncryption';

const quizFilterContainer = document.getElementById('filter-container') as HtmlElement;
const quizFilterForm = document.getElementById('filter') as Form;
const categoriesList = document.getElementById('category') as Select;
const quizInfo = document.getElementById('quiz-info') as DivElement;
const currentCategory = document.getElementById('current-category') as Paragraph;
const currentDifficulty = document.getElementById('current-difficulty') as Paragraph;
const currentQuestion = document.getElementById('current-question') as Paragraph;
const skipQuiz = document.getElementById('skip-quiz') as Button;
const questionContainer = document.getElementById('q-container') as HtmlElement;
const questionTitle = document.getElementById('question') as Heading;
const answersList = document.getElementById('answers-list') as UnorderedList;
const prevQ = document.getElementById('prevq') as Button;
const nextQ = document.getElementById('nextq') as Button;
const checkRes = document.getElementById('check') as Button;
const newGameBtn = document.getElementById('new-game') as Button;
const downloadBtn = document.getElementById('download') as Button;
const results = document.getElementById('results') as HtmlElement;
const resultsSummary = document.getElementById('results-text') as Paragraph;


let i: number = -1;
let allQuestions: Question[];
let selectedAnswers: string[] = [];

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

// function for creating the URL endpoint according to user input
function createEndpoint() {
    const amount = (document.getElementById('amount') as Input)?.value;
    let category = categoriesList?.value;
    let difficulty = (document.getElementById('difficulty') as Options)?.value;

    category === 'any' ? (category = '') : (category = `&category=${category}`);

    difficulty === 'any' ? (difficulty = '') : (difficulty = `&difficulty=${difficulty}`);

    return `api.php?amount=${amount}${category}${difficulty}&type=multiple`;
}

function generateQuiz() {
    quizFilterForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const endpoint = createEndpoint();
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
}

function showQuizInfo() {
    //get data from local storage
    const quizData = decryptQuestions('questions-list');

    if (currentCategory && currentDifficulty && currentQuestion) {
        currentCategory.textContent = HTMLDecode(`Category: ${quizData[i].category}`);
        currentDifficulty.textContent = `Difficulty: ${quizData[i].difficulty}`;
        let currentQNumber = i + 1;
        currentQuestion.textContent = `${currentQNumber} / ${quizData.length}`;
    }
}

function displayQuestion(allQuestions: Question[] | '') {
    if (Array.isArray(allQuestions)) {
        i++;

        if (quizInfo && questionContainer && nextQ && questionTitle) {
            quizInfo.style.display = '';
            questionContainer.style.display = '';
            nextQ.className = 'button nextq';
            showQuizInfo();
            questionTitle.innerHTML = allQuestions[i].question;
        }

        const answersArr = [allQuestions[i].correct_answer, ...allQuestions[i].incorrect_answers];

        shuffleArray(answersArr);

        if (answersList) {
            answersList.innerHTML = '';
        }

        answersArr.forEach((answer, index) => {
            const li = document.createElement('li');
            li.className = 'radio-btn';
            const label = document.createElement('label');
            label.className = 'answer';
            label.setAttribute('for', index.toString());
            label.innerHTML = `<input class="radio" type="radio" name="answer" id="${index.toString()}"><span class="radio-btn-ans">${answer}</span>`;
            li.appendChild(label);
            answersList?.appendChild(li);
        });
    }
    markSelectedAnswer();

    if (i > 0 && prevQ) {
        prevQ.style.display = '';
    } else {
        prevQ!.style.display = 'none';
    }
}

function markSelectedAnswer() {
    const options = document.getElementsByTagName('input');

    for (let index = 1; index < options.length; index++) {
        const option = options[index];

        const ansText = HTMLDecode(option!.parentNode!.textContent!);

        if (ansText === selectedAnswers[i]) {
            option.checked = true;
            option.setAttribute('checked', '');
            console.log(selectedAnswers);

            return;
        }
    }
}

function checkIfSelected(variable: Question[] | '', displayOrCheckFnc: (variable: Question[] | '') => void) {
    const checkedOption = document.querySelector('input[name = "answer"]:checked') as Input;

    if (checkedOption) {
        document.getElementById('alert')?.remove();
        if (checkedOption?.parentNode?.textContent) {
            selectedAnswers.splice(i, 1, checkedOption.parentNode.textContent.trim());

            //save answers to localStorage
            encryptData('answers', selectedAnswers);
        }

        displayOrCheckFnc(variable);

        console.log(selectedAnswers);
    } else {
        document.getElementById('alert')?.remove();
        const p = document.createElement('p');
        p.id = 'alert';
        p.textContent = `Please select an Answer!`;
        questionContainer?.appendChild(p);
    }
}

// function for changing to the prev question
prevQ?.addEventListener('click', (e) => {
    e.preventDefault();

    i -= 2;
    document.getElementById('alert')?.remove();

    displayQuestion(allQuestions);

    if (i < allQuestions.length - 1) {
        if (checkRes && nextQ) {
            checkRes.style.display = 'none';
            nextQ.style.display = '';
        }
    }
});

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
});

checkRes?.addEventListener('click', (e) => {
    e.preventDefault();

    checkIfSelected('', checkResult);
});

function checkResult() {
    let correctAnsCount = 0;

    // get data from localStorage
    const questionsCorrectAnswers = decryptQuestions('questions-list');
    questionsCorrectAnswers.forEach((q) => {
        return {
            title: HTMLDecode(q.question),
            correctAnswer: HTMLDecode(q.correct_answer),
        };
    });
    const answered = decryptAnswers('answers');

    questionsCorrectAnswers.forEach((a: QCorrectAns, index: number) => {
        if (HTMLDecode(answered[index]) === a.correct_answer) {
            correctAnsCount++;
        }
    });

    displayResults(correctAnsCount, questionsCorrectAnswers, answered);
}

function displayResults(correctAnsCount: number, questionsCorrectAnswers: QCorrectAns[], answered: string[]) {
    quizInfo!.style.display = 'none';
    questionContainer!.style.display = 'none';

    results!.style.display = '';

    const resultsText = questionsCorrectAnswers.map((el: QCorrectAns, index: number) => {
        const idx: number = index;
        return `- ${el.question}<br/>Correct answer: ${el.correct_answer}<br/>Your answer: ${answered[idx]}<br/><br/>`;
    });

    resultsSummary!.innerHTML = `Your score is ${correctAnsCount} correct answer/s out of ${answered.length
        } questions!<br/><br/>${resultsText.join('')}`;

    downloadZipFile(downloadBtn, resultsSummary);
}

// function for download of the result in txt file
function downloadZipFile(downloadBtn: Button, resultsSummary: Paragraph | undefined) {
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

skipQuiz?.addEventListener('click', resetQuiz);
newGameBtn?.addEventListener('click', resetQuiz);

function resetQuiz(e: Event) {
    e.preventDefault();
    i = -1;
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

const shuffleArray = (array: string[]) => {
    return array.sort(() => Math.random() - 0.5);
};

// function to convert html text into normal text
function HTMLDecode(textString: string) {
    const doc = new DOMParser().parseFromString(textString, 'text/html');
    return doc.documentElement.textContent;
}

generateQuiz();
