export const ssid = sessionStorage.getItem('ssid');
window.addEventListener('message', (e) => {
    if (e.data.navigable) {
        //profile DOM
        let [usr, is] = e.data.profile;
        is = is.split('-').map(m => String.fromCodePoint(m)).join('');
        document.querySelectorAll('#portrait > div > span, #portrait > div > small').forEach((elem, edx) => {
            elem.textContent = [usr, is][edx];
        });
        //navigate pages
        document.querySelectorAll('#nav_menu > a').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                location.href = e.target.href;  // isDashboard is unused
            });
        });
        //edit profile, view plan, logout btns
        document.querySelectorAll('#bft > button').forEach((btn, idx) => {
            btn.addEventListener('click', (e) => {
                btn.disabled = true;
                lodr.showPopover();
                switch (idx) {
                    case 0:
                        console.log("Edit profile href.");
                        break;
                    case 1:
                        console.log("View plan href.");
                        break;
                    case 2:
                        sessionStorage.removeItem('ssid');
                        location.replace('../../index.html');
                        break;
                    default:
                        alert("Fraud detected.");
                }
            });
        });
    }
});
//toggler function
function toggler(e, v, force=true) {
    e.classList.toggle(v, force);
}
//search btn
const pages = document.querySelector('#pages');
const searchInput = document.querySelector('#sfm > form > input');
document.querySelector('#sfm > ion-icon').onclick = () => searchInput.focus();
searchInput.addEventListener('blur', () => toggler(pages, 'off', false));
searchInput.addEventListener('focus', () => toggler(pages, 'off'));
//reveal aside2
const aside = document.querySelectorAll('aside');
const moreBtn = document.querySelector('button.more');
moreBtn.onfocus = () => toggler(aside[1], 'on');
moreBtn.onblur = () => toggler(aside[1], 'on', false);
let sdb;
aside[1].querySelectorAll('button[title]').forEach((btn, btx) => btn.addEventListener('click', ()=> {
    if (btn.getAttribute('data-ctx') === 'sync') {
        console.log("Sync working...");
    } else {
        alert("No update yet.");
    }
}));
//toggle nav menu
const nav = document.querySelector('nav');
const menuBtn = document.querySelector('button.menu');
menuBtn.onclick = () => toggler(nav, 'on');
document.querySelectorAll('#bkdp, #app > button').forEach(btn => btn.onclick = () => toggler(nav, 'on', false));