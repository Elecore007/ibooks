import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, addDoc, doc, collection, getDocs, setDoc, getAggregateFromServer, getCountFromServer, increment, runTransaction, sum, updateDoc, query, where, and, Timestamp, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
// import { getStorage, getDownloadURL, getBlob, ref, uploadBytes, uploadBytesResumable, uploadString } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";
import { userColor, pkey, banks, datePeriod, projectConfigs } from "../../lb/wc.js";
import { ssid } from "../../main/main.js";
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
let empIdx = 0, empID;

//get ibooks config
if (ssid) {
    const mainNote = document.querySelector('main > .note');
    const delpop = document.querySelector('#delpop');
    const sections = document.querySelectorAll('section');
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
            s ? s.disabled = true : false;
        } else {
            s ? s.disabled = false : false;
            lodr.hidePopover();
        }
    }

    let person = null, idb = null, yr;
    let openDB = indexedDB.open('ibooks', 3);
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
        let mgrReq = mgrStore.get(ssid);
        mgrReq.onsuccess = (e) => {
            person = e.target.result;
            
            const fbConfig = JSON.parse(person.cfg);
            app = initializeApp(fbConfig);
            db = getFirestore(app);
            // personReady(person);

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

                if (sessionStorage.getItem('synced')) {
                    //populate DOM with employees using function
                    addEmployees(res);
                    // sessionStorage.removeItem('synced');
                } else {
                    yr = datePeriod(Date.now()).getFullYear().toString();
                    const empRef = await getDocs(collection(db, 'ibooks', person.fbid, yr), orderBy('ename'));
                    if (empRef.size) {
                        //then store copy in indexedDB
                        let data = empRef.docs.map(m => m.data());

                        data.forEach(d => {
                            let txf = idb.transaction('wkr', 'readwrite');
                            txf.oncomplete = (e) => {
                                console.log("Set Employee Transaction Completed.");
                            }
                            txe.onerror = (err) => {
                                alert("Set Employee Transaction failed.")
                                console.log(err);
                            }
                            let wkstore = txf.objectStore('wkr');
                            let wkrRe = wkstore.put(d);
                            wkrRe.onsuccess = (e) => {
                                console.log("Employees added to Database.");
                                //populate DOM with employees using function
                                addEmployees(data);
                            }
                            wkrRe.onerror = (err) => {
                                alert("Database error: add employees.");
                                console.log(err);
                            }
                        });
                    } else {
                        notify('alert-circle-outline', 'No record.');
                    }
                }
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
                            <span data-abbr="${obj.ename[1].slice(0,1)}">${obj.ename.join(' ')}</span>
                            <span>${obj.gender}</span>
                            <span>${obj.dept}</span>
                            <span>${obj.post}</span>
                        </div>
                    `);
                })
                // attach their handlers
                book.querySelectorAll('.td').forEach((td, ix) => {
                    td.onclick = (e) => {
                        empIdx = ix; //Is this even useful again???
                        const tdOn = book.querySelector('.td.on');
                        if (tdOn) tdOn.classList.remove('on');
                        // set edit mode and populate form
                        let {ename, gender, dept, post, resume, id, city, state, level, step, gpm, bank, acct, uid} = res[ix];
                        empID = id;
                        let obj0 = [
                            ename.join(' '),
                            gender,
                            dept || 'Nil',
                            post || 'Nil',
                            city && state ? `${city}, ${state}` : 'Nil',
                            uid || 'Nil',
                            resume || 'Nil',
                            level || 'Nil',
                            step || 'Nil',
                            bank,
                            acct
                        ]
                        let obj1 = [
                            ename[0], ename[1], ename[2] || '',
                            gender, dept || '', post || '', resume || '', uid, 
                            city || '', state || '', level || '', step || '', gpm,
                            bank, acct
                        ]
                        insertEmployeeDetails(...obj0);
                        employeeFormMode('person-outline','Edit Employee', 'edit', obj1);
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
            function employeeFormMode(icon, btn_txt, mod, obj=[]) {
                document.querySelector('button#fm_sb > ion-icon').setAttribute('name', icon);
                document.querySelector('button#fm_sb > span').textContent = btn_txt;
                sections[1].querySelector('.top > span').textContent = btn_txt;
                employee_form.setAttribute('data-mode', mod);
                if (obj.length) {
                    obj.forEach((val, idx) => employee_form.querySelectorAll('input, select')[idx].value = val);
                }
                sections.forEach((sect, idx) => sect.classList.toggle('on', idx));
            }
            const bio = document.querySelector('#bio');
            function insertEmployeeDetails(obj) {
                bio.querySelectorAll('div:nth-child(even)').forEach(even => even.textContent = ''); // clear old details
                let x = 0;
                for (const args of arguments) {
                    //insert name into delpop; then insert details into bio
                    if (!x) delpop.querySelector('span').textContent = `${args}'s account?`;
                    bio.querySelectorAll('div:nth-child(even)')[x].textContent = args;
                    x++;
                }
            }
            // add button handler
            document.querySelector('button.add').onclick = (e) => {
                employeeFormMode('person-add-outline','Add Employee', 'add');
                employee_form.reset();
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
            let structure = JSON.parse(person.structure);
            structure.unshift(0);
            let gpm;

            const salaryIpts = document.querySelectorAll('[data-name="Salary"] > input');
            [salaryIpts[0], salaryIpts[1]].forEach((ipt, idx, arr) => {
                ipt.addEventListener('change', (e) => {
                    let lv = parseInt(arr[0].value), st = parseInt(arr[1].value);
                    if ((lv > 0 && st > 0) === (lv <= person.lvl && st <= person.step)) {
                        gpm = structure[person.lvl * st - (person.lvl - lv)];
                    } else {
                        gpm = 0;
                    }
                    salaryIpts[2].value = gpm || 0;
                });
            });
            // formatting the gpm
            salaryIpts[2].addEventListener('change', (e) => {
                gpm = Number(e.target.value.replaceAll(',',''));
                salaryIpts[2].value = Intl.NumberFormat('en-us', {notation: 'standard'}).format(gpm);
            });
            if (person.is == 'superManager'.split('').map(m => m.codePointAt(0)).join('-') || person.is == 'manager'.split('').map(m => m.codePointAt(0)).join('-')) {
                employee_form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    // console.log()
                    loader(e.submitter);
                    let data = Object.create(null);
                    const fd = new FormData(e.target);
                    const dt = Date.now();
    
                    for (const [k, v] of fd.entries()) {
                        data[k] = v;
                    }
                    //calculate gpm's breakdown
                    let dn = Object.entries(person.paydedn).map(m => {
                        let n = {[m[0]]: Number.isInteger(m[1]) ? m[1] : data['gpm']*m[1]};
                        return n;
                    });
                    let en = Object.entries(person.payearn).map(m => {
                        let n = {[m[0]]: Number.isInteger(m[1]) ? m[1] : data['gpm']*m[1]};
                        return n;
                    });
                    const dedn = dn.map(m => Object.values(m)[0]).reduce((acc, val) => acc + val);
                    const earn = en.map(m => Object.values(m)[0]).reduce((acc, val) => acc + val);

                    let details = {
                        'dedn': {
                            [new Date(dt).getMonth()]: dn.length ? [...dn] : {}
                        },
                        'earn': {
                            [new Date(dt).getMonth()]: en.length ? [...en] : {}
                        }
                    }
                    data['ename'] = fd.getAll('ename');
                    data['gpm'] = gpm;
                    data['lastMod'] = dt;
                    data['earn'] = earn;
                    data['dedn'] = dedn;
                    // console.log(data, details);
                    if (e.submitter.form.dataset.mode === 'add') {
                        data['creatOn'] = dt;
                        try {
                            const snapAdd = await addDoc(collection(db, 'ibooks', person.fbid, yr), data);
                            await updateDoc(doc(db, 'ibooks', person.fbid, yr, snapAdd.id), { 'id': snapAdd.id });
                            await setDoc(doc(db, 'ibooks', person.fbid, yr, snapAdd.id, 'paye', snapAdd.id), details);
                            //add to idb
                            let delTX = idb.transaction('wkr', 'readwrite');
                            delTX.oncomplete = (e) => sessionStorage.removeItem('synced');
                            delTX.onerror = (err) => console.log(err);
                
                            let Store = delTX.objectStore('wkr');
                            data['id'] = snapAdd.id;
                            let delReq = Store.add(data);
                            delReq.onsuccess = (e) => {
                                console.log("Add succeeded.");
                            }
                            delReq.onerror = (err) => {
                                console.log(err);
                            }
                            notify('checkmark-outline', 'New Employee Added.');
                            e.target.reset();
                        } catch (err) {
                            console.log(err);
                            notify('alert-circle-outline', 'Server error.');
                        } finally {
                            loader(e.submitter, !1);
                            e.target.reset();
                            sessionStorage.removeItem('synced');
                        }
                    } else if (e.submitter.form.dataset.mode === 'edit') {
                        // Edit mode
                        data['gpm'] = Number(fd.get('gpm'));
                        // console.log(data, details);
                        try {
                            await updateDoc(doc(db, 'ibooks', person.fbid, yr, empID), data);
                            await updateDoc(doc(db, 'ibooks', person.fbid, yr, empID, 'paye', empID), details);
                            //update idb
                            let delTX = idb.transaction('wkr', 'readwrite');
                            delTX.oncomplete = (e) => sessionStorage.removeItem('synced');
                            delTX.onerror = (err) => console.log(err);
                
                            let Store = delTX.objectStore('wkr');
                            data['id'] = empID;
                            let delReq = Store.put(data);
                            delReq.onsuccess = (e) => {
                                console.log("Update succeeded.");
                            }
                            delReq.onerror = (err) => {
                                console.log(err);
                            }
                            notify('checkmark-outline', 'Employee Updated.');
                        } catch (err) {
                            console.log(err);
                            notify('alert-circle-outline', 'Server error.');
                        } finally {
                            loader(e.submitter, !1);
                            e.target.reset();
                            sessionStorage.removeItem('synced');
                        }
                    }
                });
            } else {
                notify('alert-circle-outline', 'Permission denied.');
            }
            // //payslip and delete btns
            // const bottomBtns = document.querySelectorAll('.bottom > button');
            // bottomBtns.forEach((btn, idx) => {
            //     btn.onclick = () => {
            //         console.log('Employee index:', empIdx);
            //         [...document.querySelectorAll('#slip, #delpop')].reverse()[idx].showPopover();
            //     };
            // });
        }
        mgrReq.onerror = (err) => {
            alert("Database Get Request Error.");
            console.log(err);
        }
        //show/hide details menu
        const drpdwn = document.querySelector('.top > .drpdwn');
        document.querySelector('.top > button.ui').onclick = (e) => drpdwn.classList.toggle('on');
        // document.querySelector('.top > button.ui').onblur = (e) => drpdwn.classList.remove('on');
        drpdwn.querySelectorAll('button').forEach((btn, idx) => {
            btn.addEventListener('click', (e) => {
                drpdwn.classList.remove('on');
                if (idx) {
                    delpop.showPopover();
                } else {
                    sections.forEach((sect, idx) => idx ? sect.classList.add('on') : sect.classList.remove('on'));
                }
            });
        });
        //delete employee
        delpop.querySelector('button:nth-child(2)').addEventListener('click', async (e) => {
            console.log(empID)
            loader(false);
            try {
                let fbTX = await runTransaction(db, async (tranx) => {
                    await tranx.delete(doc(db, 'ibooks', person.fbid, yr, empID, 'paye', empID)); //subColl
                    await tranx.delete(doc(db, 'ibooks', person.fbid, yr, empID));    //parentColl
                });
                loader(false, !1);
                delpop.hidePopover();
                notify('checkmark-outline', 'Employee deleted.');
                //delete from idb
                let delTX = idb.transaction('wkr', 'readwrite');
                delTX.oncomplete = (e) => sessionStorage.removeItem('synced');
                delTX.onerror = (err) => console.log(err);
    
                let Store = delTX.objectStore('wkr');
                let delReq = Store.delete(empID);
                delReq.onsuccess = (e) => {
                    console.log("Delete succeeded.");
                }
                delReq.onerror = (err) => {
                    console.log(err);
                }
            } catch (err) {
                console.log(err);
                notify('alert-circle-outline', 'Server error.')
            } finally {
                loader(false, !1);
            }
        });
    }
    openDB.onupgradeneeded = (e) => {
        console.log("Database updated.")
    }
    openDB.onerror = (err) => {
        console.log(err);
        alert("Database Open Error.");
    }
    
}
//show/hide sections

// document.querySelector('#picpop').showPopover();
// setInterval (() => document.querySelector('section:nth-of-type(2)').classList.toggle('on'), 5000)
// setInterval(() => document.querySelector('#pcwp > .note').classList.toggle('on'), 3000);
// document.querySelector('#lodr').showPopover();

// idNo, date of resumption, salary level, salary step, location
// employee and employer pension percentage