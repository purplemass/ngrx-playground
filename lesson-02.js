"use strict";

// const apiURL = 'https://api.github.com/users?since=';
const apiURL = 'http://uinames.com/api/?amount=300';
const storageKey = 'gitHubData';

const $input = document.querySelector('#input');
const $results = document.querySelector('#results');
const $refreshButton = document.querySelector('.refresh');

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

  const gitHubObservable = (requestUrl) => {
    console.log('gitHubObservable');
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl))
      .do(response => {
        console.log('github saved to storage!');
        localStorage.setItem(storageKey, JSON.stringify(response));
      });
  }

  const storageObservable = Rx.Observable.create(observer => {
    console.log('storageObservable');
    var data = localStorage.getItem(storageKey);
    if (!data) {
      observer.onError(true);
    } else {
      observer.onNext(JSON.parse(data));
    }
  }).delay(500);

  const dataObservable = (requestUrl) => {
    return storageObservable
      .catch(() => gitHubObservable(requestUrl))
      .finally(() => console.log('finally'));
  };

  const responseStream = refreshClickStream
    .startWith('startup click')
    .map(() => apiURL)
    .flatMap(dataObservable)
    .share();

  // add 3 user carriages

  [1, 2, 3].forEach(x => {
    const closeButton = document.querySelector(`#close${x}`);
    const closeClickStream = Rx.Observable.fromEvent(closeButton, 'click')
      .startWith('startup click');

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
