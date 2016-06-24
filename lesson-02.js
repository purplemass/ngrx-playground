"use strict";

// const apiURL = 'https://api.github.com/users?since=';
const apiURL = 'http://uinames.com/api/?amount=300';
const storageKey = 'gitHubData';
const gitHubData = localStorage.getItem(storageKey);

const $input = document.querySelector('#input');
const $results = document.querySelector('#results');
const $refreshButton = document.querySelector('.refresh');

$(function() {
  doRxComplex1();
});

// ----------------------------------------------------------------------------

function doRxComplex1() {
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

  const storageObservable = () => {
    console.log('storageObservable');
    if (!gitHubData) {
      return Rx.Observable.throw(new Error());
    } else {
      return Rx.Observable.create(observer => {
        observer.onNext(JSON.parse(gitHubData));
      }).delay(500);
    }
  }

  const resultsObservable = (requestUrl) => {
    return storageObservable()
      .catch(() => gitHubObservable(requestUrl))
      .finally(() => console.log('finally'))
    ;
  };

  const responseStream = refreshClickStream
    .startWith('startup click')
    .map(() => apiURL)
    .flatMap(resultsObservable)
    .share();

  [1, 2, 3].forEach(x => {
    const closeButton = document.querySelector(`#close${x}`);
    const closeClickStream = Rx.Observable.fromEvent(closeButton, 'click')
      .startWith('startup click');

    const userStream = closeClickStream
      .combineLatest(responseStream,
        (click, listUsers) => {
          return listUsers[Math.floor(Math.random()*listUsers.length)];
        }
      )
      .merge(
        refreshClickStream.map(() => { return null; })
      )
      .startWith(null);

    userStream.subscribe((user) => {
      if (!user) {
        $(`#user${x}`).html('');
      } else {
        $(`#user${x}`).html(`${user.name} ${user.surname} [${user.gender}] ${user.region}`);
      }
    });
  });
}
