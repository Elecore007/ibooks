import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, addDoc, doc, collection, getDoc, getDocs, setDoc, getAggregateFromServer, getCountFromServer, increment, runTransaction, sum, updateDoc, query, where, and, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { userColor, pkey, banks, datePeriod, projectConfigs } from "../../lb/wc.js";
import { ssid } from "../../main/main.js";

if (ssid) {
    let app, db;
    //open idb
    let idb = null, person = null, empID;
    let yr = new Date().getFullYear().toString();
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
                alert("Get Employee Transaction failed.");
                console.log(err);
            }
            let txeStore = txe.objectStore('wkr');
            let Req = txeStore.getAll();
            Req.onsuccess = (e) => {
                const res = e.target.result;

                //add employees to DOM
                addEmployeeDOM(res);
            }
            Req.onerror = (err) => {
                console.log(err);
            }
        }

        const contnt = document.getElementById('content');
        const mnthMenu = document.getElementById('mnth');
        const lis = mnthMenu.querySelectorAll('menu > li');
        const menuBtn = mnthMenu.previousElementSibling;
        const netDiv = document.getElementById('net');
        let mnth = new Date().getMonth();

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
            //add handler for li
            lis.forEach((li, ix) => {
                li.onclick = async (e) => {
                    await enterPayslip(ix);
                    // lis.forEach(lin => lin.classList.toggle('on', li == lin));
                }
            })
            //add handler
            document.querySelectorAll('.td').forEach((td, ix) => {
                td.onclick = async function () {
                    empID = arr[ix].id;
                    document.querySelector('[popover]#roll').showPopover();
                    await enterPayslip(mnth);
                }
            });
        }
        //set up payslip
        async function enterPayslip (m) {
            lis.forEach((li, ix) => li.classList.toggle('on', ix === m));
            menuBtn.querySelector('span').textContent = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][m];
            //check idb for data
            let statTX = idb.transaction('stat', 'readwrite');
            statTX.oncomplete = (e) => {
                console.log("Transaction to get 'STATS' successful.");
            }
            statTX.onerror = (err) => {
                console.log(err);
            }
            let statStore = statTX.objectStore('stat');
            let statReq = statStore.get(empID);
            statReq.onsuccess = async (e) => {
                console.log("Successfully retrieved stat.");
                const res = e.target.result;
                console.log(res);
                if (res) {
                    //run earn/dedn function
                    const {earn, dedn} = res;
                    netDiv.querySelector('span').innerHTML = '&#8358;' + setInDOM(earn, dedn);
                } else {
                    //check backend for data
                    const statRef = await getDoc(doc(db, 'ibooks', person.fbid, yr, empID, 'paye', empID));
                    let data = statRef.data();
                    data['id'] = empID;
                    statTX = idb.transaction('stat', 'readwrite');
                    statTX.oncomplete = (e) => {
                        console.log("Transaction to get 'STATS' successful.");
                    }
                    statTX.onerror = (err) => {
                        console.log(err);
                    }
                    statStore = statTX.objectStore('stat');
                    let addReq = statStore.add(data);
                    addReq.onsuccess = (e) => {
                        //run earn/dedn function
                        console.log(data);
                        const {earn, dedn} = data;
                        netDiv.querySelector('span').innerHTML = '&#8358;' + setInDOM(earn, dedn);
                        console.log("Added stat successfully.");
                    }
                    addReq.onerror = (err) => console.error(err);
                }
            }
            statReq.onerror = (err) => {
                console.error(err);
            }
            //calculate earn and dedn breakdown
            function setInDOM (ea, de) {
                let en = ea[mnth].map(m => { 
                    document.getElementById('payearn').insertAdjacentHTML('beforeend', `<span>${Object.keys(m)[0]}</span><span>&#8358;${Intl.NumberFormat('en-us', { notation: 'standard' }).format(Object.values(m)[0])}</span>`);
                    return Object.values(m)[0];
                });
                let dn = de[mnth].map(m => {
                    document.getElementById('paydedn').insertAdjacentHTML('beforeend', `<span>${Object.keys(m)[0]}</span><span>&#8358;${Intl.NumberFormat('en-us', { notation: 'standard' }).format(Object.values(m)[0])}</span>`);
                    return Object.values(m)[0];
                });
                console.log(en.reduce((acc, val) => acc + val), dn.reduce((acc, val) => acc + val));
                return en.reduce((acc, val) => acc + val) - dn.reduce((acc, val) => acc + val);
                // document.getElementById('paydedn');                        
            }
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