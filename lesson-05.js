// lesson-05.js
// unknown number of Observables
// http://stackoverflow.com/questions/32006174/merging-unknown-number-of-observables-with-rxjs

const $input = document.querySelector('#input');

(function() {
  doRx();
})();

// ----------------------------------------------------------------------------

function doRx() {
  function makeSource(x) {
    return Rx.Observable
      .just(x)
      .map(x => Rx.Observable.just(`observer${x}`));
  }

  const dropDownChangeStream = Rx.Observable.fromEvent($input, 'change')
    .map(ev => parseInt(ev.target.value))
    .startWith(3)
    .throttle(250);

  const stream = dropDownChangeStream
    // capture the latest set of Observables
    // .scan((acc, x) => {
    //   acc.push(source);
    //   console.info(acc, x);
    //   return acc;
    // }, [])
    // dispose of the previous set and subscribe to the new set
    .flatMapLatest(dropdown => {
      let arr = [];
      [...Array(dropdown).keys()].forEach(x => {
        arr.push(source);
      });
      return Rx.Observable.combineLatest(arr);
    })
    // don't know how many subscribers you have but probably
    // want to keep from recreating this stream for each
    // .share()
    // .do(x => console.info('STREAM:', x))
    .subscribe(arr => {
      arr.forEach(x => {
        // x.subscribe(x => {
        //   console.log(x)
        // });
      });
    });
}