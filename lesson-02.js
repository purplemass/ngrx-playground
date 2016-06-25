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

$(function() {
  doRx();
});

// ----------------------------------------------------------------------------

function doRx() {
  console.time('appendHtml');
  [...Array(apiAmount).keys()].forEach(x => createUser(x));
  console.timeEnd('appendHtml');

  const refreshClickStream = Rx.Observable.fromEvent($refreshButton, 'click')
    .throttle(250);

  const resetClickStream = Rx.Observable.fromEvent($resetButton, 'click')
    .throttle(250)
    .do(x => {
      showMessage('Stored data cleared');
      localStorage.clear();
    });

  const storageObservable = Rx.Observable.create(observer => {
    var data = localStorage.getItem(storageKey);
    if (!data) {
      showMessage('No stored API data found!');
      observer.onError('no data');
    } else {
      showMessage('Using stored API data');
      observer.onNext(JSON.parse(data));
    }
  }).delay(500);

  function gitHubObservable(requestUrl) {
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl))
      .do(response => {
        showMessage('API data fetched and saved to storage!');
        localStorage.setItem(storageKey, JSON.stringify(response));
      });
  }

  const responseStream = refreshClickStream
    .startWith('dummy startup click')
    .map(() => `${apiURL}` ) // <-- we could change the query string here
    .flatMap(requestUrl =>
      storageObservable
        .catch(() => gitHubObservable(requestUrl))
        .finally(() => console.log('finally'))
    )
    .merge(
      resetClickStream.map(() => { return []; })
    )
    .share();

  // add 3 user carriages

  [...Array(amountToShow).keys()].forEach(x => {
    const closeButton = document.querySelector(`#close${x}`);
    const closeClickStream = Rx.Observable.fromEvent(closeButton, 'click')
      .startWith('dummy startup click');

    closeClickStream
      .combineLatest(responseStream,
        (click, listUsers) => {
          return listUsers[Math.floor(Math.random()*listUsers.length)];
        }
      )
      .merge(
        refreshClickStream.map(() => { return null; })
      )
      .startWith(null)
      .subscribe((user) => htmlUser(x, user));
  });
}

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

// ----------------------------------------------------------------------------
