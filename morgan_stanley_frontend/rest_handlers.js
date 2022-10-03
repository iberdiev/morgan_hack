class RestApiHandler {

    /**
     * EXAMPLE POST METHOD
     * 
     * 
     * 
     * postData('https://example.com/answer', { answer: 42 })
     * .then((response) => response.blob())
     .then((data) => {
        console.log(data); // JSON data parsed by `data.json()` call
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    */
    static async postData(url = '', data = {}) {
        // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        
        return response.json(); // parses JSON response into native JavaScript objects
    }

    static async getData(url = '') {
        // Default options are marked with *
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        
        return await response.json(); // parses JSON response into native JavaScript objects
    }

    static getName() {
        console.log("Hello world");
    }
}

