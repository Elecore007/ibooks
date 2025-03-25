import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, collection, collectionGroup, getDoc, getDocs, setDoc, increment, updateDoc, query, where, limit, orderBy, and, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { userColor, pkey, banks, datePeriod, projectConfigs } from "../../lb/wc.js";
// import { ssid, defImg } from "../../main/main.js";
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
let person = JSON.parse(sessionStorage.getItem('person'));
let yr = new Date().getFullYear().toString();
let mth = new Date().getMonth();

function redoApp (config) {
    deleteApp(app);
    app = initializeApp(config);
    db = getFirestore(app);
}
// create binary string pbk
let pbk = function pbkString(str) {
    try {
        return btoa(str);
    } catch (err) {
        notfcatn('alert-circle-outline', 'Invalid text input.');
    }
};
const ssid = sessionStorage.ssid;
if (ssid) {
    //pick photo
    const note = document.getElementById('note');
    document.getElementById('file').addEventListener('click', (e) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = () => {
            const file = input.files[0];
            try {
                if (file.type.startsWith('image/')) {
                    if (file.size > 204800) {
                        throw new Error('Max file size exceeded.');
                    } else {
                        const fr = new FileReader();
                        fr.onloadend = () => {
                            const res = fr.result;
                            document.getElementById('img').style.backgroundImage = `url('${res}')`;
                        }
                        fr.readAsDataURL(file);
                    }
                } else {
                    throw new Error(`Unsupported file (${file.type}).`);
                }
            } catch (error) {
                note.querySelector('span').textContent = error.message;
                note.showPopover();
            } finally {
                const sid = setTimeout(() => {
                    note.hidePopover();
                    clearTimeout(sid);
                }, 5000);
            }
            
        }
        input.click();
    });
    //all forms
    const forms = document.forms;
    //edit profile
    let upd;
    const lodr = document.getElementById('lodr');
    const verifyPop = document.getElementById('verify'), profilePop = document.getElementById('profile');
    const editProfBtn = document.querySelector('#editBtn');
    editProfBtn.onclick = () => verifyPop.showPopover();
    //vfy form
    forms.namedItem('vfy').addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = e.target.children[0].value;
        try {
            if (pass === atob(person.pbk).slice(-10)) { // -10 because the pbk has a fixed length of 10 chars
                profilePop.showPopover();
            } else {
                throw new Error("Wrong password.");
            }
        } catch (error) {
            notify(e.submitter, error.message);
        } finally {
            e.target.reset();
        }
    });
    //edit form
    forms.namedItem('edit').addEventListener('submit', (e) => {
        e.preventDefault();
        e.submitter.disabled = true;
        const fd = new FormData(e.target);
        for (const [a, b] of fd.entries()) {
            console.log(a, b)
        }
        e.submitter.disabled = false;
    });
    //new manager form
    let managers = new Array(3).fill(0);
    let planMgrs = 3;
    forms.namedItem('newmgr').addEventListener('submit', (e) => {
        e.preventDefault();
        e.submitter.disabled = true;
        if (managers.length === planMgrs) {
            notify(e.submitter, 'Maximum managers reached.');
        } else {
            const fd = new FormData(e.target);
            const pwd = fd.getAll('upass');
            if (pwd[0] !== pwd[1]) {
                notify(e.submitter, 'Password mismatch.');
                return;
            }
            for (const [a, b] of fd.entries()) {
                console.log(a, b)
            }
        }
        e.submitter.disabled = false;
    });
    function notify(submitter, err) {
        note.querySelector('span').textContent = err;
        note.showPopover();
        const sid = setTimeout(() => {
            note.hidePopover();
            // document.querySelector('#newmgr').showPopover();
            submitter.disabled = false;
            clearTimeout(sid);
        }, 3000);
    }
    //view pwds
    const eyeds = document.querySelectorAll('.eyed');
    eyeds.forEach(eye => {
        eye.onclick = () => {
            const input = eye.previousElementSibling;
            if (input.type === 'text') {
                input.setAttribute('type', 'password');
                eye.firstElementChild.setAttribute('name', 'eye-off-outline');
            } else {
                input.setAttribute('type', 'text');
                eye.firstElementChild.setAttribute('name', 'eye-outline');
            }
        }
    });
}