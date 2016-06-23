// create a proper Observer:
var observer = Rx.Observer.create(
   (x) => console.log('onNext: %s', x),
   (e) => console.log('onError: %s', e),
   ()  => console.log('onCompleted')
);

// proper Observer example:
var usersObserverProper = Rx.Observer.create(users => {
  users
    .map(user => user.login)
    .forEach((user) => {
      $('<li>' + user + '</li>').appendTo($results)
    });
});
