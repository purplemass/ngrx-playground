"use strict";

(function() {
  doRx();
})();

// ----------------------------------------------------------------------------

function doRx() {
  const refreshClickStream = Rx.Observable.fromEvent($refreshButton, 'click')
    .throttle(250);

  const resetClickStream = Rx.Observable.fromEvent($resetButton, 'click')
    .throttle(250)
    .do(x => {
      showMessage('Stored data cleared');
      localStorage.clear();
    });

  const storageObservable = Rx.Observable.create(observer => {
    var data = localStorage.getItem(storageKey);
    if (!data) {
      showMessage('No stored API data found!');
      observer.onError('no data');
    } else {
      showMessage('Using stored API data');
      observer.onNext(JSON.parse(data));
    }
  }).delay(500);

  function gitHubObservable(requestUrl) {
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl))
      .do(response => {
        showMessage('API data fetched and saved to storage!');
        localStorage.setItem(storageKey, JSON.stringify(response));
      });
  }

  const responseStream = refreshClickStream
    .startWith('dummy startup click')
    .map(() => `${apiURL}` ) // <-- we could change the query string here
    .flatMap(requestUrl =>
      storageObservable
        .catch(() => gitHubObservable(requestUrl))
        .finally(() => console.log('finally'))
    )
    .merge(
      resetClickStream.map(() => [])
    )

  // add 3 user carriages

  function userObservable(inc=1, listUsers=[]) {
    // console.log('userObservable', inc, listUsers.length);
    const userRefreshButton = document.querySelector(`#close${inc}`);
    const userRefreshClickStream = Rx.Observable.fromEvent(userRefreshButton, 'click')
      .throttle(250);

    return userRefreshClickStream
      .startWith('startup click')
      .map(x => {
        // console.log('userObservable', inc);
        const randomUser = listUsers[Math.floor(Math.random()*listUsers.length)];
        return { x: inc, user: randomUser } }
      )
  };

  // dropdown stream
  const dropDownChangeStream = Rx.Observable.fromEvent($input, 'change')
    .map(ev => parseInt(ev.target.value))
    .startWith(3)
    .throttle(250);

  // data stream
  const actionsStream = dropDownChangeStream
    .combineLatest(
      responseStream, (dropdown, listUsers) => {
        return {
          users: listUsers,
          dropdown: dropdown
        };
    })
    .scan((acc, result) => {
      acc.forEach((result, inc) => {
        htmlUser(inc, null);
      });
      let arr = [];
      [...Array(result.dropdown).keys()].forEach(x => {
        arr.push(userObservable(x, result.users));
      });
      return arr;
    }, [])
    // .do(x => console.info('ACTIONS1:', x))
    .switchMap( // flatMapLatest === switchMap
      arr => {
        return Rx.Observable.combineLatest(arr);
      }
    )
    // .do(x => console.info('ACTIONS2:', x))
    .subscribe(arr => {
      arr.forEach(result => {
        htmlUser(result.x, result.user);
      });
    });
}
