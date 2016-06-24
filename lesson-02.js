"use strict";

// var apiURL = 'https://api.github.com/users?since=';
var apiURL = 'http://uinames.com/api/?amount=100';
var storageKey = 'gitHubData';
var gitHubData = localStorage.getItem(storageKey);

var $input = document.querySelector('#input');
var $results = document.querySelector('#results');
var $refreshButton = document.querySelector('.refresh');

// ----------------------------------------------------------------------------

$(function() {
  doRxComplex1();
});

// ----------------------------------------------------------------------------

var gitHubObservable = (requestUrl) => {
  return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl))
    .do(response => {
      console.log('github saved to storage!');
      localStorage.setItem(storageKey, JSON.stringify(response));
    });
}

var storageObservable = () => {
  if (!gitHubData) {
    return Rx.Observable.throw(new Error());
  } else {
    return Rx.Observable.create(observer => {
      observer.onNext(JSON.parse(gitHubData));
    }).delay(500);
  }
}

var resultsObservable = (requestUrl) => {
  return storageObservable()
    .catch(() => gitHubObservable(requestUrl))
    .finally(() => console.log('finally'))
  ;
};

var usersObserver = (users) => {
  users
    .map(user => user.name)
    .forEach((user) => {
      $(`<li> ${user} </li>`).appendTo($results)
  });
}

// ----------------------------------------------------------------------------

function doRxComplex1() {
  var refreshClickStream = Rx.Observable.fromEvent($refreshButton, 'click');
  var responseStream = refreshClickStream
    .startWith('startup click')
    .map(() => {
      return apiURL;
    })
    .flatMap(resultsObservable);

  // separation of conerns: handling DOM in different places
  // refreshClickStream.subscribe(() => {
  //   $results.html("");
  // });

  // to print all users
  // responseStream.subscribe(usersObserver);

  [1, 2, 3].forEach(x => {
    var closeButton = document.querySelector(`#close${x}`);
    var closeClickStream = Rx.Observable.fromEvent(closeButton, 'click')
      .startWith('startup click');

    var userStream = closeClickStream
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
