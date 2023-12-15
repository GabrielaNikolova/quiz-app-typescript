// Base API URL
const api = 'https://opentdb.com/';

type Endpoint = string;

// Function to generate a complete URL
const url = (endpoint: Endpoint) => `${api}${endpoint}`;

// Function to create headers for a fetch request
const createHeadersFn = (method: string, data: object | '') => {
    const headers = {} as Headers;

    headers.method = method;
    // headers.headers = {
    //     'Content-Type': 'application/json',
    //     'Access-Control-Allow-Origin': '*'
    // }

    // Include the request body for 'PUT' or 'POST' methods
    if (method === 'PUT' || method === 'POST') {
        headers.body = JSON.stringify(data);
    }

    return headers;
};

// should have a catch, I dont like await
// Function to perform a fetch request using the specified endpoint and headers
const fetchFn = <T>(endpoint: Endpoint, headers: Headers) => {
    return fetch(url(endpoint), headers)
        .then(response => response.json())
        .then((data: T) => data);
    // .catch((error: string) => console.error('Error fetching data:', error));
};

// Function for making a GET request
export const getFunction = <T>(endpoint: Endpoint) => {
    const headers = createHeadersFn('GET', '');
    return fetchFn<T>(endpoint, headers);
};

// // Function for making a POST request
// export const postFunction = (endpoint: Endpoint, body: object) => {
//     const headers = createHeadersFn('POST', body);
//     return fetchFn(endpoint, headers);
// }

// // Function for making a PUT request
// export const putFunction = (endpoint: Endpoint, body: object) => {
//     const headers = createHeadersFn('PUT', body);
//     return fetchFn(endpoint, headers);
// }

// // Function for making a DELETE request
// export const deleteFunction = (endpoint: Endpoint) => {
//     const headers = createHeadersFn('DELETE', '');
//     return fetchFn(endpoint, headers);
// }

