import { BlobWriter, TextReader, ZipWriter } from "@zip.js/zip.js";

onmessage = async (e) => {
    const { questionsCorrectAnswers, answered } = e.data;

    let rightAns = 0;

    const text = questionsCorrectAnswers.map((el: QCorrectAns, index: number) => {
        let i: number = index;
        if (answered.includes(el.correct_answer)) {
            rightAns++;
        }
        return `- ${el.question}\nCorrect answer: ${el.correct_answer}\nYour answer: ${answered[i]}\n\n`;

    });

    const feedback = `Your score is ${rightAns} correct answer/s out of ${answered.length} questions!\n\n${text.join('')}`;

    const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
    await zipWriter.add("QuizResult.txt", new TextReader(feedback));
    const blob = await zipWriter.close()
    postMessage(blob)
};