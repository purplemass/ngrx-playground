var $input,
    $results,
    $refreshButton;

var storageKey = 'gitHubData';

var gitHubObservable = function(requestUrl) {
  return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl))
}

var resultsObservable = function(requestUrl) {
  var gitHubData = localStorage.getItem(storageKey);
  if (!gitHubData) {
    var githubRequest = gitHubObservable;
    return githubRequest;
  } else {
    gitHubData = JSON.parse(gitHubData);
    return Rx.Observable.create(observer => {
      observer.onNext(gitHubData);
      // observer.onCompleted();
      return () => console.log('disposed')
    });
  }
}

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

function doRxComplex1() {
  var refreshClickStream = Rx.Observable.fromEvent($refreshButton, 'click');
  // refreshClickStream.throttle(1500 /* ms */ );

  var requestStream = refreshClickStream.startWith('startup click')
    .map(() => {
      var randomOffset = Math.floor(Math.random()*500);
      return 'https://api.github.com/users?since=' + randomOffset;
    })
    .flatMap(resultsObservable);

  refreshClickStream.subscribe(function() {
    $results.html("");
  });

  requestStream.subscribe(response => {
    console.info(response);
    // localStorage.setItem('response', JSON.stringify(response));
    response
      .map(x => x.login)
      .forEach((res) => {
        $('<li>' + res + '</li>').appendTo($results)
    });
  });
}

// ----------------------------------------------------------------------------

function doRxSimple() {
  var requestStream = Rx.Observable.just('https://api.github.com/users');
  var refreshClickStream = Rx.Observable.fromEvent($refreshButton, 'click');

  var responseStream = requestStream
    .flatMap(function(requestUrl) {
      return resultsObservable;
    });

  responseStream.subscribe(response => {
    response
      .map(x => x.login)
      .forEach((res) => {
        $('<li>' + res + '</li>').appendTo($results)
    });
  });
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
