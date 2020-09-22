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

  // Check if app is online; if yes run sendTransaction(); function to send all local db data to the API.
  if (navigator.onLine) {
    sendTransaction();
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

  // access the object store for `new_pizza`
  const transactionObjectStore = transaction.objectStore('new_transaction');

  // add record to your store with add method
  transactionObjectStore.add(record);
}