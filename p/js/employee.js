import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, addDoc, doc, collection, getDocs, setDoc, getAggregateFromServer, getCountFromServer, increment, runTransaction, sum, updateDoc, query, where, limit, startAfter, and, Timestamp, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
// import { getStorage, getDownloadURL, getBlob, ref, uploadBytes, uploadBytesResumable, uploadString } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";
import { userColor, pkey, banks, datePeriod, projectConfigs } from "../../lb/wc.js";
import { ssid, defImg } from "../../main/main.js";

let app, db;

const _enum = document.getElementById('enum');
const enumBtns = _enum.querySelectorAll('button');
const aside = document.querySelectorAll('aside');

let empIdx = 0, empID;

//get ibooks config
if (ssid) {
    const mainNote = document.querySelector('main > .note');
    const delpop = document.querySelector('#delpop');
    const sections = document.querySelectorAll('section');
    const imgIcons = document.querySelectorAll('.umg');     //manager icon, employee icon
    function notify(ico, txt) {
        mainNote.querySelector('ion-icon').setAttribute('name', ico);
        mainNote.querySelector('span').textContent = txt;
        mainNote.classList.add('on');
        setTimeout(() => {
            mainNote.classList.remove('on');
        }, 4500);
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
    let person = null, idb = null, yr, datum = [];
    person = JSON.parse(sessionStorage.getItem('person'));  //not-idb-desgn
    yr = datePeriod(Date.now()).getFullYear().toString();

    let obj = {navigable: true, profile: [person.user, person.is]};
    window.postMessage(obj, obj);
    
    const fbConfig = JSON.parse(person.cfg);
    app = initializeApp(fbConfig);
    db = getFirestore(app);

    function lodasd(bool) {
        aside[0].classList.toggle('on', bool);
    }
    lodasd(true);
    const allSnap = await getCountFromServer(collection(db, 'ibooks', person.fbid, yr));
    const all = allSnap.data().count;
    
    // personReady(person);
    let pages = 0;
    let lastSnapped = null, eq, visiblePage = 0;
    const page_limit = 2;
    async function getData() {
        lodasd(true);
        lastSnapped ? eq = query(collection(db, 'ibooks', person.fbid, yr), orderBy('ename'), startAfter(lastSnapped), limit(page_limit)) : eq = query(collection(db, 'ibooks', person.fbid, yr), orderBy('ename'), limit(page_limit));
        const empRef = await getDocs(eq);
        lastSnapped = empRef.docs[empRef.docs.length - 1];
        if (empRef.size) {
            // then store copy in indexedDB
            // datum = empRef.docs.map(m => m.data());
            empRef.docs.forEach(f => datum.push(f.data()));
            //formula for pagination: start=visiblePage-1*page_limit, end=page_limit * visiblePage
            addEmployees('next');
        } else {
            notify('alert-circle-outline', 'No record.');
        }
        lodasd(false);
        // console.log("Data from server.");
    }
    await getData();
    //add employees to DOM
    function addEmployees (move_page) {
        sections.forEach(section => section.classList.toggle('on', false));
        move_page === 'previous' ? visiblePage-- : visiblePage++;
        let start = (visiblePage-1) * page_limit, end = page_limit * visiblePage;
        let dataNow = datum.slice(start, end);
        pages = Math.ceil(all/2);
        const book = document.querySelector('aside:nth-child(1) > div');
        //clear DOM
        const tds = book.querySelectorAll('.td');
        if (tds.length) tds.forEach(td => td.remove());
        // insert DOM
        dataNow.forEach(obj => {
            book.insertAdjacentHTML('beforeend', `
                <div class="td">
                <span data-abbr="${obj.ename[1].slice(0,1)}">${obj.ename.join(' ')}</span>
                <span>${obj.gender}</span>
                <span>${obj.dept}</span>
                <span>${obj.post}</span>
                </div>
                `);
            });
            // attach their handlers
            book.querySelectorAll('.td').forEach((td, ix) => {
                td.onclick = (e) => {
                    empIdx = ix; //Is this even useful again???
                    const tdOn = book.querySelector('.td.on');
                    if (tdOn) tdOn.classList.remove('on');
                    // set edit mode and populate form
                    let {ename, img=defImg, gender, dept, post, resume, id, city, state, level, step, gpm, bank, acct, uid} = dataNow[ix];
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
                // console.log('img', img, 'empID', empID);
                insertEmployeeDetails(obj0, img);
                employeeFormMode('person-outline','Edit Employee', 'edit', obj1);
                [td, ...sections].forEach((elem, idx) => elem.classList.toggle('on', idx === 2 ? false : true));
            }
        });
        // set pages
        _enum.querySelector('span').innerHTML = `Page <i>${visiblePage}</i> of ${pages}`;
    }
    // continues from main
    const employee_form = document.querySelector('#employee_form');
    //insert banks
    banks.forEach(bank => {
        employee_form.querySelector('[data-name="Bank"] > select').insertAdjacentHTML('beforeend', `
            <option value="${bank}">${bank}</option>
        `);
    });
    //custom event for visiblePage max-reached
    // const event = new CustomEvent('custom:visible_page');
    //pagination
    enumBtns.forEach((btn, idx) => {
        btn.addEventListener('click', async (e) => {
            btn.disabled = true;
            if (idx && visiblePage < pages) {  //idx here stands for chevron-forward
                datum.length !== all ? await getData() : addEmployees('next');
            } else if (!idx && visiblePage > 1) {
                addEmployees('previous');
            }
            btn.disabled = false;
            // aside[0].querySelector('div').scrollTop = 0;
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
    function insertEmployeeDetails(obj, img) {
        bio.querySelectorAll('div:nth-child(even)').forEach(even => even.textContent = ''); // clear old details
        imgIcons[1].style.backgroundImage = `url('${img}')`;
        obj.forEach((detail, dtx) => {
            //insert name into delpop; then insert details into bio
            if (!dtx) delpop.querySelector('span').textContent = `${detail}'s account?`;
            bio.querySelectorAll('div:nth-child(even)')[dtx].textContent = detail;
        });
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
            // if (!Array.from(person.payearn).length && !Array.from(person.paydedn).length && !JSON.parse(person.structure).length) {
            //     notify('alert-circle-outline', 'No PAYE settings detected.');
            // } else {
                loader(e.submitter);
                let data = Object.create(null);
                const fd = new FormData(e.target);
                const dt = Date.now();
                for (const [k, v] of fd.entries()) {
                    data[k] = v;
                }
                data['gpm'] = gpm || Number(fd.get('gpm'));

                //calculate gpm's breakdown
                let earn = 0, en = {}, dedn = 0, dn = {}, details;
                if (!Array.from(person.payearn).length) {
                    for (const [k, v] of Object.entries(person.payearn)) {
                        en[k] = v;  //greater than 2 signifies it is NOT a percentage
                    }
                    earn = Object.entries(en).map(m => Object.values(m)[1] > 2 ? Object.values(m)[1] : data['gpm']*Object.values(m)[1]).reduce((acc, val) => acc + val);
                }
                if (!Array.from(person.paydedn).length) {
                    for (const [k, v] of Object.entries(person.paydedn)) {
                        dn[k] = v;
                    }
                    dedn = Object.entries(dn).map(m => Object.values(m)[1] > 2 ? Object.values(m)[1] : data['gpm']*Object.values(m)[1]).reduce((acc, val) => acc + val);
                }
                //  && !JSON.parse(person.structure).length) {
                if (earn > 0 && dedn > 0) {
                    details = {
                        'dedn': {
                            [new Date(dt).getMonth()]: dn
                        },
                        'earn': {
                            [new Date(dt).getMonth()]: en
                        }
                    }
                } else {
                    details = {
                        'dedn': {
                            [new Date(dt).getMonth()]: {}
                        },
                        'earn': {
                            [new Date(dt).getMonth()]: {}
                        }
                    }
                }
                data['ename'] = fd.getAll('ename');
                data['earn'] = earn - dedn || gpm;
                data['dedn'] = dedn || null;
                data['lastMod'] = dt;

                if (e.submitter.form.dataset.mode === 'add') {
                    data['creatOn'] = dt;
                    try {
                        const snapAdd = await addDoc(collection(db, 'ibooks', person.fbid, yr), data);
                        await updateDoc(doc(db, 'ibooks', person.fbid, yr, snapAdd.id), { 'id': snapAdd.id });
                        await setDoc(doc(db, 'ibooks', person.fbid, yr, snapAdd.id, 'paye', snapAdd.id), details);

                        data['id'] = snapAdd.id;
                        datum.push(data);
                        all++;
                        addEmployees('next');
                        notify('checkmark-outline', 'New Employee Added.');
                        e.target.reset();
                    } catch (err) {
                        console.log(err);
                        notify('alert-circle-outline', 'Server error.');
                    } finally {
                        loader(e.submitter, !1);
                        e.target.reset();
                    }
                } else if (e.submitter.form.dataset.mode === 'edit') {
                    // Edit mode
                    try {
                        // for (const a of ['level','step']) delete data[a];
                        // console.log(data, details);
                        await updateDoc(doc(db, 'ibooks', person.fbid, yr, empID), data);
                        await updateDoc(doc(db, 'ibooks', person.fbid, yr, empID, 'paye', empID), details);
                        notify('checkmark-outline', 'Employee Updated.');
                    } catch (err) {
                        console.log(err);
                        notify('alert-circle-outline', 'Server error.');
                    } finally {
                        loader(e.submitter, !1);
                        e.target.reset();
                    }
                }
        });
        //choose photo file
        let file;
        const imgPreviewer = document.querySelector('.img');
        document.querySelector('button#file_btn').addEventListener('click', (e) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.addEventListener('change', () => {
                file = input.files[0];
                if (file.size <= 51200) {
                    // mimeType = `.${file.type.split('/').at(-1)}`;
                    if (file.type.startsWith('image/')) {
                        const img = new FileReader();
                        img.onloadend = (f) => {
                            file = f.target.result;
                            imgPreviewer.style.backgroundImage = `url('${file}')`;
                        }
                        img.readAsDataURL(file);
                    } else {
                        alert(`File format (${file.type.split('/').at(-1).toLocaleUpperCase()}) unsupported.`);
                        // notify('alert-circle-outline', `File format (${file.type.split('/').at(-1).toLocaleUpperCase()}) unsupported.`);
                    }
                } else {
                    alert('Max size exceeded.');
                    // notify('alert-circle-outline', 'Max size exceeded.');
                }
            });
        
            input.click();
        });
        //upload photo file
        const picpop = document.querySelector('#picpop');
        document.querySelector('#upload').addEventListener('click', async (e) => {
            if (file) {
                e.target.disabled = true;
                lodr.showPopover();
                // console.log(file, empID);

                try {
                    await updateDoc(doc(db, 'ibooks', person.fbid, yr, empID), {img: file});
                    picpop.hidePopover();
                    imgPreviewer.style.backgroundImage = 'none';
                    notify('checkmark-outline', 'Employee photo updated.');
                    imgIcons[1].style.backgroundImage = file;    
                } catch (err) {
                    console.log(err);
                    notify('alert-circle-outline', 'Offline error.');
                } finally {
                    lodr.hidePopover();
                }
            } else {
                picpop.hidePopover();
                notify('alert-circle-outline', 'First choose a photo.');
                const toid = setTimeout(() => {
                    picpop.showPopover();
                    clearTimeout(toid);
                }, 4000);
            }
        });
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
        loader(e.target);
        try {
            let fbTX = await runTransaction(db, async (tranx) => {
                await tranx.delete(doc(db, 'ibooks', person.fbid, yr, empID, 'paye', empID)); //subColl
                await tranx.delete(doc(db, 'ibooks', person.fbid, yr, empID));    //parentColl
            });
            loader(e.target, !1);
            delpop.hidePopover();
            notify('checkmark-outline', 'Employee deleted.');
        } catch (err) {
            console.log(err);
            notify('alert-circle-outline', 'Server error.')
        } finally {
            loader(e.target, !1);
        }
    });
} else {
    notify('alert-circle-outline', 'Permission denied.');
}