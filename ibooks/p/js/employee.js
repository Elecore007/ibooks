import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, addDoc, doc, collection, getDocs, getAggregateFromServer, getCountFromServer, increment, sum, updateDoc, query, where, and, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
// import { getStorage, getDownloadURL, getBlob, ref, uploadBytes, uploadBytesResumable, uploadString } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";
import { userColor, pkey, banks, datePeriod, projectConfigs } from "../../lb/wc.js";
// const mainConfig = {
//     apiKey: "AIzaSyBAr1U_sHtQc8WGzwQfwmxCT2QyIkwdQ1k",
//     authDomain: "webmart-d7812.firebaseapp.com",
//     projectId: "webmart-d7812",
//     storageBucket: "webmart-d7812.appspot.com",
//     messagingSenderId: "570156229824",
//     appId: "1:570156229824:web:6c9f1f5e4438e5b284f925",
//     measurementId: "G-TFYJV323WC"
// };
// let firebaseConfig = mainConfig;

// Initialize Firebase
// let app = initializeApp(firebaseConfig);
// let db = getFirestore(app);
let app, db;

const _enum = document.getElementById('enum');
const enumBtns = _enum.querySelectorAll('button');
let empIdx = 0;

//get ibooks config
let id = sessionStorage.getItem('ssid'); //which is a session item

if (id) {
    const mainNote = document.querySelector('main > .note');
    let person = null, idb = null;
    let openDB = indexedDB.open('ibooks', 1);
    openDB.onsuccess = (e) => {
        console.log("Database opened.");
        idb = e.target.result;
        //get user info
        let tx = idb.transaction('mgr','readonly');
        tx.oncomplete = (e) => {
            console.log("Get Transaction completed.");
        }
        tx.onerror = (err) => {
            alert("Get Transaction failed.");
            console.log(err);
        }
        let mgrStore = tx.objectStore('mgr');
        let mgrReq = mgrStore.get(id);
        mgrReq.onsuccess = (e) => {
            person = e.target.result;

            const fbConfig = JSON.parse(person.cfg);
            app = initializeApp(fbConfig);
            db = getFirestore(app);
            // personReady(person);
        }
        mgrReq.onerror = (err) => {
            alert("Database Get Request Error.");
            console.log(err);
        }
    
        //get employee info, else from firebase
        let txe = idb.transaction('wkr', 'readwrite');
        txe.oncomplete = (e) => {
            console.log("Get Employee Transaction Completed.");
        }
        txe.onerror = (err) => {
            alert("Get Employee Transaction failed.")
            console.log(err);
        }
        let wkrStore = txe.objectStore('wkr');
        let wkrReq = wkrStore.getAll();
        wkrReq.onsuccess = async (e) => {
            let res = e.target.result;
            if (res.length) {
                //populate DOM with employees using function
                addEmployees(res);
            } else {
                let yr = datePeriod(Date.now()).getFullYear().toString();
                const empRef = await getDocs(collection(db, 'ibooks', person.fbid, yr));
                if (empRef.size) {
                    //then store copy in indexedDB
                    let data = empRef;
                    wkrReq = wkrStore.put(data);
                    wkrReq.onsuccess = (e) => {
                        console.log("Employees added to Database.");
                        //populate DOM with employees using function
                        addEmployees(data);
                    }
                    wkrReq.onerror = (err) => {
                        alert("Database error: add employees.");
                        console.log(err);
                    }
                } else {
                    notify('alert-circle-outline', 'No record.');
                }
            }
        }
    }
    openDB.onupgradeneeded = (e) => {
        console.log("Database updated.")
    }
    openDB.onerror = (err) => {
        console.log(err);
        alert("Database Open Error.");
    }
    //add employees to DOM
    function addEmployees (res) {
        let pages = Math.ceil(res.length/30);
        const book = document.querySelector('aside:nth-child(1) > div');
        //clear DOM
        book.querySelectorAll('.td').forEach(td => td.remove());
        // insert DOM
        res.forEach(obj => {
            book.insertAdjacentHTML('beforeend', `
                <div class="td">
                    <span data-abbr="${obj.ename[1].slice(0,1)}">${obj.join(' ')}</span>
                    <span>${obj.gender}</span>
                    <span>${obj.dept}</span>
                    <span>${obj.post}</span>
                </div>
            `);
        })
        // attach their handlers
        book.querySelector('.td').forEach((td, ix) => {
            td.onclick = (e) => {
                empIdx = ix; //Is this even useful again???
                const tdOn = book.querySelector('.td.on');
                if (tdOn) tdOn.classList.remove('on');
                // set edit mode and populate form
                employeeFormMode('person-outline','Edit Employee', 'edit');
                insertEmployeeDetails(res[ix]);
                [td, ...sections].forEach((elem, idx) => elem.classList.toggle('on', idx === 2 ? false : true));
            }
        });
        // set pages
        _enum.querySelector('span').innerHTML = `Page <i>1</i> of ${pages}`;
    }
    // continues from main
    const employee_form = document.querySelector('#employee_form');
    //insert banks
    banks.forEach(bank => {
        employee_form.querySelector('[data-name="Bank"] > select').insertAdjacentHTML('beforeend', `
            <option value="${bank}">${bank}</option>
        `);
    });
    enumBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            aside[0].querySelector('div').scrollTop = 0;
        });
    });
    //show/hide sections
    const sections = document.querySelectorAll('section');
    function employeeFormMode(icon, btn_txt, mod) {
        document.querySelector('button#fm_sb > ion-icon').setAttribute('name', icon);
        document.querySelector('button#fm_sb > span').textContent = btn_txt;
        sections[1].querySelector('.top > span').textContent = btn_txt;
        employee_form.setAttribute('data-mode', mod);
        sections.forEach((sect, idx) => sect.classList.toggle('on', idx));
    }
    function insertEmployeeDetails(obj) {
        //insert ename, gender, dept, post, resume, id, city, state, level, step, gpm, bank, acct
        let {ename: [lname, fname, oname], gender, dept, post, resume, id, city, state, level, step, gpm, bank, acct} = obj;
        employee_form.querySelectorAll('input', 'select').forEach((elem, ind) => {
            elem.value = [lname, fname, oname, gender, dept, post, resume, id, city, state, level, step, gpm, bank, acct][ind];
        });
    }
    // add button handler
    document.querySelector('button.add').onclick = (e) => {
        employeeFormMode('person-add-outline','Add Employee', 'add');
    };
    document.querySelectorAll('.top > .rota').forEach(btn => {
        btn.onclick = () => {
            document.querySelector('section.on').classList.remove('on');
        }
    })
    //auto id checkbox
    document.querySelector('#eid').onclick = (e) => {
        let r = parseInt(Math.random() * Number.MAX_SAFE_INTEGER);
        let t = r.toString(36).slice(0, 7).toLocaleUpperCase();
        e.target.previousElementSibling.value = t;
    }
    const lodr = document.getElementById('lodr');
    //setup worker.js
    // const wk = new Worker(new URL('worker.js', import.meta.url));
    //add employee handler
    employee_form.addEventListener('submit', (e) => {
        e.preventDefault();
        // console.log()
        loader(e.submitter);
        let data = Object.create(null);
        if (e.submitter.form.dataset.mode === 'add') {
            const fd = new FormData(e.target);
            for (const [k, v] of fd.entries()) {
                data[k] = v;
            }
            data['ename'] = fd.getAll('ename');
            // wk.postMessage(data);
    
            // wk.addEventListener('message', (ev) => {
                console.log(data);
                notify('checkmark-outline', 'New Employee Added.');
                loader(e.submitter, !1);
            // });
    
            // wk.addEventListener('error', (ev) => {
            //     loader(e.submitter, !1);
            //     console.log(ev.message, ev.filename, ev.lineno);
            // });
        } else if (e.submitter.form.dataset.mode === 'edit') {
            console.log("Edit mode.");
        }
    });
    function notify(ico, txt) {
        mainNote.querySelector('ion-icon').setAttribute('name', ico);
        mainNote.querySelector('span').textContent = txt;
        mainNote.classList.add('on');
        setTimeout(() => {
            mainNote.classList.remove('on');
        }, 5000);
    }
    function loader (s, l=!0) {
        if (l) {
            lodr.showPopover();
            s.disabled = true;
        } else {
            s.disabled = false;
            lodr.hidePopover();
        }
    }
    //payslip and delete btns
    const bottomBtns = document.querySelectorAll('.bottom > button');
    bottomBtns.forEach((btn, idx) => {
        btn.onclick = () => {
            console.log('Employee index:', empIdx);
            [...document.querySelectorAll('#slip, #delpop')].reverse()[idx].showPopover();
        };
    });
}
//show/hide sections

// document.querySelector('#picpop').showPopover();
// setInterval (() => document.querySelector('section:nth-of-type(2)').classList.toggle('on'), 5000)
// setInterval(() => document.querySelector('#pcwp > .note').classList.toggle('on'), 3000);
// document.querySelector('#lodr').showPopover();

// idNo, date of resumption, salary level, salary step, location
// employee and employer pension percentage