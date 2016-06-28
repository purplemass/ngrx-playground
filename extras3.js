    const dataStream = Rx.Observable.create(observer => {
      // Yield a single value and complete
      const randomUser = listUsers[Math.floor(Math.random()*listUsers.length)];
      const ret = { x: inc, user: randomUser };
      observer.onNext(ret);
      // observer.onCompleted();
      console.log('userObservable', inc);
      return () => console.log(`disposed ${inc}`)
    });


    return userRefreshClickStream
      .map(x => {
        console.log(x);
        dataStream.onNext()
      })
      .merge(dataStream);



    .flatMap(
      result => {
        return Rx.Observable.merge(
          // userObservable(0, result.users)
          userObservable(0, result.users),
          userObservable(1, result.users),
          userObservable(2, result.users),
          userObservable(3, result.users)
        )
        // return userObservable(1, result.users);
        // return [...Array(result.dropdown).keys()].map(n => {
        //   userObservable(n, result.users);
        // });
      }
    )
    .scan((x, y, z, a, b) => {
      console.log('x', x, y, z, a, b);
      return x;
    }, 0)

  const dataStream = actionsStream
    .do(x => {
      [...Array(apiAmount).keys()].forEach(inc => htmlUser(inc, null));
    })
    .filter(x => x.users.length)
    .map(result => {
      var ret = []
      const temp = Rx.Observable
        .range(1, result.dropdown)
        .map(x => {
          const listUsers = result.users;
          const randomUser = listUsers[Math.floor(Math.random()*listUsers.length)];
          ret.push(randomUser);
        })
        .subscribe()
      temp.dispose();
      return ret;
    })
    .do(x => console.info('MAIN2:', x))

