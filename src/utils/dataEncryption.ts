import CryptoJS from 'crypto-js';

const SECRET_KEY: string = 'mysecretkey';


export function encryptData(name: string, data: Question[] | string[]) {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    localStorage.setItem(name, encrypted);
}

//1 -> decryptQuestions and decryptAnswers can be the one function
export function decryptQuestions(name: string): QCorrectAns[] {
    const encrypted = localStorage.getItem(name);
    if (typeof encrypted != 'string') {
        throw Error('Data type is null.');
    }
    const data = CryptoJS.AES.decrypt(encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const decrypted: QCorrectAns[] = JSON.parse(data);
    return decrypted;
}

export function decryptAnswers(name: string): string[] {
    const encrypted = localStorage.getItem(name);
    if (typeof encrypted != 'string') {
        throw Error('Data type is null.');
    }
    const data = CryptoJS.AES.decrypt(encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const decrypted: string[] = JSON.parse(data);
    return decrypted;
}