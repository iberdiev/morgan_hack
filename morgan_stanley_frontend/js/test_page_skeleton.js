
class TestPage {

    static SELECTED = 'selected border-selected'.split(" ");

    constructor() {
        this.data = {}
        this.currentIndex = 0;
        this.grid = [];
        this.answers = [];
        this.timer = new Timer();
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
        localStorage.setItem('time_finish', JSON.stringify({minute: this.timer.getTimeInMinutes(), second: this.timer.getTimeInSeconds()}));
        window.location.href = "./form_page.html";
    }

    countIncorrectAndRevised() {
        const gridArea = document.querySelector('.grid_area');

        const isSelected = (i, j) => {
            return gridArea
                    .querySelector(`[id="${i}_${j}"]`)
                    .classList
                    .contains('selected');

        }

        const getIncorrectSoFar = () => {
            let missed = 0;
            let incorrect_selected = 0;
            for(let i=0;i<this.grid.length;i++) {
                for(let j=0;j<this.grid[0].length;j++) {
                    const obj = {'missed': missed, 'incorrect_selected': incorrect_selected, 'current_max_revised': this.currentMaxRevised};
                    if (this.currentMaxRevised.row < i) {
                        return obj;
                    }
                    else if ((this.currentMaxRevised.row == i) && (j > this.currentMaxRevised.col )) {
                        return obj;
                    }

                    if(isSelected(i, j)) {
                        if(!this.answers.includes(this.grid[i][j]))
                            incorrect_selected++;
                    } else {
                        if(this.answers.includes(this.grid[i][j]))
                            missed++;
                    }

                }
                
            }
            
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

    #disableAllPreviousRows() {
        const gridArea = document.querySelector('.grid_area');

        for(let i=0;i<this.grid.length;i++) {
            for(let j=0;j<this.grid[0].length;++j) {
                if(this.currentMaxRevised.row == i)
                    return;

                gridArea
                    .querySelector(`[id="${i}_${j}"]`)
                    .classList.add('disabled');
            }
        }
    }

    onImageClick(event) {
        const element = event.target;

        const updateCurrentMaxRevised = () => {
            const idx = element.id.split('_');
            const row = Number.parseInt(idx[0]);
            const col = Number.parseInt(idx[1]);
            console.log(row, col)
            if(this.currentMaxRevised.row < row) {
                this.currentMaxRevised.row = row;
                this.currentMaxRevised.col = col;
            } else if(this.currentMaxRevised.row == row) {
                this.currentMaxRevised.col 
                        = Math.max(this.currentMaxRevised.col, col);
            }
            console.log(this.currentMaxRevised)
        }

        updateCurrentMaxRevised();

        if(element.classList.contains('disabled'))
            return;

        this.#disableAllPreviousRows()

        TestPage.SELECTED.forEach(elem => 
            event.target.classList.toggle(elem)
        )
    }

    renderHeader() {
        document.body.innerHTML += `
            <header>
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="ms-5">
                <a class="navbar-brand" href="#">Salva Vita</a>
                <button
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
                >
            </div>
            <div class=" timer my-auto" style="margin-left: 36%">
                <i class="bi bi-alarm mt-2 me-2"></i>
                <div class="btn-group" role="group" aria-label="Basic example">
                    <button
                    type="button"
                    class="timer-min btn btn-outline-dark .verdict_button"
                    >
                    00
                    </button>
                    <button type="button" class="timer-sec btn btn-outline-dark">
                    00
                    </button>
                </div>
            </div>
            
            </nav>
            </header>
        `;
    }

    renderBody() {
        //Please choose ___ and ___ from shown images
        document.body.innerHTML += `
            <div class="test1_main_container container mx-auto my-5 p-5 bg-light border border-2">
                <p class="fw-lighter fs-5"><span class="title fw-bold"></span></p>
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
        
        RestApiHandler.getData(API.check_token + '?token='+token)
        .then((data) => {
            const data_obj = JSON.parse(data);
            if(data_obj.status != 'ok') {
                window.location.href = './test_completed_page.html';
            }

            this.renderHeader();
            this.renderBody();
            this.renderGrid(test_id);
            this.startTimer();
            this.finish_button = document.querySelector('.finish_button');
            this.finish_button.addEventListener('click', this.saveValuesAndRedirectToFormPage.bind(this));
        });
    }

    renderGrid(test_id) {
        //Get grid and answers from backend
        RestApiHandler.getData(API.test_detail+'?test_id='+test_id)
        .then((data) => {
            this.grid = data.grid;
            this.answers = data.answers;
            document.querySelector('.title').innerText = data.prompt;
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
