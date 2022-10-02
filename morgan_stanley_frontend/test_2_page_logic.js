
class TestTwoPage extends TestPage {
    constructor() {
        super();
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
}

let testTwoPage = new TestTwoPage();
testTwoPage.renderGrid();
testTwoPage.startTimer();
