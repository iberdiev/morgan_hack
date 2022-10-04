
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
    
        this.gridArea.innerHTML = grid_html;
    
        for(let row=0;row<20;++row) {
            for(let col=0;col<20;++col) {
                this.gridArea.querySelector(`[id="${row}_${col}"]`).addEventListener('click', this.onImageClick.bind(this))
            }
        }
    }
}

let testTwoPage = new TestTwoPage();
testTwoPage.generateReferences();
testTwoPage.renderGrid();
testTwoPage.startTimer();
