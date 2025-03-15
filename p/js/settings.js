import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, addDoc, doc, collection, getDoc, getDocs, setDoc, getAggregateFromServer, getCountFromServer, increment, orderBy, runTransaction, sum, updateDoc, query, where, and, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { userColor, pkey, banks, datePeriod, projectConfigs } from "../../lb/wc.js";
import { ssid } from "../../main/main.js";

if (ssid) {
    let app, db, employees;
    //open idb
    let idb = null, person = null, empID, gross;
    let yr = new Date().getFullYear().toString();
    let mnth = new Date().getMonth();
    const lodr = document.getElementById('lodr');
    const note = document.querySelector('.note');
    const contnt = document.getElementById('content');
    const board = document.getElementById('board');
    const mnthMenu = document.getElementById('mnth');
    const lis = mnthMenu.querySelectorAll('menu > li');
    const menuBtn = mnthMenu.previousElementSibling;
    const netDiv = document.getElementById('net');
    const emp = document.getElementById('emp');
    const fsc = netDiv.nextElementSibling;
    const newpaye = document.querySelector('#newpaye');
    const roll = document.querySelector('[popover]#roll');
    const payetype = document.querySelector('#payetype');
    
    person = JSON.parse(sessionStorage.getItem('person'));  //not-idb-desgn

    let obj = {navigable: true, profile: [person.user, person.is]};
    window.postMessage(obj, obj);

    const fbConfig = JSON.parse(person.cfg);
    app = initializeApp(fbConfig);
    db = getFirestore(app);

    function notify(ico, txt) {
        note.querySelector('ion-icon').setAttribute('name', ico);
        note.querySelector('span').textContent = txt;
        note.classList.add('on');
        setTimeout(() => {
            note.classList.remove('on');
        }, 4500);
    }

    const empRef = await getDocs(collection(db, 'ibooks', person.fbid, yr), orderBy('ename'));
    if (empRef.size) {
        //add employees to DOM
        // addEmployeeDOM(employees);
        employees = empRef.docs.map(m => {
            return {'id': m.id, ...m.data()}
        });
        addEmployeeDOM(employees);    //not-idb-desgn
    } else {
        // notify('alert-circle-outline', 'No record.');
    }

        //listener for toggling payslip popover
        const resz = document.querySelectorAll('.resz');
        window.addEventListener('resize', () => resizePop());
        function resizePop () {
            resz.forEach(resz => {
                resz.ontoggle = (e) => {
                    resz.style.left = resz.previousElementSibling.getBoundingClientRect().right - e.target.clientWidth + 'px';
                    resz.style.top = resz.previousElementSibling.getBoundingClientRect().y + 50 + 'px';
                };
            });
        };
        roll.addEventListener('toggle', (e) => {
            if (e.oldState === 'closed') {
                resizePop();
            } else {
                [emp, netDiv.querySelector('span'), ...document.querySelectorAll('#payearn, #paydedn')].forEach(elem => elem.innerHTML = '');
            }
            [menuBtn, mnthMenu.nextElementSibling].forEach(elem => elem.style.pointerEvents = 'none');
        });
        let newIdx;
        function addEmployeeDOM (arr) {
            //add to DOM
            arr.forEach(v => {
                contnt.insertAdjacentHTML('beforeend', `
                    <div class="td">
                        <span data-abbr="${v.ename[0][0]}">${v.ename.join(' ')}</span>
                        <span>${v.gender}</span>
                        <span>${v.dept}</span>
                        <span>${v.post}</span>
                    </div>
                `);
            });
            //add handler for <li> months
            lis.forEach((li, ix) => {
                li.onclick = async (e) => {
                    await enterPayslip(ix);
                    // lis.forEach(lin => lin.classList.toggle('on', li == lin));
                }
            })
            //add handler for .td
            document.querySelectorAll('.td').forEach((td, ix) => {
                td.onclick = async function () {
                    empID = arr[ix].id, gross = arr[ix].gpm;
                    // console.log(empID, arr[ix].gpm);
                    emp.textContent = arr[ix].ename.join(' ');
                    fsc.textContent = `Fiscal Yr: ${yr}`;
                    roll.showPopover();
                    await enterPayslip(mnth);
                }
            });
            //add handler for extra earning or deduction
            document.querySelectorAll('#earded > menu > li > button').forEach((btn, btx) => {
                btn.addEventListener('click', (e) => {
                    if (btx) {
                        //initiate paydedn
                        setPaye('PAYE Deductions', person.paydedn, btx);
                    } else {
                        //initiate payearn
                        setPaye('PAYE Earnings', person.payearn, btx);
                    }
                    newpaye.showPopover();
                });
            });
        }
        function setPaye (txt, type, btx) {
            newIdx = btx;
            newpaye.querySelector('.nghd > span').textContent = txt;
            payetype.querySelectorAll(':not([data-def])').forEach(opt => opt.remove());
            Object.keys(type).forEach(k => payetype.insertAdjacentHTML('beforeend', `<option value="${k}">${k}</option>`));
        }
        //reset newpaye form
        newpaye.addEventListener('toggle', (e) => {
            if (e.oldState === 'closed') {
                newpaye.querySelector('form').reset();
                newpaye.querySelector('form input#other').toggleAttribute('readonly', true);
            }
        });
        //payetype <select> handler
        payetype.addEventListener('change', (e) => {
            newpaye.querySelector('form input#other').toggleAttribute('readonly', e.target.value.toLowerCase() !== 'new');
        });
        //newpaye form handler
        newpaye.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();
            e.submitter.disabled = true;
            lodr.showPopover();

            const fd = new FormData(e.target);
            let data = {}, u = {}, main;
            const amt = [Number(fd.get('amt')), Date.now() + (1000 * 3600 * 24 * 31 * fd.get('dur'))];
            if (fd.get('payetype').toLowerCase() === 'new') {
                u[fd.get('other')] = amt; 
            } else {
                u[fd.get('payetype')] = amt;
            }
            const selected = employees.filter(({id}) => id === empID)[0];
            if (!newIdx) {   //new earnings
                data['xen'] = u;
                main = amt[0] + selected.earn;
            } else {
                data['xdn'] = u;
                main = amt[0] + selected.dedn;
            }

            //update backend documents
            try {
                await updateDoc(doc(db, 'ibooks', person.fbid, yr, selected.id), {
                    'earn': !newIdx ? main : selected.earn,
                    'dedn': newIdx ? main : selected.dedn
                });
                await setDoc(doc(db, 'ibooks', person.fbid, yr, selected.id, 'paye', selected.id), {[!newIdx ? 'xen' : 'xdn']: u}, {merge: true});
                newpaye.hidePopover();
                roll.hidePopover();
                notify('checkmark-outline', `PAYE ${!newIdx ? 'Earnings' : 'Deductions'} updated.`);
            } catch (err) {
                console.log(err);
                notify('alert-circle-outline', 'Server error.');
            } finally {
                e.submitter.disabled = false;
                lodr.hidePopover();
            }
            //update idb
        });
        //set up payslip
        async function enterPayslip (m) {
            board.classList.add('on');  //loader
            lis.forEach((li, ix) => li.classList.toggle('on', ix === m));
            menuBtn.querySelector('span').textContent = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][m];
            //check backend for data
            try {
                const statRef = await getDoc(doc(db, 'ibooks', person.fbid, yr, empID, 'paye', empID));
                let data = statRef.data();
                data['id'] = empID;
                let bookearn = person.payearn, bookdedn = person.paydedn;
                let {earn, dedn} = data;
                bookearn = Object.assign(bookearn, earn?.[mnth] || {});
                bookdedn = Object.assign(bookdedn, dedn?.[mnth] || {});
                // console.log(bookearn, bookdedn);
                netDiv.querySelector('span').innerHTML = '&#8358;' + setInDOM(bookearn, bookdedn, gross);
                [menuBtn, mnthMenu.nextElementSibling].forEach(elem => elem.style.pointerEvents = 'all');
            } catch (err) {
                console.error(err);
            } finally {
                board.classList.remove('on');   //loader
            }
            //calculate earn and dedn breakdown
            function setInDOM (ea, de, gp) {
                document.querySelectorAll('#payearn, #paydedn').forEach(elem => elem.innerHTML = '');
                let en = 0, dn = 0, ex = Object.entries(ea), dx = Object.entries(de);
                // console.log(ex, dx);
                if (ex.length) {
                    en = ex.map(m => {
                        let out = m[1] > 2 ? m[1] : m[1]*gp;
                        document.getElementById('payearn').insertAdjacentHTML('beforeend', `<span>${m[0]}</span><span>&#8358; ${Intl.NumberFormat('en-us', { notation: 'standard' }).format(out)}</span>`);
                        return out;
                    }).reduce((acc, val) => acc + val);
                }
                if (dx.length) {
                    dn = dx.map(m => {
                        let out = m[1] > 2 ? m[1] : m[1]*gp;
                        document.getElementById('paydedn').insertAdjacentHTML('beforeend', `<span>${m[0]}</span><span>&#8358; ${Intl.NumberFormat('en-us', { notation: 'standard' }).format(out)}</span>`);
                        return out;
                    }).reduce((acc, val) => acc + val);
                }
                return en - dn;
                // return en.reduce((acc, val) => acc + val) - dn.reduce((acc, val) => acc + val); //netpay                       
            }
        }
}

// const mainConfig = {
//set height of content area
// const content = document.querySelector('#content');
// content.style.height = content.clientHeight + 'px';
//set slider nav
/*
const slider = document.getElementById('slider');
document.querySelectorAll('#pages > button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        try {
            document.querySelector('#pages > button.on').classList.remove('on');
        } catch (err) {
            false
        } finally {
            btn.classList.add('on');
            slider.style.width = btn.clientWidth + 'px';
            slider.style.left = e.target.offsetLeft + 'px';
        }
    });
});
*/