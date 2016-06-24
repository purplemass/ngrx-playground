"use strict";

// ----------------------------------------------------------------------------

var button = document.querySelector('.refresh');
var label = document.querySelector('h5');

// ----------------------------------------------------------------------------

var clickStream = Rx.Observable.fromEvent(button, 'click')
  .map(ev => ev.clientX); // <-- doesn't contribute much

var doubleClickStream = clickStream
  // .buffer(() => clickStream.throttle(250)) // <-- wrong in the lesson
  .buffer(clickStream.delay(250))          // <-- works now
  .map(arr => arr.length)
  .filter(len => len === 2);

doubleClickStream.subscribe(x => {
  label.textContent = 'Double clicked!';
})

doubleClickStream
  // .throttle(1000)  // <-- wrong in the lesson
  .delay(1000)        // <-- works now
  .subscribe(x => {
    label.textContent = '';
  })

/*

// ----------------------------------------------------------------------------

var slowStream = clickStream
  .delay(2000)
  .map(x => x/2)
  ;

slowStream.subscribe(x => {
  console.info(`slow: ${x}`);
  label.textContent = 'bad clear';
})

var source1 = Rx.Observable.interval(400).take(6)
  .map(i => ['4', '33', 'e', 'a', 'd', 'p'][i]);
source1.subscribe(x => console.log(x));

var source2 = Rx.Observable.just(10);
source2.subscribe(x => console.log(x));

// ----------------------------------------------------------------------------

*/
