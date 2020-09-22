// Create variable to house the db connection
let db;
// Establish a connection to IndexedDB database called 'my_budget' and set it to version 1.
const request = indexedDB.open('my_budget', 1);


request.onupgradeneeded = function(event) { // Event will emit if the database version changes.
  const db = event.target.result;   // Save a reference to the database 
  db.createObjectStore('new_transaction', { autoIncrement: true }); // Create an object store (table) called `new_transaction`, set it to have an auto incrementing primary key of sorts.
};


request.onsuccess = function(event) {
  // When the database is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
  db = event.target.result;

  // Check if app is online; if yes run uploadTransaction(); function to send all local db data to the API.
  if (navigator.onLine) {
    uploadTransaction();
  }
};

request.onerror = function(event) {
  // log error here
  console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new transaction when there's no internet connection.
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions 
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  // access the object store for `new_transaction`
  const transactionObjectStore = transaction.objectStore('new_transaction');

  // add record to your store with add method
  transactionObjectStore.add(record);
}

function uploadTransaction() {
  // open a transaction on your db
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  // access your object store
  const transactionObjectStore = transaction.objectStore('new_transaction');

  // Retrieve all records from store and set to a variable.
  const getAll = transactionObjectStore.getAll(); // getAll is an asynchronous function to which we must to attach an event handler in order to retrieve the data.

  // upon a successful .getAll() execution, run this function
getAll.onsuccess = function() {
  // if there was data in indexedDb's store, let's send it to the api server
  if (getAll.result.length > 0) {
    fetch('/api/transaction', {
      method: 'POST',
      body: JSON.stringify(getAll.result),
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(serverResponse => {
        if (serverResponse.message) {
          throw new Error(serverResponse);
        }
        // open one more transaction
        const transaction = db.transaction(['new_transaction'], 'readwrite');
        // access the new_transaction object store
        const transactionObjectStore = transaction.objectStore('new_transaction');
        // clear all items in your store
        transactionObjectStore.clear();

        // alert('All saved transactions have been submitted!');
      })
      .catch(err => {
        console.log(err);
      });
  }
};
}


// listen for app coming back online
window.addEventListener('online', uploadTransaction);