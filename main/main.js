export const ssid = sessionStorage.getItem('ssid');
window.addEventListener('message', (e) => {
    if (e.data.navigable) {
        //navigate pages
        document.querySelectorAll('#nav_menu > a').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                location.href = e.target.href;  // isDashboard is unused
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