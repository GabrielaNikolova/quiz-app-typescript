const api = 'https://opentdb.com/';

type Endpoint = string;

const url = (endpoint: Endpoint) => `${api}${endpoint}`;

const createHeadersFn = (method: string, data: object | '') => {
    const headers = {} as Headers;

    headers.method = method;
    return headers;
};

const fetchFn = (endpoint: Endpoint, headers: Headers) => {
    return fetch(url(endpoint), headers)
        .then((response) => response.json())
        .then((data: Data | Categories) => data);
};

export const getFunction = (endpoint: Endpoint) => {
    const headers = createHeadersFn('GET', '');
    return fetchFn(endpoint, headers);
};
