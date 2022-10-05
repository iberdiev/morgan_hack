
class TestOnePage extends TestPage {
    constructor() {
        super();
    }

    generateGrid() {
        const gridArea = document.querySelector('.grid_area');
        let grid_html = '';
        for(let row=0;row<10;++row) {
            grid_html += '<div class="row">'
            for(let col=0;col<16;++col) {
                grid_html += `<div class="col gx-1 gy-1">
                                <img id="${row}_${col}" src="https://picsum.photos/100/100" class="img-fluid" alt="...">
                            </div>`;
    
                // if(this.answers.includes(this.grid[row][col])) {
                //     this.correct_cells.push(`${row}_${col}`);
                // }
            }
    
            grid_html += '</div>';
        }
    
        gridArea.innerHTML = grid_html;
    
        for(let row=0;row<10;++row) {
            for(let col=0;col<16;++col) {
                gridArea.querySelector(`[id="${row}_${col}"]`).addEventListener('click', this.onImageClick.bind(this))
            }
        }
    }
}


class TestTwoPage extends TestPage {
    constructor() {
        super();
    }

    generateReferences() {
        const referenceAreaElement = document.querySelector('.reference');
        let reference_html = '<div class="d-flex flex-row">'
        for(let i=0;i<4;++i) {
            reference_html += `<div class="me-2">
                                <img id="reference-${i}" src="https://picsum.photos/48/48" class="img-fluid" alt="...">
                                </div>`;
        }
        reference_html += '</div';

        referenceAreaElement.innerHTML = reference_html;
    }

    // if 20 X 20 then best size is width=48 and height=48
    // row: gx-0 my-2
    generateGrid() {
        const gridArea = document.querySelector('.grid_area');
        let grid_html = '';
        for(let row=0;row<20;++row) {
            grid_html += `<div class="row mb-${(row+1) % 5 == 0 ? '5' : '1'}">`
            for(let col=0;col<20;++col) {
                grid_html += `<div class="col gx-1 gy-1">
                                <img id="${row}_${col}" src="https://picsum.photos/48/48" class="" alt="..."> 
                              </div>`;
    
                // if(this.answers.includes(this.grid[row][col])) {
                //     this.correct_cells.push(`${row}_${col}`);
                // }
            }
            //API.media+this.grid[row][col]
            grid_html += '</div>';
        }
    
        gridArea.innerHTML = grid_html;
    
        for(let row=0;row<20;++row) {
            for(let col=0;col<20;++col) {
                gridArea.querySelector(`[id="${row}_${col}"]`).addEventListener('click', this.onImageClick.bind(this))
            }
        }
    }
}

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
        const gridArea = document.querySelector('.grid_area');
        let grid_html = '';
        for(let row=0;row<40;++row) {
            grid_html += '<div class="row gx-1">'
            //const correct_letter = this.grid[row][0];
            for(let col=0;col<40;++col) {
                grid_html += `<div class="col gy-1">
                                <img id="${row}_${col}" src="https://picsum.photos/48/48" class="img-fluid" alt="...">
                              </div>`;
                
            }
    
            grid_html += '</div>';
        }
    
        gridArea.innerHTML = grid_html;
    
        for(let row=0;row<40;++row) {
            for(let col=0;col<40;++col) {
                gridArea.querySelector(`[id="${row}_${col}"]`).addEventListener('click', this.onImageClick.bind(this))
            }
        }
    }
}

class TestPageFactoryMethod {
    static getProperTestPageClass() {
        const queryString = window.location.href;
        const url = new URL(queryString);
        const test_id = url.searchParams.get("test_id");

        switch(test_id) {
            case '1':
                return new TestOnePage();
            case '2':
                return new TestTwoPage();
            case '3':
                return new TestThreePage();
            default:
                console.log("Invlid test id is provided!");
                break;
        }
    }
}