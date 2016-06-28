// Lesson-04.js
// Subjects

// const subject = new Rx.Subject(100);
const subject = new Rx.BehaviorSubject(100);
const a = subject.filter(x => x % 2 === 0).map(a => ({a}))
const b = subject.filter(x => x % 2 === 1).map(b => ({b}))
const combine = Rx.Observable.combineLatest(a, b, (a, b) => ({a: a.a, b: b.b}));
const merged = Rx.Observable.merge(a, b)

const observer = Rx.Observer.create(
  (x) => { console.log(`onNext: ${x}`); },
  (e) => { console.log(`onError: ${e.message}`); },
  ()  => { console.log('onCompleted'); }
);

subject.subscribe(observer);
subject.onNext(101);
// subject.onCompleted();
subject.onNext(102);
// combine.subscribe(x => console.log('C', x));
merged.subscribe(x => console.log('M', x));
subject.onNext(103);
subject.onNext(104);

