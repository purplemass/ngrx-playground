// lesson-05.js
// unknown number of Observables
// http://stackoverflow.com/questions/32006174/merging-unknown-number-of-observables-with-rxjs

const dummyUser = {
  'name': 'name',
  'surname': 'surname',
  'gender': 'gender',
  'region': 'region'
};

(function() {
  doRx();
})();

// ----------------------------------------------------------------------------

function doRx() {

  function makeSource(x) {
    return Rx.Observable
      .just(x)
      .map(x => Rx.Observable.just(`${x}`));
  }

  const dropDownChangeStream = Rx.Observable.fromEvent($input, 'change')
    .map(ev => parseInt(ev.target.value))
    .startWith(3)
    .throttle(250);

  const stream = dropDownChangeStream
    // capture the latest set of Observables
    .scan((acc, x) => {
      // console.info('acc:', acc)
      // acc.forEach(x => {
      //   console.log('unsubscribe', x);
      //   x.dispose();
      // });
      let arr = [];
      [...Array(x).keys()].forEach(x => {
        arr.push(makeSource(x));
      });
      return arr;
    }, [])
    // dispose of the previous set and subscribe to the new set
    .flatMapLatest(arr => {
      return Rx.Observable.combineLatest(arr);
    })
    // don't know how many subscribers you have but probably
    // want to keep from recreating this stream for each
    // .share()
    // .do(x => console.info('STREAM:', x))
    .subscribe(arr => {
      [...Array(10).keys()].forEach(x => {
        htmlUser(x, null);
      });
      arr.forEach(x => {
        x.subscribe(x => {
          htmlUser(x, dummyUser);
        });
      });
    });
}