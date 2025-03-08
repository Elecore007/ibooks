//set height of content area
// const content = document.querySelector('#content');
// content.style.height = content.clientHeight + 'px';
//set slider nav
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