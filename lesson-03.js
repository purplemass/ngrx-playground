// const runFor = [...'123456789'];
const runFor = [...'123'];
// console.warn(runFor);

var list = [...'abc'];
// console.log(yield [1, 2, 3]);

function* g1() {
  yield 1;
  yield 2;
  yield 3;
}

function* g2(){
  // yield* g1();
  // yield* list;
  yield* [1, 2, 3];
  yield* Array.from(arguments);
  // yield* arguments;
  return 'bar';
}

run(...'pq');
// run('pq');
// run(['pq']);
// run(['p', 'q']);
// run('p', 'q');

function* g3() {
  result = yield* g2();
}

var iterator = g3();

function run(args) {
  console.info(args);
  var iterator = g2(args);
  runFor.forEach(x => console.log(iterator.next()));
}

var result = 'foo';

// ----------------------------------------------------------------------------

var someArray = [1, 5, 7];
var someArrayEntries = someArray.entries();
someArrayEntries.toString();           // "[object Array Iterator]"
console.log(someArrayEntries);
console.log(someArrayEntries === someArrayEntries[Symbol.iterator]());    // true

// ----------------------------------------------------------------------------

var someString = 'poure';
iterator = someString[Symbol.iterator]();
iterator + "";
console.log(iterator)
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
