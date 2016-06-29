"use strict";

// const apiURL = 'https://api.github.com/users?since=';
const apiAmount = 300;
const apiURL = `http://uinames.com/api/?amount=${apiAmount}`;
const storageKey = 'gitHubData';

const $input = document.querySelector('#input');
const $results = document.querySelector('#results');
const $refreshButton = document.querySelector('.refresh');
const $resetButton = document.querySelector('.reset');
const $message = document.querySelector('#message');

var amountToShow = 10;

(function() {
  console.time('appendHtml');
  [...Array(apiAmount).keys()].forEach(x => createUser(x));
  console.timeEnd('appendHtml');
})();

// ----------------------------------------------------------------------------

function createUser(x) {
  let html = `
    <div class="userDiv" id="userDiv${x}">
      <span class="close" id="close${x}" href="#">X</span>
      <span class="user" id="user${x}"></span>
    </div>
  `
  $('#results').append(html);
}

function htmlUser(x, user) {
  if (!user) {
    $(`#userDiv${x}`).hide('fast');
  } else {
    $(`#userDiv${x}`).show('fast');
    $(`#user${x}`).html(`${user.name} ${user.surname} [${user.gender}] ${user.region}`);
  }
}

function showMessage(msg) {
  $message.textContent = msg;
}
