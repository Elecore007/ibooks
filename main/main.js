export const ssid = sessionStorage.getItem('ssid');
export const defImg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" stroke="%23FFF" class="ionicon" viewBox="0 0 512 512"><path d="M344 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55 35-96 88-96s92 42 88 96z" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path d="M256 304c-87 0-175.3 48-191.64 138.6C62.39 453.52 68.57 464 80 464h352c11.44 0 17.62-10.48 15.65-21.4C431.3 352 343 304 256 304z" fill="none" stroke-miterlimit="10" stroke-width="32"/></svg>';
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
                // lodr.showPopover();
                switch (idx) {
                    case 0:
                        location.href = location.origin + '/p/d/profile.html';
                        break;
                    case 1:
                        console.log("View plan href.");
                        break;
                    case 2:
                        sessionStorage.removeItem('ssid');
                        sessionStorage.removeItem('person');
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