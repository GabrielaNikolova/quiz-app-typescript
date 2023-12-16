const api = 'https://opentdb.com/';

type Endpoint = string;

const url = (endpoint: Endpoint) => `${api}${endpoint}`;

const createHeadersFn = (method: string, data: object | '') => {
    const headers = {} as Headers;

    headers.method = method;
    return headers;
};

const fetchFn = <T>(endpoint: Endpoint, headers: Headers) => {
    return fetch(url(endpoint), headers)
        .then((response) => response.json())
        .then((data: T) => data);
};

export const getFunction = <T>(endpoint: Endpoint) => {
    const headers = createHeadersFn('GET', '');
    return fetchFn<T>(endpoint, headers);
};
