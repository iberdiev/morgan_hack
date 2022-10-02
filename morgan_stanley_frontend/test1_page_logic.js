
class TestOnePage {

    static SELECTED = 'selected border border-5 border-success'.split(" ");

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
        
        // Catch the event thrown by timer
        document.addEventListener("getInfo", () => {
            this.countIncorrectAndRevised();
        });
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
    
    generateGrid() {
        let grid_html = '';
        for(let row=0;row<this.grid.length;++row) {
            grid_html += '<div class="row gx-0 gy-0">'
            for(let col=0;col<this.grid[0].length;++col) {
                grid_html += `<div class="col">
                            <img id="${row}_${col}" src="${API.media+this.grid[row][col]}" class="" alt="...">
                            </div>`;

                if(this.answers.includes(this.grid[row][col])) {
                    this.correct_cells.push(`${row}_${col}`);
                }
            }

            grid_html += '</div>';
        }

        this.gridArea.innerHTML = grid_html;
    
        for(let row=0;row<this.grid.length;++row) {
            for(let col=0;col<this.grid[0].length;++col) {
                this.gridArea.querySelector(`[id="${row}_${col}"]`).addEventListener('click', this.onImageClick.bind(this))
            }
        }
    }

    onImageClick(event) {
        const element = event.target;
        
        if(element.classList.contains('selected')) {
            this.chosen = this.chosen.filter(e => e != element.id);
        } else {
            this.chosen.push(element.id)
        }

        TestOnePage.SELECTED.forEach(elem => 
            event.target.classList.toggle(elem)
        )

    }


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

let testOnePage = new TestOnePage();
testOnePage.renderGrid();
testOnePage.startTimer();
