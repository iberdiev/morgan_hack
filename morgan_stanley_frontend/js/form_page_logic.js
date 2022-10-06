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
        this.#sendUserData();
        window.location.href = "./test_completed_page.html";
    }

    #getUserData () {
        this.formValues.forEach(e => this.#userData[e.id] = e.value);
    }

    #packUserData() {
        const testData = localStorage.getItem('data');
        const timeFinished = localStorage.getItem('time_finish');
        const token = localStorage.getItem('token');
        const test_id = localStorage.getItem('test_id');

        this.#userData['token'] = token;
        this.#userData['test_id'] = test_id;
        this.#userData['testData'] = testData;
        this.#userData['timeFinished'] = timeFinished;
    }

    #sendUserData() {
        RestApiHandler.postData(API.send_report, this.#userData, true)
        .then((data) => {
            console.log(data); // JSON data parsed by `data.json()` call
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}

const formPage = new FormPage();
