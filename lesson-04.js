// Lesson-04.js
// Subjects

const subject = new Rx.Subject();
// const subject = new Rx.BehaviorSubject(100);
// const subject = new Rx.ReplaySubject();
const a = subject.filter(x => x % 2 === 0).map(a => ({a}))
const b = subject.filter(x => x % 2 === 1).map(b => ({b}))
const combine = Rx.Observable.combineLatest(a, b, (a, b) => ({a: a.a, b: b.b}));
const merged = Rx.Observable.merge(a, b)

const observer = Rx.Observer.create(
  (x) => { console.log(`onNext: ${x}`); },
  (e) => { console.log(`onError: ${e.message}`); },
  ()  => { console.log('onCompleted'); }
);

// subject.subscribe(observer);
// subject.onNext(101);
// // subject.onCompleted();
// subject.onNext(102);
// // combine.subscribe(x => console.log('C', x));
// // merged.subscribe(x => console.log('M', x));
// subject.onNext(103);
// subject.onNext(104);

// subject.onNext('d');
// subject.subscribe(x => {
//   console.log('x1:' + x);
// });

// subject.onNext('e');

// subject.subscribe(x => {
//   console.log('x2:' + x);
// });

// subject.onNext('f');

//

const newMessage = new Rx.Subject();
const removeMessage = new Rx.Subject();
const sortMessages = new Rx.Subject();
const messages = Rx.Observable.merge(
    newMessage.map(x => {
      return {
        action: 'ADD',
        value: x
      };
    }),
    removeMessage.map(x => {
      return {
        action: 'REMOVE',
        value: x
      };
    }),
    sortMessages.map(x => {
      return {
        action: 'SORT',
        value: true
      };
    })
  )
  .scan((acc, operation) => {
    console.log('scan', acc, operation);
    switch (operation.action) {
      case 'add':
        acc.push(operation.value);
        break;
      case 'remove':
        var removeIndex = acc.indexOf(operation.value);
        if (removeIndex !== -1) {
          acc.splice(removeIndex, 1);
        }
        break;
      case 'sort':
        acc.sort(function(a, b) {
          return a > b;
        });
        break;
    }
    return acc;
  }, []);

var subscription = messages.subscribe(observer);
newMessage.onNext(4);
newMessage.onNext(2);
// newMessage.onNext(1);
// removeMessage.onNext(2);
// removeMessage.onNext(1);
// newMessage.onNext(3);
// sortMessages.onNext(true);
