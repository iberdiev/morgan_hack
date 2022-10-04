
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
        this.gridArea = document.querySelector('.grid_area');
        this.finish_button = document.querySelector('.finish_button');
        this.finish_button.addEventListener('click', this.saveValuesAndRedirectToFormPage.bind(this));
        
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

    // TODO: change the API endpoint
    renderGrid() {
        const queryString = window.location.search;

        // Get grid and answers from backend
        RestApiHandler.getData(API.test_detail+queryString)
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
