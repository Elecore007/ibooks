import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, addDoc, setDoc, deleteDoc, doc, collection, collectionGroup, deleteField, getDocs, getAggregateFromServer, getCountFromServer, arrayRemove, arrayUnion, increment, sum, updateDoc, query, where, and, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
// import { getStorage, getDownloadURL, getBlob, ref, uploadBytes, uploadBytesResumable, uploadString } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";
import { userColor, pkey, datePeriod, projectConfigs } from "../../lb/wc.js";
import { ssid, defImg } from "../../main/main.js";
const firebaseConfig = {
    apiKey: "AIzaSyBAr1U_sHtQc8WGzwQfwmxCT2QyIkwdQ1k",
    authDomain: "webmart-d7812.firebaseapp.com",
    projectId: "webmart-d7812",
    storageBucket: "webmart-d7812.appspot.com",
    messagingSenderId: "570156229824",
    appId: "1:570156229824:web:6c9f1f5e4438e5b284f925",
    measurementId: "G-TFYJV323WC"
};
// let firebaseConfig = mainConfig;

// Initialize Firebase
let app = initializeApp(firebaseConfig);
let db = getFirestore(app);

let currYr = datePeriod(Date.now()).getFullYear().toString();

//get ibooks config
if (ssid) {
    let person = null, idb = null;
    person = JSON.parse(sessionStorage.getItem('person'));  //not-idb-desgn

    let obj = {navigable: true, profile: [person.user, person.is]};
    window.postMessage(obj, obj);
    //use person class?
    personReady(person);

    const cards = document.querySelectorAll('.card');
    const paye = document.getElementById('paye');
    
    function insertIndexes (idx, val='0') {
        cards[idx].classList.remove('ske');
        cards[idx].querySelector('div:nth-child(2)').textContent = Intl.NumberFormat('en-us', {notation: 'compact'}).format(val);
    }
    function redoApp (config) {
        deleteApp(app);
        app = initializeApp(config);
        db = getFirestore(app);
    }
    // let ibooksConfig = null;
    let ofrID, PBK;
    const lodr = document.getElementById('lodr');
    const editofr = document.getElementById('editofr');
    const editform = editofr.querySelector('form');
    async function personReady(who) {
        let userConfig;
        userConfig = JSON.parse(who.cfg);
        //welcome message
        document.querySelector('#confgr_paye > p > span').textContent = who.user;
        function addOfficerToDOM (off) {
            off.forEach(ofr => {
                ofcrs.querySelector('.obd').insertAdjacentHTML('beforeend', `
                    <button type="button" class="ofcr">
                        <div data-alias="${ofr.user.slice(0,1)}" class="${ofr.bg}">
                            <img src="">
                        </div>
                        <span>${ofr.user}</span>
                        <small></small>
                    </button>
                `);
            });
            //THEN THE HANDLER
            const omg = editofr.querySelector('.omg');
            document.querySelectorAll('button.ofcr').forEach((btn,btx) => {
                btn.addEventListener('click', (e) => {
                    let {user, bg, is, rank=12, id, pbk} = off[btx];
                    ofrID = id, PBK = pbk;
                    is = is.split('-').map(m => String.fromCodePoint(m)).join('');
                    omg.className = 'omg';    //reset classList
                    omg.setAttribute('data-alias',`${user.slice(0,1)}`);
                    omg.classList.add(`${bg}`);
                    editofr.querySelectorAll('.val').forEach((val, vtx) => val.textContent = [user, is, ['First Officer','Second Officer','Third Officer','Fourth Officer','Main Officer'][rank]][vtx]);
                    editform.querySelectorAll('.ipt > input, .ipt > select').forEach((elem, edx) => elem.value = [user, is, rank][edx]);
                    editofr.showPopover();
                });
            });
            //edit officers
            editform.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.submitter.disabled = true;
                lodr.showPopover();
                const fd = new FormData(e.target);
                let fb = {};
                for (const [k, v] of fd.entries()) {
                    fb[k] = v;
                }
                fb['rank'] = Number(fd.get('rank'));
                fb['is'] = fd.get('is').split('').map(m => m.codePointAt(m)).join('-');
                fb['lastMod'] = serverTimestamp();
                try {
                    await updateDoc(doc(db, 'ibooks', who.fbid, 'users', ofrID), fb);
                    editofr.hidePopover();
                    notify('Officer editted.','checkmark-outline');
                } catch (err) {
                    console.log(err);
                } finally {
                    e.submitter.disabled = false;
                    lodr.hidePopover();
                }
                console.log(fb)
            });
        }
        //delete officers
        document.querySelector('#eddel').addEventListener('click', async (e) => {
            e.target.disabled = true;
            lodr.showPopover();
            try {
                // redoApp(firebaseConfig);
                await deleteDoc(doc(db, 'ibooks', who.fbid, 'users', ofrID));
                await updateDoc(doc(db, 'ibooks', who.fbid), {pbk: arrayRemove(PBK)});
                notify('Officer deleted.', 'checkmark-outline');
            } catch (err) {
                console.log(err);
            } finally {
                editofr.hidePopover();
                e.target.disabled = false;
                lodr.hidePopover();
            }
        });
        //get auth officers
        const ofcrs = document.querySelector('#ofcrs');
        const officers = await getDocs(collection(db, 'ibooks', who.fbid, 'users'));
        if (officers.size) {
            //add to DOM
            let dt = officers.docs.map(m => {
                let d = m.data();
                d['id'] = m.id;
                return d;
            });
            addOfficerToDOM(dt);
        } else {
            ofcrs.querySelector('.obd').insertAdjacentHTML('afterbegin', `<code><i>No officers</i></code>`);        
        }
        //configure paye
        document.querySelector('#confgr_paye button').onclick = () => paye.showPopover();
        /*
        paye.addEventListener('toggle', (e) => {
            if (e.newState === 'open') {
    
                //if settings from backend are NOT AVAILABLE, lodr.showPopover to fetch the settings
                // document.getElementById('edrem').showPopover();
            }
        });
        */
        let temp1, temp2;
        const note = document.querySelector('main > .note');
        const payenote = paye.querySelector('.note');
        const payelodr = document.getElementById('payelodr');
        const foils = paye.querySelectorAll('.foil');
        const paySetBtns = foils[0].querySelectorAll('button');
        const foilTemps = document.querySelectorAll('#wpr > template');
        //add caps
        document.getElementById('cap').textContent = `Cap: ${who.ibooks.quoMgrAuth[0]}`;
        try {
            redoApp(userConfig);
            //get employees
            const ec = await getCountFromServer(collection(db, 'ibooks', who.fbid, currYr));
            const employeeCount = ec.data().count;
            insertIndexes(0, employeeCount);
            //get deductions
            const dd = await getAggregateFromServer(collectionGroup(db, currYr), { totalDed: sum('dedn')});
            const dedn = dd.data().totalDed;
            insertIndexes(1, dedn);
            //get earnings
            const en = await getAggregateFromServer(collectionGroup(db, currYr), { totalEarn: sum('earn')});
            const earn = en.data().totalEarn;
            insertIndexes(2, earn);
            //get gpm
            const gpm = await getAggregateFromServer(collectionGroup(db, currYr), { totalGross: sum('gpm')});
            const gross = gpm.data().totalGross;
            insertIndexes(3, gross);
            //get tsi
            redoApp(firebaseConfig);
        } catch (error) {
            notify("Offline error.","alert-circle-outline");
            console.log(error);
            cards.forEach(card => card.classList.toggle('ske', false));
        }
   
        function succeeded (txt) {
            payenote.querySelector('span').textContent = txt;
            payenote.classList.add('on');
            const sid = setTimeout(() => {
                payenote.classList.remove('on');
                clearTimeout(sid);
            }, 5000);
        }
        
        function notify (txt, ico) {
            note.querySelector('ion-icon').setAttribute('name', ico);
            note.querySelector('span').textContent = txt;
            note.classList.add('on');
            const sid = setTimeout(() => {
                note.classList.remove('on');
                clearTimeout(sid);
            }, 5000);
        }
        
        function addRemoveGrade(btnx, inputElem) {
            const x = parseInt(inputElem.value);
            if (Number.isInteger(x)) {
                const lvl3 = document.querySelector('.lvls:nth-child(3)');
                const xAxis = lvl3.querySelector('.thead');
                const yAxis = lvl3.querySelectorAll('.tr');
                let fx = xAxis.childElementCount;
    
                switch (btnx) {
                    case 0:
                        for (let i = 0; i < x; i++) {
                            xAxis.insertAdjacentHTML('beforeend', `<span>${fx+i}</span>`);
                        }
                        yAxis.forEach(axis => {
                            for(let j = 0; j < x; j++) {
                                axis.insertAdjacentHTML('beforeend', `<span contenteditable>0</span>`);
                            }
                        });
                        break;
                    case 1:
                        if (x < fx && fx > 2) {
                            xAxis.children[x].remove();
                            [...xAxis.children].slice(1).forEach((xax, idx) => xax.textContent = idx + 1);
                            yAxis.forEach(tr => tr.querySelector(`span:nth-child(${x+1})`).remove());
                        } else {
                            alert("Cannot go any futher.");
                        }
                        break;
                    default:
                        console.log("Unknown DOM insertion.");
                }
            }
            inputElem.value = '';
        }
        function addRemoveStep (btnx, inputElem) {
            const x = parseInt(inputElem.value);
            if (Number.isInteger(x)) {
                const lvl3 = document.querySelector('.lvls:nth-child(3)');
                const xAxis = lvl3.querySelector('.thead');
                const yAxis = lvl3.querySelectorAll('.tr');
                let fx = xAxis.childElementCount;
                let fy = yAxis.length + 1;
    
                switch (btnx) {
                    case 0:
                        for (let i = 0; i < x; i++) {
                            const u = `<span>${fy+i}</span>`, v = '<span contenteditable>0</span>'.repeat(fx-1);
                            lvl3.insertAdjacentHTML('beforeend', `<div class="tr">${u+v}</div>`);
                        }
                        break;
                    case 1:
                        if (x < fy && fy > 2) {
                            let removed = yAxis[x-1].remove();
                            lvl3.querySelectorAll('.tr').forEach((yay, idx) => yay.firstElementChild.textContent = idx + 1);
                        } else {
                            alert("Cannot go any futher.");
                        }
                        break;
                    default:
                        console.log("Unknown DOM insertion.");
                }
            }
            inputElem.value = '';
        }
        //ofcr
        const ofcdivs = ofcrs.querySelectorAll('div');
        document.querySelectorAll('.ofcr, .bckofcr').forEach(btn => {
            btn.onclick = function () {
                ofcdivs[1].classList.toggle('on');
            }
        });
        //view officers
        document.querySelectorAll('button#vwofc, #ofcrs .ohd > button').forEach(btn => {
            btn.onclick = () => {
                ofcdivs[0].classList.toggle('on');
            }
        });
        let pbk = function (str) {
            try {
                return btoa(str);
            } catch (err) {
                alert('Invalid text input.');
            }
        };
        if (who.is == 'superManager'.split('').map(m => m.codePointAt(0)).join('-') || who.is == 'manager'.split('').map(m => m.codePointAt(0)).join('-')) {
            paySetBtns.forEach((btn, idx) => {
                btn.addEventListener('click', async (e) => {
                    foils.forEach((foil, ndx) => foil.classList.toggle('on', ndx));
                    paySetBtns.forEach(b => b.classList.toggle('on', b === btn));
                    const content = foilTemps[idx].content.cloneNode(true);
                    let { lvl, step, structure } = who;
                    if (idx === 0) {
                        //sdbar btns
                        temp2 = [...foils[1].children];
                        foils[1].innerHTML = '';
                        if (temp1?.length) {
                            foils[1].append(...temp1);
                            temp1 = null;
                        } else {
                            [...content.children].forEach(chd => {
                                foils[1].insertAdjacentElement('beforeend', chd);
                            });
        
                            const sdbars = document.querySelectorAll('.sdbar');
                            sdbars.forEach((bar, dx) => {
                                bar.querySelectorAll('button').forEach((btn, ix) => {
                                    btn.addEventListener('click', (e) => {
                                        switch (dx) {
                                            case 0:
                                                addRemoveGrade(ix, bar.children[ix]);
                                                break;
                                            case 1:
                                                addRemoveStep(ix, bar.children[ix]);
                                                break;
                                            default:
                                                console.log("Unknown DOM insertion.");
                                        }
                                    });
                                });
                                bar.querySelectorAll('input').forEach((ipt, ipx) => {
                                    ipt.addEventListener('change', (e) => {
                                        switch (dx) {
                                            case 0:
                                                addRemoveGrade(ipx, ipt);
                                                break;
                                            case 1:
                                                addRemoveStep(ipx, ipt);
                                                break;
                                            default:
                                                console.log("Unknown DOM insertion.");
                                        }
                                    });
                                });
                            });
                            //insert salary levels
                            if (lvl) {
                                sdbars.forEach((bar, idx) => {
                                    bar.querySelector('input').value = [lvl-1, step-1][idx];
                                    bar.querySelector('button').click();
                                });
                                let matrix = lvl * step;
                                let s = JSON.parse(structure);
                                for (let m=0; m < matrix; m++) {
                                    document.querySelectorAll('.lvls:nth-child(3) > .tr > span:not(:nth-child(1))')[m].textContent = s[m];
                                }
                            }
                            //save handler
                            document.querySelector('#svsal').addEventListener('click', async (e) => {
                                //get salaries
                                payelodr.classList.add('on');
                                let salaries = [],
                                lvl = document.querySelector('.lvls:nth-child(3) > .thead').childElementCount - 1;
                                step = document.querySelectorAll('.lvls:nth-child(3) > .tr').length;
                                document.querySelectorAll('.lvls:nth-child(3) > .tr > span:not(:nth-child(1))').forEach(span => {
                                    salaries.push(parseInt(span.textContent) || 0);
                                });
                                
                                try {
                                    // firebaseConfig = mainConfig;
                                    let structure = JSON.stringify(salaries);
                                    const update = await updateDoc(doc(db, 'ibooks', who.fbid, 'users', who.uid), {
                                        structure,
                                        lvl,
                                        step,
                                    });
                                    //insert into indexedDB
                                    person['structure'] = structure, person['lvl'] = lvl, person['step'] = step;
                                    // await insertFromPaySetBtns(person);
                                    sessionStorage.setItem('person', JSON.stringify(person));   //not-idb-desgn
                                    //success notice
                                    succeeded('Salary settings updated.');
                                } catch (err) {
                                    console.log(err);
                                    alert("Server error.");
                                } finally {
                                    payelodr.classList.remove('on');
                                }
                            });
                            //clone template 1
                            temp1 = [...foils[1].children];
                        }
                    } else if (idx === 1) {
                        let sett;
                        temp1 = [...foils[1].children];
                        foils[1].innerHTML = '';
                        if (temp2?.length) {
                            foils[1].append(...temp2);
                            temp2 = null;
                        } else {
                            [...content.children].forEach(chd => {
                                foils[1].insertAdjacentElement('beforeend', chd);
                            });
                            const rollforms = document.querySelectorAll('.rllfm');
                            const surround = document.querySelector('.surround');
                            const h3s = surround.querySelectorAll('.h3');
                            const edrem = document.getElementById('edrem');

                            //initial population of payroll settings
                            if (who?.payearn) {
                                let eobj = Object.entries(who.payearn);
                                eobj.forEach(obj => {
                                    earnOrDedn(0, obj[0], (!Number.isInteger(obj[1]) ? 'per' : 'flat'), obj[1]);
                                });
                            }
                            if (who?.paydedn) {
                                let dobj = Object.entries(who.paydedn);
                                dobj.forEach(obj => {
                                    earnOrDedn(1, obj[0], (!Number.isInteger(obj[1]) ? 'per' : 'flat'), obj[1]);
                                });
                            }
                            function earnOrDedn(ix, n, perflat, val) {
                                // const [n] = Object.entries(data);
                                h3s[ix].insertAdjacentHTML('afterend', `
                                    <div class="prll">
                                        <p>${n} - ${perflat === 'per' ? val*100+'%' : Intl.NumberFormat('en-us', {notation: 'standard', style: 'currency', currency: 'NGN'}).format(val)}</p>
                                        <button type="button" class="ui" data-prop="${n}">
                                            <ion-icon name="ellipsis-vertical-outline"></ion-icon>
                                        </button>
                                    </div>
                                `);
                                //add <option>s to appropriate rollform
                                if (!ix) {   //dedn form
                                    rollforms[1].querySelector('select').insertAdjacentHTML('afterbegin',`<option value="${val}">% of ${n}</option>`);
                                }
                                //edit .prll
                                const prll = document.querySelectorAll('.prll');
                                prll.forEach(prll => {
                                    prll.querySelectorAll('button').forEach(btn => {
                                        btn.addEventListener('click', (e) => {
                                            const x = btn.getBoundingClientRect().left;
                                            const y = btn.getBoundingClientRect().y;
                                            edrem.style.left = x - 60 + 'px';
                                            edrem.style.top = y + 40 + 'px';
                                            sett = btn.getAttribute('data-prop');
                                            edrem.showPopover();
                                        });
                                    });
                                });
                            }
                            //options: edit | remove earn or dedn
                            edrem.querySelectorAll('button').forEach(btn => {
                                btn.addEventListener('click', async (e) => {
                                    edrem.hidePopover();
                                    btn.disabled = true;
                                    payelodr.classList.add('on');
    
                                    if (sett in person.payearn) {
                                        const snap = await updateDoc(doc(db, 'ibooks', who.fbid, 'users', who.uid), {[`payearn.${sett}`]: deleteField()});
                                        delete person.payearn[sett];
                                    } else if (sett in person.paydedn) {
                                        const snap = await updateDoc(doc(db, 'ibooks', who.fbid, 'users', who.uid), {[`paydedn.${sett}`]: deleteField()});
                                        delete person.paydedn[sett];
                                    }
                                    // await insertFromPaySetBtns(person);
                                    sessionStorage.setItem('person', JSON.stringify(person));   //not-idb-desgn
                                    payelodr.classList.remove('on');
                                    document.querySelector(`[data-prop="${sett}"]`).closest('.prll').remove();
                                    succeeded("Settings deleted.");
                                    btn.disabled = false;
                                });
                            });
                            //for earnings
                            rollforms.forEach(frm => {
                                frm.addEventListener('submit', async (e) => {
                                    e.preventDefault();
                                    e.submitter.disabled = true;
                                    payelodr.classList.add('on');
        
                                    const fd = new FormData(e.target);
                                    let data_name = e.target.name;
                                    const nm = fd.get('rllname');
                                    const perFlat = Number(fd.get('rlltype'));
                                    const val = Number(fd.get('rllamt'));
                                    let data = {
                                        [nm]: perFlat === 0 ? val : Number((val/100*perFlat).toFixed(4)),
                                    }
                                    // console.log(data_name, data);
                                    try {
                                        const update = await setDoc(doc(db, 'ibooks', who.fbid, 'users', who.uid), { [data_name]: data }, { merge: true });
                                        succeeded('Salary settings updated.');
                                        //populate payearn or paydedn
                                        if (data_name.endsWith('earn')) {
                                            earnOrDedn(0, nm, perFlat, data[nm]);
                                            console.log(person.payearn);
                                            person.payearn ? person.payearn[nm] = data[nm] : person.payearn = { [nm]: data[nm] };
                                        } else {
                                            earnOrDedn(1, nm, perFlat, data[nm]);
                                            person.paydedn ? person.paydedn[nm] = data[nm] : person.paydedn = { [nm]: data[nm] };
                                        }
                                        //insert into idb
                                        // await insertFromPaySetBtns(person);
                                        sessionStorage.setItem('person', JSON.stringify(person));   //not-idb-desgn
                                    } catch (err) {
                                        console.log(err);
                                        notify("Server error.", "alert-circle-outline");
                                    } finally {
                                        e.submitter.disabled = false;
                                        payelodr.classList.remove('on');
                                    }
                                });
                            });
                            
                            //clone template 2
                            temp2 = [...foils[1].children];
                        }
                    }
                    /*
                    async function insertFromPaySetBtns(creature) {
                        let eodTX = idb.transaction('mgr', 'readwrite');
                        eodTX.oncomplete = (e) => {
                            console.log("Saved in idb.");
                        }
                        eodTX.onerror = (err) => {
                            console.log(err);
                        }
                        let eStore = eodTX.objectStore('mgr');
                        let eStoreReq = eStore.put(creature);
                        eStoreReq.onsuccess = (e) => console.log("Succeeded updating 'person'.")
                        eStoreReq.onerror = (err) => console.log(err);
                    }
                    */
                    //bak btns
                    const baks = document.querySelectorAll('button.bak');
                    baks.forEach((bak, dx) => {
                        bak.addEventListener('click', (e) => {
                            switch(dx) {
                                case 0:
                                    foils.forEach((foil, ndx) => foil.classList.toggle('on', !ndx));
                                    break;
                                case 1:
                                    if (bak.closest('.surround')) {
                                        bak.closest('.surround').classList.replace('on', 'ons')
                                        return;
                                    }
                                    foils[1].querySelectorAll('div').forEach((div, ddx) => div.classList.toggle('on', ddx));
                                    break;
                                case 2:
                                    if (bak.closest('.surround')) {
                                        bak.closest('.surround').classList.replace('ons', 'on')
                                        return;
                                    }
                                    foils[1].querySelectorAll('div').forEach((div, ddx) => div.classList.toggle('on', !ddx));
                                    break;
                            }
                        });
                    });
                });
            });
            // set whether manager or auth selection
            let quoIndex = 0, quoval;
            document.querySelector('select#is').addEventListener('change', (e) => {
                quoIndex = e.target.selectedIndex;
                quoval = e.target.value;
            });
            // add new officers
            document.querySelector('button.add').onclick = () => {
                //show "nwofr" popover
                document.getElementById('nwofr').showPopover();
                const dforms = document.forms;
                dforms.namedItem('nwofr').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    e.submitter.disabled = true;
                    lodr.showPopover();
                    // validate no. of officers
                    let u = officers.docs.filter(o => o.is === quoval.split('').map(m => m.codePointAt(0)).join('-'));
                    console.log(u);
                    if (who.ibooks.quoMgrAuth[quoIndex] <= u.length) {
                        alert("Exceeded quota.");
                    } else {
                        const fd = new FormData(e.target);
                        let data = who;
                        for (const [k, v] of fd.entries()) {
                            data[k] = v;
                        }
                        data['is'] = data.is.split('').map(m => m.codePointAt(0)).join('-');
                        data['creatOn'] = Timestamp.fromDate(new Date(Date.now()));
                        data['lastMod'] = serverTimestamp();
                        data['bg'] = userColor();
                        data['pbk'] = pbk(data.email + pkey());
                        data['rank'] = Number(fd.get('rank'));
                        // firebaseConfig = mainConfig;
                        const snap = await addDoc(collection(db, 'ibooks', who.fbid, 'users'), data);
                        const snap2 = await updateDoc(doc(db, 'ibooks', who.fbid), { pbk: arrayUnion(data.pbk) });
                        // insert officer into indexedDB
                        e.submitter.disabled = false;
                        lodr.hidePopover();
                        e.target.closest('[popover]').hidePopover();
                        succeeded('New officer added.');
                        addOfficerToDOM([data]);
                    }
                });
            }
        }
        //card popover
        const fuldash = document.getElementById('fuldash');
        cards.forEach((card, ix) => {
            card.addEventListener('click', (e) => {
                const x = Object.values(cardVals)[ix];
                document.getElementById('dshttl').textContent = Object.keys(cardVals)[ix];
                document.getElementById('output').innerHTML = ix ? `&#8358 ${x}` : `${x} humans`;
                fuldash.showPopover();
            });
        });
    }
}

//format number as currency

// const number = 18000;
// const f = new Intl.NumberFormat('en-us', {notation: 'compact'});
// console.log(f.format(number))