import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, addDoc, doc, collection, collectionGroup, getDocs, setDoc, increment, updateDoc, query, where, limit, and, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
// import { getStorage, getDownloadURL, getBlob, ref, uploadBytes, uploadBytesResumable, uploadString } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";
import { userColor, pkey, projectConfigs } from "./lb/wc.js";

const firebaseConfig = {
    apiKey: "AIzaSyBAr1U_sHtQc8WGzwQfwmxCT2QyIkwdQ1k",
    authDomain: "webmart-d7812.firebaseapp.com",
    projectId: "webmart-d7812",
    storageBucket: "webmart-d7812.appspot.com",
    messagingSenderId: "570156229824",
    appId: "1:570156229824:web:6c9f1f5e4438e5b284f925",
    measurementId: "G-TFYJV323WC"
};

// Initialize Firebase
let app = initializeApp(firebaseConfig);
let db = getFirestore(app);

//request for config
let adminID, cfgUsed;
const lodr = document.getElementById('lodr');
const ibook = 'ibooks'.split('').map(m => m.codePointAt(0)).join('-');

lodr.showPopover();
const qsnapshot = await getDocs(query(collection(db, 'ibooks'), where('is', '==', ibook), limit(1)));
qsnapshot.forEach((doc) => {
    [adminID, cfgUsed] = [doc.id, doc.data().cfgUsed];
});
lodr.hidePopover();
/*
import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, initializeFirestore, addDoc, and, setDoc, collection, collectionGroup, deleteDoc, deleteField, disableNetwork, doc, enableNetwork, getCountFromServer, getDoc, getDocs, increment, limit, memoryLocalCache, onSnapshot, or, orderBy, persistentLocalCache, persistentMultipleTabManager, query, runTransaction, serverTimestamp, startAfter, updateDoc, where, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";


    const firebaseConfig = {
        apiKey: "AIzaSyDW147JTSQ5DLcYIKppxOFOpcdC56umCsw",
        authDomain: "webmart-d7812.firebaseapp.com",
        projectId: "webmart-d7812",
        storageBucket: "webmart-d7812.appspot.com",
        messagingSenderId: "570156229824",
        appId: "1:570156229824:web:e119840f5621e13184f925",
        measurementId: "G-BN80W5M1EJ"
    };
    let app = initializeApp(firebaseConfig);
    let db = getFirestore(app);
*/
class ibooks {
    constructor(plan) {
        this.name = plan;
    }
    getPlan () {    //quota, managers, auth officers
        const f = ['payroll','budget','cooperative'];
        const p = {
            starter: {
                feature: f.slice(0,1),
                quoMgrAuth: [9, 1, 5],
                pricing: [10000, 100000]
            },
            basic: {
                feature: f.slice(0,1),
                quoMgrAuth: [49, 1, 5],
                pricing: [30000, 330000]
            },
            intermediate: {
                feature: f.slice(0,1),
                quoMgrAuth: [99, 3, 5],
                pricing: [39000, 430000]
            },
            advanced: {
                feature: f.slice(0,1),
                quoMgrAuth: [199, 3, 5],
                pricing: [50000, 550000]
            },
            premium: {
                feature: f.slice(0,1),
                quoMgrAuth: [1000, 3, 5],
                pricing: []
            }
        }
        return p[this.name];
    }
}
let subscriber = Object.create(null);
//forms
const forms = document.forms;
const note = document.getElementById('note');
//plans btns
const planBtns = document.querySelectorAll('[data-plan]');
const register = document.querySelector('section#register');
const pllxs = document.querySelectorAll('section:nth-of-type(2) > .pllx');
const steps = document.querySelectorAll('.step');

//plan selection
for (let p = 0; p < planBtns.length; p++) { //minus data-plan premium
    planBtns[p].addEventListener('click', (e) => {
        if (p === planBtns.length - 1) return;
        let data = planBtns[p].dataset.plan;
        let plan = new ibooks(data);
        subscriber['ibooks'] = plan.getPlan();
        document.querySelector('.pllx.confm > div > span:last-of-type').textContent = data.toUpperCase();
    });
}
let stp = 0;
document.querySelectorAll('.plans:not(:last-of-type) > button').forEach(btn => {
    btn.onclick = () => {
        if (cfgUsed < projectConfigs.length) {
            stp = 1;
            planStepthrough(stp);
        } else {
            notice('Sorry. The service is unavailable.');
        }
    }
});
const k = pkey();
// create binary string pbk
let pbk = function pbkString(str) {
    try {
        return btoa(str);
    } catch (err) {
        notice('Invalid text input.');
    }
};
const spans = [...document.querySelectorAll('.pllx.confm > div > span:nth-child(even)')];
forms.namedItem('company').addEventListener('submit', (e) => {
    e.preventDefault();
    spans.slice(0,4);
    const fd = new FormData(e.target);
    let x = 0;
    for (let [k, v] of fd.entries()) {
        subscriber[k] = v;
        spans[x].textContent = v;
        x++;
    }
    subscriber['pbk'] = [pbk(fd.get('email') + k)];
    stp = 2;
    planStepthrough(stp);
});
document.querySelector('.pllx.bank > button').addEventListener('click', (e) => {
    //check if file has been selected
    if (!rcpt) {
        notice('No file selected.');
        return;
    }
    stp = 3;
    planStepthrough(stp);
});
let mimeType, rcpt;
document.querySelector('.pllx.confm > button').addEventListener('click', async (e) => {
    //gather all data
    e.target.disabled = true;
    progress('Verifying email', 5);
    document.querySelector('#load').showPopover();
    //setting usercolor, creatOn, lastMod, rcpt
    subscriber['rcpt'] = 0;
    subscriber['creatOn'] = Timestamp.fromDate(new Date(Date.now()));
    subscriber['lastMod'] = serverTimestamp();

    try {
        const thepbk = pbk(subscriber.email + k);
        const snap = await getDocs(query(collection(db, 'ibooks'), and(where('pbk', 'array-contains', thepbk), where('rcpt', '!=', 0)), limit(1)));
        if (snap.size) {
            throw new Error("Sorry. This email already exists.", {cause: 'email'})
        };
        //create subscriber
        progress('<span>Creating your</span><span>ibooks</span>', 35);
        const subsRef = await addDoc(collection(db, 'ibooks'), subscriber);
        //create subColl <users>
        progress('Registering user', 75);
        delete subscriber['rcpt'];
        subscriber['bg'] = userColor();
        subscriber['is'] = 'superManager'.split('').map(m => m.codePointAt(0)).join('-');
        subscriber['pbk'] = thepbk;
        subscriber['fbid'] = subsRef.id;
        subscriber['cfg'] = JSON.stringify(projectConfigs[cfgUsed]);
        subscriber['lvl'] = null;
        subscriber['step'] = null;
        subscriber['structure'] = '[]';
        subscriber['payearn'] = {};
        subscriber['paydedn'] = {};
        const usersRef = await addDoc(collection(db, 'ibooks', subsRef.id, 'users'), subscriber);
        subscriber['uid'] = usersRef.id;
        const usid = await updateDoc(doc(db, 'ibooks', subsRef.id, 'users', usersRef.id), subscriber);
        //store receipt in storage
        progress('Setting up Cloud', 100);
        await updateDoc(doc(db, 'ibooks', subsRef.id), { rcpt, cfg: JSON.stringify(projectConfigs[cfgUsed]) });
        await updateDoc(doc(db, 'ibooks', adminID), {cfgUsed: increment(1)});
        premSub(
            'Subscription Confirmed.',
            'Dear Subscriber, thank you for choosing ibooks. Here is your PAK (Private Access Key) for your initial login:',
            k,
        );
        /*
        const storage = getStorage(app);
        const receiptRef = ref(storage, `receipt/${subsRef.id + mimeType}`);
        //replace rcpt with stored url
        const uploadTask = uploadString(receiptRef, rcpt, 'data_url');
        progress('Anticlimaxing', 80);
        uploadTask.on('state_changed',
            (snapshot) => {
                const progStat = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Upload is " + Math.trunc(progStat) + "% done.");
            },
            (error) => {
                // notice(error.code);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    progress('Finishing up...', 100);
                    await updateDoc(doc(db, 'ibooks', subsRef.id), {rcpt: downloadURL});
                    document.querySelector('#success').showPopover();
                });
            }
        )
        */
    } catch (err) {
        notice("Server error.");
        console.log(err);
        // if (err.cause == 'email') {
        // } else {
        //     notice(err.message);
        // }
    } finally {
        document.querySelector('#load').hidePopover();
        e.target.disabled = false;
    }
    //if data successfully sent to backend, disable this EventListener
});
//premium request
forms.namedItem('premium').addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    lodr.showPopover();
    const fd = new FormData(e.target);
    let data = {};
    for (const [k, v] of fd.entries()) {
        data[k] = v;
    }
    //verify email
    const snap = await getDocs(query(collectionGroup(db, 'notify'), and(where('prem_email', '==', data.prem_email), where('done', '==', false))));
    if (snap.size) {
        lodr.hidePopover();
        e.target.closest('[popover]').hidePopover();
        notice('This email already requested Premium Plan.');
        e.submitter.disabled = false;
        return;
    }
    data['pwd'] = pkey();
    data['timestamp'] = Timestamp.fromDate(new Date(Date.now()));
    data['done'] = false;

    lodr.showPopover();
    const notifySnap = await addDoc(collection(db, 'ibooks', adminID, 'notify'), data);
    e.target.closest('[popover]').hidePopover();
    lodr.hidePopover();
    premSub(
        "Request Sent.",
        "Thank you for choosing ibooks.<br>An email will shortly be sent to you regarding the Premium Plan.",
        '',
        true);
    e.submitter.disabled = false;
})
//subscriber v premium
const success = document.getElementById('success');
function premSub (title, msg, code='', cList=false) {
    success.firstElementChild.classList.toggle('on', cList);
    success.querySelector('p#sc').textContent = title;
    success.querySelector('div#bkpr > div > span').innerHTML = msg; // "Dear Subscriber, thank you for choosing ibooks.<br>Here is your PAK (Private Access Key) for your initial login:";
    success.querySelector('#cde > code').textContent = code;
    success.showPopover();
}
//close success
const filePreviewer = document.getElementById('file');
const output = document.getElementById('form').nextElementSibling;
success.querySelector("#crew + button").onclick = () => {
    location.reload();
}
//login handler
let idb = null;
forms.namedItem('login').addEventListener('submit', async (event) => {
    event.preventDefault();
    event.submitter.disabled = true;
    lodr.showPopover();

    const fd = new FormData(event.target);
    let str = fd.get('email') + fd.get('key');
    let id = pbk(str);
    
    //first check indexedDB
    /*
    let openDB = indexedDB.open('ibooks', 3);
    openDB.onerror = (err) => {
        lodr.hidePopover();
        event.submitter.disabled = false;
        notice('Open Request Error.', event.target.closest('[popover]'));
    }
    openDB.onupgradeneeded = (e) => {
        idb = e.target.result;
        ['mgr', 'wkr', 'stat'].forEach((stor, idx) => {
            if (!idb.objectStoreNames.contains(stor)) {
                idb.createObjectStore(stor, {keyPath: ['pbk','id','id'][idx]});
            }
        });
    }
    openDB.onsuccess = (e) => {
        idb = e.target.result;
        //get single user
        let tx = idb.transaction('mgr', 'readonly');
        tx.oncomplete = (e) => {
            console.log("Transaction Get Completed.");
        }
        tx.onerror = (err) => {
            lodr.hidePopover();
            event.submitter.disabled = false;
            notice("Transaction Get Error.", event.target.closest('[popover]'));
        }
        
        let store = tx.objectStore('mgr');
        let getReq = store.get(id);
        getReq.onsuccess = async (e) => {
            const res = e.target.result;
            if (res) {
                sessionStorage.setItem('ssid', id);
                location.href = './p/d/dashboard.html';
            } else {
                //check backend
                */
                const snap = await getDocs(query(collection(db, 'ibooks'), where('pbk', 'array-contains', id), limit(1)));
                if (!snap.size) {
                    event.submitter.disabled = false;
                    lodr.hidePopover();
                    notice("Invalid login.", event.target.closest('[popover]'));
                } else {
                    //transaction to add single user
                    const snapUser = await getDocs(query(collection(db, 'ibooks', snap.docs[0].id, 'users'), where('pbk', '==', id), limit(1)));
                    let data;
                    snapUser.forEach(doc => {
                        data = Object.assign(doc.data());
                    });
                        /*

                    let tx = idb.transaction('mgr', 'readwrite');
                    tx.oncomplete = (e) => {
                        console.log("Transaction Add Completed.");
                    }
                    tx.onerror = (err) => {
                        event.submitter.disabled = false;
                        lodr.hidePopover();
                        notice("Transaction Add Error.", event.target.closest('[popover]'));
                    }
                    let store = tx.objectStore('mgr');
                    let addReq = store.add(data);
                    addReq.onsuccess = (e) => {
                        */
                        sessionStorage.setItem('ssid', id);
                        sessionStorage.setItem('person', JSON.stringify(data)); //not-idb-desgn
                        location.href = './p/d/dashboard.html';
                        /*
                    }
                    addReq.onerror = (err) => {
                        event.submitter.disabled = false;
                        lodr.hidePopover();
                        notice("Add Request Error.", event.target.closest('[popover]'));
                    }
                    */
                }
            /*}
        }
        getReq.onerror = (err) => {
            notice("Get Request Error.");
        }
    }
    */
});
//bkbtn
document.getElementById('bkbtn').onclick = () => {
    if (stp) {
        stp--;
        planStepthrough(stp);
    }
}
function planStepthrough(num) {
    steps.forEach((step, idx) => step.classList.toggle('x', idx === num));
    pllxs.forEach((pllx, idx) => pllx.classList.toggle('on', idx === num));
    register.scrollTop = 0;
}
function notice(msg, elem) {
    if (elem) elem.hidePopover();
    note.querySelector('span').textContent = msg;
    note.classList.add('on');
    const sid = setTimeout(() => {
        note.classList.remove('on');
        if (elem) elem.showPopover();
        clearTimeout(sid);
        return;
    }, 3000);
}
const bar = document.querySelector('#bar');
const barMsg = bar.previousElementSibling;
function progress (msg, num) {
    barMsg.innerHTML = msg;
    bar.style.setProperty('--bar-wdh', num + '%');
}
//open file btn
document.querySelector('button.open').onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf, image/*';
            
    input.addEventListener('change', () => {
        const file = input.files[0];
        if (file.size <= 204800) {
            mimeType = `.${file.type.split('/').at(-1)}`;
            if (file.type.startsWith('image/')) {
                const img = new FileReader();
                img.onloadend = (f) => {
                    const res = f.target.result;
                    rcpt = {img: res};
                    filePreviewer.style.backgroundImage = `url('${res}')`;
                    output.firstElementChild.querySelector('i').textContent = file.name;
                    output.lastElementChild.querySelector('i').textContent = Math.ceil(file.size/1024) + ' KB';
                }
                img.readAsDataURL(file);
            } else if (file.type.endsWith('/pdf')) {
                const pdf = new FileReader();
                pdf.onloadend = (g) => {
                    const res = g.target.result;
                    rcpt = {pdf: res};
                    filePreviewer.style.backgroundImage = `url('./add.svg')`;
                    output.firstElementChild.querySelector('i').textContent = file.name;
                    output.lastElementChild.querySelector('i').textContent = Math.ceil(file.size/1024) + ' KB';
                }
                pdf.readAsDataURL(file);
            }
        } else if (!(file.type.startsWith('image/') || file.type.endsWith('/pdf'))){
            notice(`File format (${file.type.split('/').at(-1).toLocaleUpperCase()}) unsupported.`);
        } else {
            notice("Max size exceeded.");
        }
    });

    input.click();
}