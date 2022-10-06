(function (EmailsInput, random) {
  'use strict'

  document.addEventListener('DOMContentLoaded', function () {
    const formSelect = document.querySelector('.form-select');
    const inputContainerNode = document.querySelector('#emails-input')
    const emailsInput = EmailsInput(inputContainerNode)


    const generate_tests_list = (list) => {
      formSelect.innerHTML += list
        .map(obj => `<option value="${obj.pk}">${obj.name}</option>`)
        .join('');
    }

    const sendToBackEnd = (data) => {
      RestApiHandler.postData(API.send_email, data, true)
        .then((response) => response.blob())
        .then((data) => {
          console.log(data); // JSON data parsed by `data.json()` call
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }

    // expose instance for quick access in playground
    window.emailsInput = emailsInput;

    const render_tests_list = () => {
      RestApiHandler.getData(API.tests)
        .then(generate_tests_list);
    }

    render_tests_list();

    document.querySelector('[data-action="send-email"]')
      .addEventListener('click', function () {
        const emailsList = emailsInput.getEmails();
        const testId = formSelect.selectedIndex;

        sendToBackEnd({ "participants": emailsList, "test_id": testId });
      })
  })

}(window.lib.EmailsInput, window.lib.utils.dom))
