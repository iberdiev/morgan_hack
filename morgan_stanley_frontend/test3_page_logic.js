class TestThreePage extends TestPage {
    constructor() {
        super();
    }

    countIncorrectAndRevised() {
        let correct = 0;
        let incorrect = 0;
        let missed = 0;

        for(let row=0;row<this.grid.length;++row) {
            const correct_letter = this.grid[row][0];
            for(let col=0;col<this.grid[0].length;++col) {
                const element = this.gridArea.querySelector(`[id="${row}_${col}"]`);
                if(element.classList.contains('selected')) {
                    
                    if(this.grid[row][col] == correct_letter) {
                        correct++;
                    } else {
                        incorrect++;
                    }

                } else {
                    if(this.grid[row][col] == correct_letter) {
                        missed++;
                    }
                }
                
            }

        }


        this.data[this.currentIndex] = {
            'correct': correct,
            'incorrect': incorrect,
            'missed': missed
        };

        this.currentIndex++;

        console.log(this.data);
    }

    generateGrid() {
        let grid_html = '';
        for(let row=0;row<this.grid.length;++row) {
            grid_html += '<div class="row gx-0 gy-0">'
            const correct_letter = this.grid[row][0];
            for(let col=0;col<this.grid[0].length;++col) {
                grid_html += `<div class="col">
                            <img id="${row}_${col}" src="${API.media+this.grid[row][col]}" class="" alt="...">
                            </div>`;
                
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
}

let testThreePage = new TestThreePage();
testThreePage.renderGrid();
testThreePage.startTimer();