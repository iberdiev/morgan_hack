class FormPage {
    #userData = {};

    constructor() {
        this.#userData = {};
        this.formElement = document.querySelector('.user_form');
        this.formValues = document.querySelectorAll('.form-value');
        this.formElement.addEventListener('submit', this.#onFormSubmit.bind(this));
    }

    #onFormSubmit(event) {
        event.preventDefault();
        this.#getUserData();
        this.#packUserData();
        console.log(this.#userData);
    }

    #getUserData () {
        this.formValues.forEach(e => this.#userData[e.id] = e.value);
    }

    #packUserData() {
        const testData = JSON.parse(localStorage.getItem('data'));
        const timeFinished = JSON.parse(localStorage.getItem('time_finish'));
        const token = JSON.parse(localStorage.getItem('token'));
        const test_id = JSON.parse(localStorage.getItem('test_id'));

        this.#userData['token'] = token;
        this.#userData['test_id'] = test_id;
        this.#userData['testData'] = testData;
        this.#userData['timeFinished'] = timeFinished;
    }

    #sendUserData() {
        
        postData('https://example.com/answer', )
        .then((response) => response.blob())
        .then((data) => {
            console.log(data); // JSON data parsed by `data.json()` call
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    }
}

const formPage = new FormPage();
