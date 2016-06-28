// ----------------------------------------------------------------------------

    const userStream = Rx.Observable.create(observer => {
      // console.log('userObservable', inc);
      const randomUser = listUsers[Math.floor(Math.random()*listUsers.length)];
      observer.onNext({ x: inc, user: randomUser });
      observer.onCompleted();
    })
    .first();

    // const userObservable = Rx.Observable
    const userObservable = userRefreshClickStream
    // const userObservable = userStream
      .merge(userStream)
      .map(x => {
        console.log('userObservable', inc);
        const randomUser = listUsers[Math.floor(Math.random()*listUsers.length)];
        return { x: inc, user: randomUser };
      })
    // return userObservable;

// ----------------------------------------------------------------------------

    .scan((acc, x, i, source) => {
      console.log(acc, x, i, source);
      return acc;
    })

  var subscription = userObservable.subscribe();
  var subscription = userObservable.subscribe(x => console.log(x));
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
    // .subscribe(console.log.bind(console));

    const randomUser = listUsers[Math.floor(Math.random()*listUsers.length)];
    const test = Rx.Observable.create(observer => {
      console.log('userObservable', inc, randomUser);
      // htmlUser(inc, randomUser);
      observer.onNext({ x: inc, user: randomUser });
      observer.onCompleted();
    });

    return userRefreshClickStream
      .combineLatest(actionsStream,
        (click, listUsers) => {
          console.count('x');
          htmlUser(x, randomUser);
          return userObservable;
      })
      .merge(
        refreshClickStream.map(() => { return null; })
      )
      .startWith(null)
      .subscribe((user) => htmlUser(x, user));

var subject = new Rx.Subject();
var subscription = subject.subscribe(
  (x) => {
    console.log('Next: ' + x.toString());
  },
  (err) => {
    console.log('Error: ' + err);
  },
  () => {
    console.log('Completed');
  }
);
subject.onNext(42);
// // => Next: 42
subject.onNext(56);
// // => Next: 56
subject.onCompleted();

