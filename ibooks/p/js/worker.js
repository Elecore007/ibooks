console.log('worker thread')
onmessage = (e) => {
    console.log("Received message", e.data);
    //check backend for id, before adding a doc with it
    setTimeout(() => {
        postMessage(`Data has been submitted to backend and stored in indexedDB.`);
    }, 5000);
}