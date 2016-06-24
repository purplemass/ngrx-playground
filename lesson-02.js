"use strict";

// const apiURL = 'https://api.github.com/users?since=';
const apiURL = 'http://uinames.com/api/?amount=300';
const storageKey = 'gitHubData';
const gitHubData = localStorage.getItem(storageKey);

const $input = document.querySelector('#input');
const $results = document.querySelector('#results');
const $refreshButton = document.querySelector('.refresh');

// ----------------------------------------------------------------------------

$(function() {
  doRxComplex1();
});

// ----------------------------------------------------------------------------

const gitHubObservable = (requestUrl) => {
  return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl))
    .do(response => {
      console.log('github saved to storage!');
      localStorage.setItem(storageKey, JSON.stringify(response));
    });
}

const storageObservable = () => {
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

const usersObserver = (users) => {
  users
    .map(user => user.name)
    .forEach((user) => {
      $(`<li> ${user} </li>`).appendTo($results)
  });
}

// ----------------------------------------------------------------------------

function doRxComplex1() {
  const refreshClickStream = Rx.Observable.fromEvent($refreshButton, 'click');
  const responseStream = refreshClickStream
    .startWith('startup click')
    .map(() => apiURL)
    .flatMap(resultsObservable);

  // separation of conerns: handling DOM in different places
  // refreshClickStream.subscribe(() => {
  //   $results.html("");
  // });

  // to print all users
  // responseStream.subscribe(usersObserver);

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
