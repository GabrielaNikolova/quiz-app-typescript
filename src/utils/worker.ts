import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';

onmessage = async (e) => {
    const { feedback } = e.data;
    if (typeof feedback !== 'string') {
        return;
    } else {
        feedback.replace(/<br\/>/g, '\n');

        const zipWriter = new ZipWriter(new BlobWriter('application/zip'));
        await zipWriter.add('QuizResult.txt', new TextReader(feedback));
        const blob = await zipWriter.close();
        postMessage(blob);
    }
};
