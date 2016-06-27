"use strict";

// const apiURL = 'https://api.github.com/users?since=';
const apiAmount = 300;
const apiURL = `http://uinames.com/api/?amount=${apiAmount}`;
const storageKey = 'gitHubData';

const $input = document.querySelector('#input');
const $results = document.querySelector('#results');
const $refreshButton = document.querySelector('.refresh');
const $resetButton = document.querySelector('.reset');
const $message = document.querySelector('#message');

var amountToShow = 10;

$(function() {
  doRx();
});

// ----------------------------------------------------------------------------

function doRx() {
  console.time('appendHtml');
  [...Array(apiAmount).keys()].forEach(x => createUser(x));
  console.timeEnd('appendHtml');

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
      resetClickStream.map(() => { return []; }),
      refreshClickStream.map(() => { return null; })
    )
    // .share();

  // add 3 user carriages

  function usersObservable(x, listUsers=[]) {
    console.log('usersObservable', x);
    const userRefreshButton = document.querySelector(`#close${x}`);
    const userRefreshClickStream = Rx.Observable.fromEvent(userRefreshButton, 'click')
      .throttle(250)
      .startWith('dummy startup click');

    // return listUsers[Math.floor(Math.random()*listUsers.length)];
    return userRefreshClickStream
      .combineLatest(responseStream,
        (click, listUsers) => {
          console.count('x');
          return listUsers[Math.floor(Math.random()*listUsers.length)];
      })
      // .merge(
      //   refreshClickStream.map(() => { return null; })
      // )
      // .startWith(null)
      // .subscribe((user) => htmlUser(x, user));
  };

  // dropdown stream
  const dropDownChangeStream = Rx.Observable.fromEvent($input, 'change')
    .map(ev => parseInt(ev.target.value))
    .startWith(1)
    .throttle(250);

  // main stream
  responseStream
    .combineLatest(
      dropDownChangeStream, (listUsers, dropdown) => {
        return {
          users: listUsers,
          dropdown: dropdown
        };
    })
    .do(x => console.info('MAIN1:', x))
    .flatMap(
      result => {
        return usersObservable(1, result.users);
        // return [...Array(result.dropdown).keys()].map(n => {
        //   return usersObservable(n, result.users);
        // });
      }
    )
    .do(x => console.info('MAIN2:', x))
    .subscribe(user => {
      htmlUser(1, user);
    })
}

// ----------------------------------------------------------------------------

function createUser(x) {
  let html = `
    <div class="userDiv" id="userDiv${x}">
      <span class="close" id="close${x}" href="#">X</span>
      <span class="user" id="user${x}"></span>
    </div>
  `
  $('#results').append(html);
}

function htmlUser(x, user) {
  if (!user) {
    $(`#userDiv${x}`).hide('fast');
  } else {
    $(`#userDiv${x}`).show('fast');
    $(`#user${x}`).html(`${user.name} ${user.surname} [${user.gender}] ${user.region}`);
  }
}

function showMessage(msg) {
  $message.textContent = msg;
}

// ----------------------------------------------------------------------------

/*
    .scan((acc, x, i, source) => {
      console.log(acc, x, i, source);
      return acc;
    })


  var subscription = usersObservable.subscribe();
  var subscription = usersObservable.subscribe(x => console.log(x));
  setTimeout(() => {
    console.log('disposed!');
    console.log(subscription);
    subscription.dispose();
  }, 2000)


  const test$ = Rx.Observable.fromArray([1, 2, 3])
    .map(x => {
      console.info(x);
      htmlUser(x, listUsers[Math.floor(Math.random()*listUsers.length)])
    })
    .zip(
      Rx.Observable.interval(2000), (a, b) => {
        console.log(a, b)
        return a;
    })
    // .subscribe(console.log.bind(console));*/
    // return Rx.Observable.interval(result.dropdown*1000);
