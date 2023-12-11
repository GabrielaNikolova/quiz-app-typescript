interface Headers {
    method: string,
    body: string
}

interface Question {
    category: string,
    difficulty: string,
    question: string,
    correct_answer: string,
    incorrect_answers: string[]
}

interface Data {
    results: Question[]
}

interface QCorrectAns {
    question: string,
    correct_answer: string
}

interface Categories {
    trivia_categories: Category[]
}

type Category = {
    id: string,
    name: string
}