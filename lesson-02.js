"use strict";

// const apiURL = 'https://api.github.com/users?since=';
const apiURL = 'http://uinames.com/api/?amount=300';
const storageKey = 'gitHubData';

const $input = document.querySelector('#input');
const $results = document.querySelector('#results');
const $refreshButton = document.querySelector('.refresh');
const $message = document.querySelector('#message');

$(function() {
  doRx();
});

function htmlUser(x, user) {
  if (!user) {
    $(`#user${x}`).html('');
  } else {
    $(`#user${x}`).html(`${user.name} ${user.surname} [${user.gender}] ${user.region}`);
  }
}

// ----------------------------------------------------------------------------

function doRx() {
  const refreshClickStream = Rx.Observable.fromEvent($refreshButton, 'click')
    .throttle(250);

  const storageObservable = Rx.Observable.create(observer => {
    var data = localStorage.getItem(storageKey);
    if (!data) {
      $message.textContent = 'No stored API data found!';
      observer.onError('no data');
    } else {
      $message.textContent = 'Using stored API data';
      observer.onNext(JSON.parse(data));
    }
  }).delay(500);

  function gitHubObservable(requestUrl) {
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl))
      .do(response => {
        $message.textContent = 'API data fetched and saved to storage!';
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
    .share();

  // add 3 user carriages

  [1, 2, 3].forEach(x => {
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
