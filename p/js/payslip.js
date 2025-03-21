import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, collection, collectionGroup, getDoc, getDocs, setDoc, increment, updateDoc, query, where, limit, orderBy, and, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
// import { userColor, pkey, projectConfigs } from "./lb/wc.js";
/*** REQUIRES AN INDEX FOR snapCompany and snapEmployees ***/
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
let company, person;
let yr = new Date().getFullYear().toString();
let mth = new Date().getMonth();

const note = document.getElementById('note');
const brake = document.querySelector('.break');
const comp = document.querySelector('.comp');
const cpny = document.querySelector('.cpny');
const slip = document.getElementById('slip');
const bigs = slip.querySelectorAll('.tail .big');
const chpd = document.getElementById('chpd');
const success = document.getElementById('success');
const myforms = document.forms;

//initialize name of csv file
// const dt= new Date();
// let payfile = 'ibooks-D'.concat(dt.getFullYear(),dt.getMonth(),dt.getDate());
// loginPop.showPopover();

//view pwds
const eyes = document.querySelectorAll('button.eye');
eyes.forEach(eye => {
    eye.onclick = () => {
        const input = eye.previousElementSibling;
        if (input.type === 'text') {
            eye.firstElementChild.setAttribute('name','eye-off-outline');
            input.setAttribute('type', 'password');
        } else {
            eye.firstElementChild.setAttribute('name','eye-outline');
            input.setAttribute('type', 'text');
        }
    }
});

function redoApp (config) {
    deleteApp(app);
    app = initializeApp(config);
    db = getFirestore(app);
}
// create binary string pbk
/*
let pbk = function pbkString(str) {
    try {
        return btoa(str);
    } catch (err) {
        notfcatn('alert-circle-outline', 'Invalid text input.');
    }
};
*/
// notification
function notify (txt, ico, timeOut=0) {
    note.querySelector('ion-icon').setAttribute('name', ico);
    note.querySelector('span').textContent = txt;
    note.showPopover();
    if (timeOut) {
        const toid = setTimeout(() => {
            note.hidePopover();
            clearTimeout(toid);
        }, timeOut);
    }
}
//login handler
let logPhase = 0;
myforms.namedItem('uform').addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.classList.add('on');

    const fd = new FormData(e.target);
    const email = fd.get('cem').trim(), uid = fd.get('uid');
    //check company email
    if (!logPhase) {
        try {
            if (email !== '') {
                const q = query(collection(db, 'ibooks'), where('email', '==', email), limit(1));
                const snapEmail = await getDocs(q);
                if (snapEmail.size) {
                    company = snapEmail.docs[0].data();
                    company['id'] = snapEmail.docs[0].id;
                    [comp, cpny].forEach(elem => elem.textContent = company.company);
                    e.target.querySelector('[type="email"]').toggleAttribute('readonly', true);
                    [comp, brake].forEach(elem => elem.classList.add('on'));
                    redoApp(JSON.parse(company.cfg));
                    logPhase = 1;
                } else {
                    throw Error('No such email exists.', {cause: 'Unknown email.'});
                }
            } else {
                throw Error('Invalid email address.', {cause: 'Invalid value.'});
            }
        } catch (err) {
            if ('cause' in err) {
                notify(err.message,'alert-circle-outline', 4000);
            } else {
                console.log(err);
            }
        } finally {
            e.submitter.classList.remove('on');
            e.submitter.disabled = false;
        }
    } else {
        try {
            if (uid !== '') {
                const q1 = query(collection(db, 'ibooks', company.id, yr), where('uid', '==', uid), limit(1));
                const userSnap = await getDocs(q1);
                if (userSnap.size) {
                    person = userSnap.docs[0].data();
                    //update slip
                    slip.querySelector('.wrap').classList.add('on');
                    slip.showPopover();
                    const snapStat = await getDoc(doc(db, 'ibooks', company.id, yr, person.id, 'paye', person.id));
                    slip.querySelector('.wrap').classList.remove('on');
                    updateSlip(person, snapStat.data());
                } else {
                    throw Error("Incorrect ID.", {cause: 'Wrong ID.'});
                }
            } else {
                throw Error("Please enter your ID.", {cause: 'No ID.'});
            }
        } catch (err) {
            if ('cause' in err) {
                notify(err.message,'alert-circle-outline', 4000);
            } else {
                console.log(err);
            }
        } finally {
            e.submitter.classList.remove('on');
            e.submitter.disabled = false;
        }
    }
});
myforms.namedItem('chpd').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fd = new FormData(e.target);
    const oldPwd = fd.get('pass');
    const currPwd = fd.get('newpass');
    const confmPwd = fd.get('confirmpass');
    if (person.uid !== oldPwd) return notify("Incorrect ID.", "alert-circle-outline", 4000);
    if (currPwd !== confmPwd) return notify("ID mismatch.", "alert-circle-outline", 4000);
    e.submitter.disabled = true;
    chpd.querySelector('.wrap').classList.add('on');
    //check if ID is taken
    try {
        const duplicateID = await getDocs(query(collection(db, 'ibooks', company.id, yr), where('uid', '==', currPwd)));
        if (duplicateID.size) throw Error("User ID already taken.", {cause: 'Duplicate User ID.'});
        await updateDoc(doc(db, 'ibooks', company.id, yr, person.id), {'uid': confmPwd});
        chpd.querySelector('.wrap').classList.remove('on');
        person['id'] = confmPwd;
        success.querySelector('ion-icon').setAttribute('name', 'checkmark-outline');
        success.querySelector('div').textContent = 'Your ID has been changed successfully.';
        success.classList.add('on');
        const tid = setTimeout(() => {
            success.classList.remove('on');
            e.target.reset();
            chpd.hidePopover();
            clearTimeout(tid);
        }, 3000);
    } catch (err) {
        if ('cause' in err) {
            notify(err.message, "alert-circle-outline", 4000);
        } else {
            console.log(err);
        }
    } finally {
        e.submitter.disabled = false;
        chpd.querySelector('.wrap').classList.remove('on');
    }
});
function updateSlip (user, stat) {
    const today = Date.now();
    const { ename, dept, post, lastMod } = user;
    cpny.insertAdjacentHTML('beforeend', `<br><small>${Intl.DateTimeFormat('en-US', {dateStyle: 'full'}).format(lastMod)}</small>`);
    [post, dept, ename.join(' ')].forEach(val => {
        document.getElementById('prof').insertAdjacentHTML('afterbegin', `<p>${val}</p>`)
    });
    //.body earnings and deductions
    let earnHTML = '<div><span>Earnings</span><span>&#8358;</span></div>',
        dednHTML = '<div><span>Deductions</span><span>&#8358;</span></div>';
    let totearn = 0, totdedn = 0;
    let {earn, dedn, xen, xdn} = stat;
    //calculate earnings
    earn = earn[mth] || earn[mth-1];
    dedn = dedn[mth] || dedn[mth-1];

    if (xen) {
        for (const p in xen) {
            if (xen[p][1] > today) {
                earn[p] = xen[p][0];
            }
        }
    }
    if (xdn) {
        for (const p in xdn) {
            if (xdn[p][1] > today) {
                dedn[p] = xdn[p][0];
            }
        }
    }

    for (const o in earn) {
        const v = Number((earn[o] < 2 ? earn[o]*user.gpm : earn[o]).toFixed(2));
        totearn += v;
        earnHTML += `<span>${o}</span><span>${Intl.NumberFormat('en-US', {notation: 'standard'}).format(v)}</span>`;
    }
    for (const o in dedn) {
        const v = Number((dedn[o] < 2 ? dedn[o]*user.gpm : dedn[o]).toFixed(2));
        totdedn += v;
       dednHTML += `<span>${o}</span><span>${Intl.NumberFormat('en-US', {notation: 'standard'}).format(v)}</span>`;
    }
    slip.querySelector('.wrap > .body').innerHTML = `<div class="ea">${earnHTML}</div>` + `<div class="de">${dednHTML}</div>`;
    [totearn, totdedn, user.gpm, totearn - totdedn].forEach((val, vdx) => bigs[vdx].innerHTML = `&#8358; ${Intl.NumberFormat('en-us', {notation: 'standard'}).format(val)}`);
}
//listen for offline and online status
window.addEventListener('offline', (e) => {
    notify("You are offline.", "cloud-offline-outline.");
});
window.addEventListener('online', (e) => {
    notify("You are back online.", "cloud-done-outline.", 4000);
});