class HomePage {
    generate_tests_list = (tests_list) => {
        const tests_list_area = document.querySelector(".tests_list_area");

        const generate_test = (obj) => {
            return `<div class="col-4">
                    <div class="card">
                        <img
                        src="./test_${obj.pk}.png"
                        class="card-img-top"
                        alt="..."
                        />
                        <div class="card-body">
                        <h5 class="card-title">${obj.name}</h5>
                        <p class="card-text">
                            This is a wider card with supporting text below as a natural
                            lead-in to additional content. This content is a little bit
                            longer.
                        </p>
    
                        <div class="">
                            <a href="./test1_page.html?test_id=${obj.pk}"
                            ><button type="button" class="btn btn-primary">
                                Start test
                            </button></a
                            >
                        </div>
                        </div>
                    </div>
                </div>`;
        };
        
        const generated_tests_list = tests_list.map(obj => generate_test(obj)).join('');
        tests_list_area.innerHTML = generated_tests_list;
    }

    render_tests_list() {
        RestApiHandler.getData(API.tests)
        .then(this.generate_tests_list);
    }
}

let homePage = new HomePage();
homePage.render_tests_list();




