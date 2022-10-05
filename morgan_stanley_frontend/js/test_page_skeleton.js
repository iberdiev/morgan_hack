
class TestPage {

    static SELECTED = 'selected border-selected'.split(" ");

    constructor() {
        this.data = {}
        this.currentIndex = 0;
        this.grid = [];
        this.answers = [];
        this.correct_cells = []
        this.timer = new Timer();
        this.chosen = [];
        this.currentMaxRevised = {row: 0, col: 0};
        this.finish_button = undefined;
        
        // Catch the event thrown by timer
        document.addEventListener("getInfo", () => {
            if(this.currentIndex == 5) {
                this.saveValuesAndRedirectToFormPage();
            }
            this.countIncorrectAndRevised();
        });
    }

    saveValuesAndRedirectToFormPage() {
        this.countIncorrectAndRevised();
        localStorage.setItem('data', JSON.stringify(this.data));
        console.log(this.timer);
        localStorage.setItem('time_finish', JSON.stringify({minute: this.timer.getTimeInMinutes(), second: this.timer.getTimeInSeconds()}));
        window.location.replace("./form_page.html");
    }

    countIncorrectAndRevised() {
        // Sort the cells in asc i.e. [0_1, 1_1, 1_2...]
        this.chosen.sort();

        const getGridValue = (str) => {
            const obj = convertStrIndToObj(str);
            return this.grid[obj.row][obj.col];
        }

        const convertStrIndToObj = (str) => {
            const indexes = str.split('_');
            return {row: indexes[0], col: indexes[1]};
        }

        const convertObjToStrInd = (obj) => {
            return `${obj.row}_${obj.col}`;
        }

        const getMaxIndexSoFar = () => {
            if(this.chosen.length == 0) return;

            const newObjInd = convertStrIndToObj(this.chosen[this.chosen.length-1]);
            if(newObjInd.row > this.currentMaxRevised.row) {
                this.currentMaxRevised = newObjInd;
            } else if (newObjInd.row == this.currentMaxRevised.row) {
                this.currentMaxRevised = 
                        newObjInd.col > this.currentMaxRevised.col ?
                            newObjInd : this.currentMaxRevised;
            }
        }

        // Refresh max index
        getMaxIndexSoFar();

        const getIncorrectSoFar = () => {
            const missed = this.correct_cells
                            .filter(e => e <= convertObjToStrInd(this.currentMaxRevised))
                            .filter(e => !this.chosen.includes(e))
                            .length;

            const incorrect_selected = this.chosen
                                        .filter(e => !this.answers.includes(getGridValue(e)))
                                        .length;

            return {'missed': missed, 'incorrect_selected': incorrect_selected};
        }


        this.data[this.currentIndex] = getIncorrectSoFar();
        this.currentIndex++;
    }

    printTimer() {
        const minute = document.querySelector('.timer-min');
        const second = document.querySelector('.timer-sec');
        setInterval(() => {
            minute.innerText = this.timer.getTimeInMinutes();
            second.innerText = (this.timer.getTimeInSeconds() < 10 ? '0' : '') + this.timer.getTimeInSeconds();
        }, 100)
    }

    onImageClick(event) {
        const element = event.target;
        
        if(element.classList.contains('selected')) {
            this.chosen = this.chosen.filter(e => e != element.id);
        } else {
            this.chosen.push(element.id)
        }

        TestPage.SELECTED.forEach(elem => 
            event.target.classList.toggle(elem)
        )

    }

    renderHeader() {
        document.body.innerHTML += `
            <header>
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container">
                <a class="navbar-brand" href="./home_page.html">Salva Vita</a>
                <button
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
                >
                <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="./home_page.html">Home</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" href="./home_page.html">Contact us</a>
                    </li>
                </ul>
                </div>
            </div>
            </nav>
        </header>
        `;
    }

    renderTimer() {
        document.body.innerHTML += `
            <div class="position-absolute top-2 end-0">
            <div class="timer my-1 mx-1">
            <i class="bi bi-alarm mt-2 me-2"></i>
            <div class="btn-group" role="group" aria-label="Basic example">
                <button
                type="button"
                class="timer-min btn btn-outline-primary .verdict_button"
                >
                00
                </button>
                <button type="button" class="timer-sec btn btn-outline-primary">
                00
                </button>
            </div>
            </div>
        </div>
        `;
    }

    renderBody(title) {
        //Please choose ___ and ___ from shown images
        document.body.innerHTML += `
            <div class="test1_main_container container mx-auto my-5 p-5 bg-light border border-2">
                <p class="fw-lighter fs-5">${title}</p>
                <div class="reference container mb-5"></div>
                <div class="grid_area container"></div>
                <div class="d-flex flex-row-reverse">
                <button type="button" class="finish_button mt-5 btn btn-success btn-lg">
                    Finish
                </button>
                </div>
            </div>
        `;
    }

    loadPage() {
        this.validateToken();
    }

    validateToken() {
        const queryString = window.location.href;
        const url = new URL(queryString);
        const token = url.searchParams.get("token");
        const test_id = url.searchParams.get("test_id");
        localStorage.setItem('test_id', test_id);
        localStorage.setItem('token', token);
        
        
        // RestApiHandler.getData(API.check_token + '?token='+token)
        // .then((data) => {
        //     const data_obj = JSON.parse(data);
        //     if(data_obj.status != 'ok') {
        //         window.location.href = './Invalid_token_page.html';
        //     }

        //     this.renderHeader();
        //     this.renderTimer();
        //     this.renderBody("Please choose ___ and ___ from shown images");
        //     this.renderGrid(test_id);
        //     this.finish_button = document.querySelector('.finish_button');
        // });
        this.renderHeader();
        this.renderTimer();
        this.renderBody("Please choose ___ and ___ from shown images");
        this.renderGrid(test_id);

        
        this.finish_button = document.querySelector('.finish_button');
        this.finish_button.addEventListener('click', this.saveValuesAndRedirectToFormPage.bind(this));
    }

    renderGrid(test_id) {
        //Get grid and answers from backend
        console.log(API.test_detail+'?test_id='+test_id);
        RestApiHandler.getData(API.test_detail+'?test_id='+test_id)
        .then((data) => {
            this.grid = data.grid;
            this.answers = data.answers;
        })
        .then(() => this.generateGrid());
    }

    startTimer() {
        this.timer.start();
        this.printTimer();
        setInterval(() => {

            // Throw the event for gathering the info regarding the cells
            document.dispatchEvent(gatherInfoEvent)
        }, 1000*60)
    }
}
