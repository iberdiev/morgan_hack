
class TestOnePage extends TestPage {
    constructor() {
        super();
    }

    generateGrid() {
        const gridArea = document.querySelector('.grid_area');
        let grid_html = '';
        for(let row=0;row<this.grid.length;++row) {
            grid_html += '<div class="row">'
            for(let col=0;col<this.grid[0].length;++col) {
                grid_html += `<div class="col gx-1 gy-1">
                                <img id="${row}_${col}" src="${API.media+this.grid[row][col]}" class="img-fluid" alt="...">
                            </div>`;
            }
    
            grid_html += '</div>';
        }
    
        gridArea.innerHTML = grid_html;
    
        for(let row=0;row<this.grid.length;++row) {
            for(let col=0;col<this.grid[0].length;++col) {
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
        let reference_html = '<div class="d-flex flex-row w-25">'
        for(let i=0;i<this.answers.length;++i) {
            reference_html += `<div class="me-2">
                                <img id="reference-${i}" src="${API.media+this.answers[i]}" class="img-fluid" alt="...">
                                </div>`;
        }
        reference_html += '</div';

        referenceAreaElement.innerHTML = reference_html;
    }

    // if 20 X 20 then best size is width=48 and height=48
    // row: gx-0 my-2
    generateGrid() {
        this.generateReferences();
        const gridArea = document.querySelector('.grid_area');
        let grid_html = '';
        for(let row=0;row<this.grid.length;++row) {
            grid_html += `<div class="row mb-${(row+1) % 5 == 0 ? '5' : '1'}">`
            for(let col=0;col<this.grid[0].length;++col) {
                grid_html += `<div class="col gx-1 gy-1">
                                <img id="${row}_${col}" src="${API.media+this.grid[row][col]}" class="" alt="..."> 
                              </div>`;
            }
            //
            grid_html += '</div>';
        }
    
        gridArea.innerHTML = grid_html;
    
        for(let row=0;row<this.grid.length;++row) {
            for(let col=0;col<this.grid[0].length;++col) {
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
        const gridArea = document.querySelector('.grid_area');

        const isSelected = (i, j) => {
            return gridArea
                    .querySelector(`[id="${i}_${j}"]`)
                    .classList
                    .contains('selected');

        }

        const getInfoSoFar = () => {
            let correct = 0;
            let incorrect = 0;
            let missed = 0;

            for(let row=0;row<this.grid.length;++row) {
                const correct_letter = this.grid[row][0];
                for(let col=1;col<this.grid[0].length;++col) {
    
                    const obj = {'correct': correct, 'incorrect': incorrect, 'missed': missed, 'current_max_revised': this.currentMaxRevised};
    
                    if (this.currentMaxRevised.row < row) {
                        return obj;
                    }
                    else if ((this.currentMaxRevised.row == row) && (col > this.currentMaxRevised.col )) {
                        return obj;
                    }
    
                    if(isSelected(row, col)) {
                        
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

        }

        this.data[this.currentIndex] = getInfoSoFar();
        this.currentIndex++;
    }

    generateGrid() {
        const gridArea = document.querySelector('.grid_area');
        let grid_html = '';
        for(let row=0;row<this.grid.length;++row) {
            grid_html += '<div class="row gx-1">'
            for(let col=0;col<this.grid[0].length;++col) {
                grid_html += `<div class="col gy-1">
                                <img id="${row}_${col}" src="${API.media+this.grid[row][col]}" class="img-fluid" alt="...">
                              </div>`;
                
            }
    
            grid_html += '</div>';
        }
    
        gridArea.innerHTML = grid_html;
    
        for(let row=0;row<this.grid.length;++row) {
            gridArea.querySelector(`[id="${row}_0"]`).classList.add('proper');

            for(let col=1;col<this.grid[0].length;++col) {
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