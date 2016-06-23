var apiURL = 'https://api.github.com/users?since=';
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
      localStorage.setItem(storageKey, JSON.stringify(response));
      console.log('github saved to storage!');
    });
}

var storageObservable = () => {
  return Rx.Observable.create(observer => {
    observer.onNext(JSON.parse(gitHubData));
    // observer.onCompleted();
    return () => console.log('disposed')
  });
}

var resultsObservable = (requestUrl) => {
  if (!gitHubData) {
    return gitHubObservable(requestUrl);
  } else {
    return storageObservable();
  }
}

var usersObserver = (users) => {
  users
    .map(user => user.login)
    .forEach((user) => {
      $('<li>' + user + '</li>').appendTo($results)
  });
}

// ----------------------------------------------------------------------------

function doRxComplex1() {
  var refreshClickStream = Rx.Observable.fromEvent($refreshButton, 'click');
  var requestStream = refreshClickStream.startWith('startup click')
    .map(() => {
      var randomOffset = Math.floor(Math.random()*500);
      return apiURL + randomOffset;
    })
    .flatMap(resultsObservable);

  refreshClickStream.subscribe(() => {
    $results.html("");
  });

  requestStream.subscribe(usersObserver);
}
