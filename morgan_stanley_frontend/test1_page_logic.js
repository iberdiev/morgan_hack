
class TestOnePage extends TestPage {
    constructor() {
        super();
    }

    generateGrid() {
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
    
        this.gridArea.innerHTML = grid_html;
    
        for(let row=0;row<10;++row) {
            for(let col=0;col<16;++col) {
                this.gridArea.querySelector(`[id="${row}_${col}"]`).addEventListener('click', this.onImageClick.bind(this))
            }
        }
    }
}

let testOnePage = new TestOnePage();
testOnePage.renderGrid();
testOnePage.startTimer();
