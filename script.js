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
  // wikipedia();
  // doRxSimple();
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

// ----------------------------------------------------------------------------

function searchWikipedia (term) {
  return $.ajax({
    url: 'http://en.wikipedia.org/w/api.php',
    dataType: 'jsonp',
    data: {
      action: 'opensearch',
      format: 'json',
      search: term
    }
  }).promise();
}

function wikipedia() {
   /* Only get the value from each key up */
  var keyups = Rx.Observable.fromEvent($input, 'keyup')
    .map(e => e.target.value)
    .filter(text => text.length > 2)
    // Now throttle/debounce the input for 500ms
    .throttle(500 /* ms */ )
    // Now get only distinct values, so we eliminate the arrows and other control characters
    .distinctUntilChanged()
    .flatMapLatest(searchWikipedia);

  keyups.subscribe((data) => {
    console.log(data);
    var res = data[1];
    // Do something with the data like binding
    $results.empty();
    $.each(res, (_, value) => $('<li>' + value + '</li>').appendTo($results));
  }, error => {
    // handle any errors
    $results.empty();
    $('<li>Error: ' + error + '</li>').appendTo($results);
  });
}

// ----------------------------------------------------------------------------
