// ----------------------------------------------------------------------------

  const usersObserver = (users) => {
    console.log(users)
    users
      .map(user => user.name)
      .forEach((user) => {
        $(`<li> ${user} </li>`).appendTo($results);
    });
  }

  // separation of conerns: handling DOM in different places
  refreshClickStream.subscribe(() => {
    $results.html("");
  });

  // to print all users
  responseStream.subscribe(usersObserver);

// ----------------------------------------------------------------------------

return Rx.Observable.create(observer => {
  observer.onNext(100);
  observer.onCompleted();
  // throw error
  // observer.onError(true);
  return () => console.log('disposed');
});

// careful when using .catch()
return firstChoice()
  .catch(secondChoice(requestUrl)) // <-- this will run secondChoice every time!
  // above is wrong!
  .catch(() => secondChoice(requestUrl)) // <-- this is the correct way
  .finally(() => console.log('finally'))
;

// create a proper Observer:
var observer = Rx.Observer.create(
   (x) => console.log('onNext: %s', x),
   (e) => console.log('onError: %s', e),
   ()  => console.log('onCompleted')
);

// proper Observer example:
var usersObserverProper = Rx.Observer.create(users => {
  users
    .map(user => user.login)
    .forEach((user) => {
      $('<li>' + user + '</li>').appendTo($results)
    });
});

// ----------------------------------------------------------------------------
// oldr code
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
