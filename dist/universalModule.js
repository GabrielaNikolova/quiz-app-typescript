// Base API URL
const api = 'https://opentdb.com/';
// Function to generate a complete URL
const url = (endpoint) => `${api}${endpoint}`;
// Function to create headers for a fetch request
const createHeadersFn = (method, data) => {
    const headers = {};
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
// Function to perform a fetch request using the specified endpoint and headers
const fetchFn = (endpoint, headers) => {
    return fetch(url(endpoint), headers)
        .then(response => response.json())
        .then((data) => data);
    // .catch((error: string) => console.error('Error fetching data:', error));
};
// Function for making a GET request
export const getFunction = (endpoint) => {
    const headers = createHeadersFn('GET', '');
    return fetchFn(endpoint, headers);
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
