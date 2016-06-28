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
  doRx();
})();

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
      resetClickStream.map(() => [])
    )

  // add 3 user carriages

  function userObservable(inc=1, listUsers=[]) {
    console.log('userObservable', inc, listUsers.length);
    const userRefreshButton = document.querySelector(`#close${inc}`);
    const userRefreshClickStream = Rx.Observable.fromEvent(userRefreshButton, 'click')
      .throttle(250);

    return userRefreshClickStream
      .startWith('startup click')
      .map(x => {
        console.log('userObservable', inc);
        const randomUser = listUsers[Math.floor(Math.random()*listUsers.length)];
        return { x: inc, user: randomUser } }
      )
  };

  // dropdown stream
  const dropDownChangeStream = Rx.Observable.fromEvent($input, 'change')
    .map(ev => parseInt(ev.target.value))
    .startWith(3)
    .throttle(250);

  // data stream
  const actionsStream = dropDownChangeStream
    .combineLatest(
      responseStream, (dropdown, listUsers) => {
        return {
          users: listUsers,
          dropdown: dropdown
        };
    })
    // .do(x => console.info('ACTIONS1:', x))
    .flatMapLatest(
      result => {
        return Rx.Observable.merge(
          userObservable(0, result.users),
          userObservable(1, result.users)
        );
      }
    )
    // .do(x => console.info('ACTIONS2:', x))
    .subscribe(users => {
      htmlUser(users.x, users.user);
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
