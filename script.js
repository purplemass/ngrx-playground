var $input,
    $results,
    $refreshButton;

// ----------------------------------------------------------------------------

var apiURL = 'https://api.github.com/users?since=';
var storageKey = 'gitHubData';
var gitHubData = localStorage.getItem(storageKey);

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
      console.log('save to storage!');
    });
}

var resultsObservable = (requestUrl) => {
  if (!gitHubData) {
    return gitHubObservable(requestUrl);
  } else {
    data = JSON.parse(gitHubData);
    return Rx.Observable.create(observer => {
      observer.onNext(data);
      // observer.onCompleted();
      return () => console.log('disposed')
    });
  }
}

// ----------------------------------------------------------------------------

function doRxComplex1() {
  var refreshClickStream = Rx.Observable.fromEvent($refreshButton, 'click');
  // refreshClickStream.throttle(1500 /* ms */ );

  var requestStream = refreshClickStream.startWith('startup click')
    .map(() => {
      var randomOffset = Math.floor(Math.random()*500);
      return apiURL + randomOffset;
    })
    .flatMap(resultsObservable)
    // .flatMap(requestUrl => {
    //   return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl));
    // })
    ;

  refreshClickStream.subscribe(() => {
    $results.html("");
  });

  requestStream.subscribe(response => {
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
