//pick photo
const note = document.getElementById('note');
document.getElementById('file').addEventListener('click', (e) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
        const file = input.files[0];
        try {
            if (file.type.startsWith('image/')) {
                if (file.size > 204800) {
                    throw new Error('Max file size exceeded.');
                } else {
                    const fr = new FileReader();
                    fr.onloadend = () => {
                        const res = fr.result;
                        document.getElementById('img').style.backgroundImage = `url('${res}')`;
                    }
                    fr.readAsDataURL(file);
                }
            } else {
                throw new Error(`Unsupported file (${file.type}).`);
            }
        } catch (error) {
            note.querySelector('span').textContent = error.message;
            note.showPopover();
        } finally {
            const sid = setTimeout(() => {
                note.hidePopover();
                clearTimeout(sid);
            }, 5000);
        }
        
    }
    input.click();
});
//all forms
const forms = document.forms;
//edit profile
let upd;
const lodr = document.getElementById('lodr');
const verifyPop = document.getElementById('verify'), profilePop = document.getElementById('profile');
const editProfBtn = document.querySelector('#editBtn');
editProfBtn.onclick = () => {
    if (!upd) {
        //get upass from backend and assign it to upd
        lodr.style.display = 'flex';
        setTimeout(() => {
            upd = 'mypass';
            lodr.style.display = 'none';
        }, 3000);
    }
    verifyPop.showPopover();
}
//vfy form
forms.namedItem('vfy').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = e.target.children[0].value;
    try {
        if (pass === upd) {
            profilePop.showPopover();
        } else {
            throw new Error("Wrong password.");
        }
    } catch (error) {
        notify(e.submitter, error.message);
    } finally {
        e.target.reset();
    }
});
//edit form
forms.namedItem('edit').addEventListener('submit', (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    const fd = new FormData(e.target);
    for (const [a, b] of fd.entries()) {
        console.log(a, b)
    }
    e.submitter.disabled = false;
});
//new manager form
let managers = new Array(3).fill(0);
let planMgrs = 3;
forms.namedItem('newmgr').addEventListener('submit', (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    if (managers.length === planMgrs) {
        notify(e.submitter, 'Maximum managers reached.');
    } else {
        const fd = new FormData(e.target);
        const pwd = fd.getAll('upass');
        if (pwd[0] !== pwd[1]) {
            notify(e.submitter, 'Password mismatch.');
            return;
        }
        for (const [a, b] of fd.entries()) {
            console.log(a, b)
        }
    }
    e.submitter.disabled = false;
});
function notify(submitter, err) {
    note.querySelector('span').textContent = err;
    note.showPopover();
    const sid = setTimeout(() => {
        note.hidePopover();
        // document.querySelector('#newmgr').showPopover();
        submitter.disabled = false;
        clearTimeout(sid);
    }, 3000);
}
//view pwds
const eyeds = document.querySelectorAll('.eyed');
eyeds.forEach(eye => {
    eye.onclick = () => {
        const input = eye.previousElementSibling;
        input.type === 'text' ? input.setAttribute('type', 'password') : input.setAttribute('type', 'text');
    }
});