import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, addDoc, doc, collection, deleteField, getDoc, getDocs, setDoc, getAggregateFromServer, getCountFromServer, increment, orderBy, limit, startAfter, writeBatch, sum, updateDoc, query, where, and, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { userColor, pkey, banks, datePeriod, projectConfigs } from "../../lb/wc.js";
import { ssid } from "../../main/main.js";

if (ssid) {
    let app, db, datum = [];
    //open idb
    let/* idb = null,*/ person = null, empID, gross;
    let yr = new Date().getFullYear().toString();
    let mnth = new Date().getMonth();
    const aside = document.querySelectorAll('aside');
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
    const _enum = document.getElementById('enum');
    const enumBtns = _enum.querySelectorAll('button');
    
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
    function lodasd(bool) {
        aside[0].classList.toggle('on', bool);
    }
    lodasd(true);
    const allSnap = await getCountFromServer(collection(db, 'ibooks', person.fbid, yr));
    let all = allSnap.data().count;
    
    let start, end, dataNow, pages = 0, lastSnapped = null, eq, visiblePage = 0;
    const page_limit = 2;
    async function getData() {
        if (!navigator.onLine) return;
        lodasd(true);
        lastSnapped ? eq = query(collection(db, 'ibooks', person.fbid, yr), orderBy('ename'), startAfter(lastSnapped), limit(page_limit)) : eq = query(collection(db, 'ibooks', person.fbid, yr), orderBy('ename'), limit(page_limit));
        const empRef = await getDocs(eq);
        lastSnapped = empRef.docs[empRef.docs.length - 1];
        if (empRef.size) {
            empRef.docs.forEach(f => datum.push(f.data()));
            //formula for pagination: start=visiblePage-1*page_limit, end=page_limit * visiblePage
            addEmployees('next');
        } else {
            notify('alert-circle-outline', 'No record.');
        }
        lodasd(false);
        console.log("Data from server.");
    }
    await getData();

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
    function addEmployees (move_page) {
        move_page === 'previous' ? visiblePage-- : visiblePage++;
        start = (visiblePage-1) * page_limit, end = page_limit * visiblePage;
        dataNow = datum.slice(start, end);
        pages = Math.ceil(all/2);

        // clear DOM
        const tds = document.querySelectorAll('.td');
        if (tds.length) tds.forEach(td => td.remove());
        // insert DOM
        dataNow.forEach(v => {
            contnt.insertAdjacentHTML('beforeend', `
                <div class="td">
                    <span data-abbr="${v.ename[0][0]}">${v.ename.join(' ')}</span>
                    <span>${Intl.NumberFormat('en-US', {notation: 'standard'}).format(v.gpm)}</span>
                    <span>${Intl.NumberFormat('en-US', {notation: 'standard'}).format(v.earn)}</span>
                    <span>${Intl.NumberFormat('en-US', {notation: 'standard'}).format(v.dedn)}</span>
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
                empID = dataNow[ix].id, gross = dataNow[ix].gpm;
                emp.textContent = dataNow[ix].ename.join(' ');
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
        _enum.querySelector('span').innerHTML = `Page <i>${visiblePage}</i> of ${pages}`;
    }
    //pagination
    enumBtns.forEach((btn, idx) => {
        btn.addEventListener('click', async (e) => {
            btn.disabled = true;
            if (idx && visiblePage < pages) {  //idx here stands for chevron-forward
                datum.length < all ? await getData() : addEmployees('next');
            } else if (!idx && visiblePage > 1) {
                addEmployees('previous');
            }
            btn.disabled = false;
        });
    });
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
        const selected = datum.filter(({id}) => id === empID)[0];
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
    const expiredPop = document.querySelector('#expired');
    let expiredEarn = [], expiredDedn = [];
    let txt = [], expEarn = 0, expDedn = 0;
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
            let {earn, dedn, xen=null, xdn=null} = data;
            bookearn = Object.assign(bookearn, earn?.[mnth] || {});
            bookdedn = Object.assign(bookdedn, dedn?.[mnth] || {});
            extraPaye(bookearn, xen, 0), extraPaye(bookdedn, xdn, 1);
            // console.log(bookearn, bookdedn);
            netDiv.querySelector('span').innerHTML = '&#8358;' + setInDOM(bookearn, bookdedn, gross);
            [menuBtn, mnthMenu.nextElementSibling].forEach(elem => elem.style.pointerEvents = 'all');
        } catch (err) {
            console.error(err);
        } finally {
            board.classList.remove('on');   //loader
            // console.log(expiredEarn, expiredDedn);
            txt = [], expEarn = 0, expDedn = 0;
            if (expiredEarn.length) {
                expiredEarn.forEach(exp => {
                    expEarn += exp[1];
                    txt.push(exp[0]);
                });
            }
            if (expiredDedn.length) {
                expiredDedn.forEach(exp => {
                    expDedn += exp[1];
                    txt.push(exp[0]);
                });
            }
            let tense = txt.length > 1 ? 1 : 0; //singular=0, plural=1
            expiredPop.querySelector('p').innerHTML = `<span>${txt.join(', ').toUpperCase()}</span> ${['has','have'][tense]} been achieved. You must remove ${['it','them'][tense]}, else ${['it','they'][tense]} will be factored in the next payroll.`;
            expiredPop.showPopover();
            console.log(expEarn, expDedn);
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
        //calculate extra paye
        function extraPaye (type, val, idfyer) {
            if (val) {
                for (const x in val) {
                    if (val[x][1] < Date.now()) {   //meaning the paye has NOT expired
                        type[x] = val[x][0];
                    } else {
                        if (idfyer) {
                            expiredEarn.push([x, val[x][0]]);
                        } else {
                            expiredDedn.push([x, val[x][0]]);
                        }
                    }
                }
            }
        }
        //update expired paye
        const expiredWrap = expiredPop.querySelector('.wrap');
        const expiredBtns = expiredWrap.querySelectorAll('button');
        expiredBtns[1].addEventListener('click', async (e) => {
            expiredBtns.forEach(btn => btn.disabled = true);
            expiredWrap.classList.add('on');

            try {
                const batch = writeBatch(db);
                //update main earn and dedn
                batch.update(doc(db, 'ibooks', person.fbid, yr, empID), {'earn': increment(-expEarn), 'dedn': increment(-expDedn)});
                //update paye extra earn and dedn
                txt.forEach(t => {
                    batch.update(doc(db, 'ibooks', person.fbid, yr, empID, 'paye', empID), {})
                });
                await batch.commit();
                expiredWrap.classList.replace('on','fin');
            } catch (err) {
                console.log(err);
            } finally {
                expiredBtns.forEach(btn => btn.disabled = false);
                
            }
        });
    }
}
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