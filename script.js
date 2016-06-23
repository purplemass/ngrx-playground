"use strict";

// var apiURL = 'https://api.github.com/users?since=';
var apiURL = 'http://uinames.com/api/?amount=';
var storageKey = 'gitHubData';
var gitHubData = localStorage.getItem(storageKey);

var $input,
    $results,
    $refreshButton;

// ----------------------------------------------------------------------------

$(function() {
  $input = $('#input')
  $results = $('#results');
  $refreshButton = document.querySelector('.refresh');
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
    });
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
      $('<li>' + user + '</li>').appendTo($results)
  });
}

// ----------------------------------------------------------------------------

function doRxComplex1() {
  var refreshClickStream = Rx.Observable.fromEvent($refreshButton, 'click');
  var requestStream = refreshClickStream.startWith('startup click')
    .map(() => {
      var randomOffset = 2 + Math.floor(Math.random()*5);
      return apiURL + randomOffset;
    })
    .flatMap(resultsObservable);

  refreshClickStream.subscribe(() => {
    $results.html("");
  });

  requestStream.subscribe(usersObserver);
}
