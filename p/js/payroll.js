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
let person;
let yr = new Date().getFullYear().toString();
let mth = new Date().getMonth();

//login query
const main = document.querySelector('main');
const note = document.getElementById('note');
const banner = document.getElementById('banner');
const aside = document.querySelector('aside');
const loginPop = document.querySelector('#login');

loginPop.showPopover();
//view pwds
/*
const eye = document.querySelector('.gp > button');
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
*/
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

loginPop.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;

    loginPop.hidePopover();
    main.classList.add('lda');
    aside.classList.add('lda');

    try {
        const fd = new FormData(e.target);

        const thepbk = pbk(fd.get('email') + fd.get('ack'));
        const snapCompany = await getDocs(query(collection(db, 'ibooks'), and(where('pbk', 'array-contains', thepbk), where('rcpt', '!=', 0)), limit(1)));
        if (snapCompany.size) {
            person = snapCompany.docs[0].data();
            person['id'] = snapCompany.docs[0].id;
            //update banner DOM
            const dateString = parseInt(person.lastMod.seconds + (person.lastMod.nanoseconds).toString().slice(0,3));
            const payday = Intl.DateTimeFormat('en-us', {dateStyle: 'full'}).format(dateString);
            banner.innerHTML = `<p><span>${person.company}</span><br><span>Payroll</span><br><span id="issd">${payday}</span></p>`;
            loginPop.hidePopover();
            //get officers
            const snapOfficers = await getDocs(query(collection(db, 'ibooks', person.id, 'users'), orderBy('rank')));
            //update aside DOM
            aside.classList.remove('lda','ldb');
            // console.log('person id', person.id);
            snapOfficers.docs.forEach(offr => {
                let d = offr.data();
                document.querySelector('#officers').insertAdjacentHTML('beforeend', `
                    <div class="${person?.approved ? 'ofc a' : 'ofc'}">
                        <ion-icon name="checkmark-outline"></ion-icon>
                        <span>${d.user}</span>
                        <small>${['First Officer','Second Officer','Third Officer','Fourth Officer','Main Officer'][d.rank]}</small>
                    </div>
                `);
            });
            //clearance officer
            const clearanceOffr = snapOfficers.docs[0];
            document.getElementById('cleared').querySelector('span:nth-of-type(2)').textContent = clearanceOffr.data().user;

            //get employees
            const tab = document.getElementById('tab');
            let companyConfig = JSON.parse(person.cfg);
            redoApp(companyConfig);
            let bio = [], paye = [];
            const snapEmployees = await getDocs(query(collection(db, 'ibooks', person.id, yr), orderBy('bank'), orderBy('ename')));
            if (snapEmployees.size) {
                snapEmployees.docs.forEach(emp => {
                    bio.push({'id': emp.id, ...emp.data()});
                });
            } else {
                throw new Error("Empty record.", {cause: "local"});
            }
            // console.log(bio)
            // const prom = bio.map(async ({id}) => {
            //     let docSnap = await getDoc(doc(db, 'ibooks', person.id, yr, id, 'paye', id));
            //     paye.push(docSnap.data());
            // });
            // await Promise.allSettled(prom);
            // console.log(paye);

            //insert bio into DOM
            main.classList.remove('lda');
            tab.removeAttribute('style');
            const tbd = tab.querySelector('#tbd');
            bio.forEach((b, bx) => {
                tbd.insertAdjacentHTML('beforeend', `
                    <div class="td">
                        <span>${bx+1}</span><span>${b.ename.join(' ')}</span><span>${b.bank}</span><span>${b.acct}</span><span>${Intl.NumberFormat('en-us', {style: 'currency', currency: 'NGN'}).format(b.earn - b.dedn)}</span>
                    </div>
                `);
            });
            //header action btn listeners
            document.querySelectorAll('[data-fn]').forEach((btn, btx) => {
                btn.addEventListener('click', async (e) => {
                    btn.disabled = true;
                    const val = btn.getAttribute('data-fn').toLowerCase();
                    if (val === 'print') {
                        window.print();
                    } else if (val === 'download') {
                        await generatePDF();
                    } else if (val === 'copy to excel') {
                        console.log("Copy to Excel.")
                    } else if (val === 'auth officers') {
                        aside.classList.toggle('on');
                    }
                    btn.disabled = false;
                });
            });
        } else {
            throw new Error("Invalid login.", {cause: "local"});
        }
    } catch (err) {
        if (err.cause == "local") {
            notfcatn('alert-circle-outline',err.message);
        } else {
            notfcatn('alert-circle-outline','Offline error.');
            console.log(err);
        }
        loginPop.showPopover();
    } finally {
        e.submitter.disabled = false;
    }
});
function notfcatn (ico, txt) {
    note.style.top = '2em';
    note.querySelector('ion-icon').setAttribute('name', ico);
    note.querySelector('span').textContent = txt;
    note.showPopover();
    const toid = setTimeout(() => {
        note.style.top = '-7em';
        note.hidePopover();
        clearTimeout(toid);
    }, 4500);
}
/* GENERATING PDF */
//CDN
async function generatePDF () {
    console.log('Download PDF');

    /*
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(document.querySelector('body').children, 100, 100);
    doc.save("newfile.pdf");
    */
    // const body = document.body;
    // var opt = {
    //     margin: 1,
    //     filename: 'mypdf.pdf',
    //     html2canvas: {scale: 2},
    //     jsPDF: {unit: 'in', /*format: [dw, dh],*/ orientation: 'portrait',/* hotfixes: ['px_scaling']*/}
    // }
    
    // await html2pdf().set(opt).from(body).save();
}