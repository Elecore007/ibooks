const userColor = function () {
    const rnd = Math.floor(Math.random() * 8);
    return `bg${rnd}`;
    // return ['#663399','#b8860b55','#b8860b','#1a73e8','#1a73e855','#009578','#006f59','#ffa500'][rnd];
}
const pkey = function () {  //12-char long
    let r = parseInt(Math.random() * Number.MAX_SAFE_INTEGER);
    let t = r.toString(36).slice(0, 12).toLocaleUpperCase();
    return t;
}
const datePeriod = function (d) {
    return new Date(d);
}
const banks = [
    "Access Bank",
    "ACCION Bank",
    "AG Mortgage Bank",
    "ASO Savings",
    "Diamond Bank",
    "ECO Bank",
    "First City Monument Bank",
    "Fidelity Bank",
    "First Bank of Nigeria",
    "Guarantee Trust Bank",
    "Heritage Bank",
    "Keystone Bank",
    "Moniepoint",
    "OPAY",
    "Polaris/Skye Bank",
    "Stanbic IBTC Bank",
    "Standard Chartered Bank",
    "Sterling Bank",
    "Union Bank",
    "United Bank for Africa",
    "Unity Bank",
    "WEMA Bank",
    "Zenith Bank"
].sort();
const projectConfigs = [
    {
        apiKey: "AIzaSyDh2pyuGFjr-AtaHXSkSWDM_6R0Z4N-P9Y",
        authDomain: "alpha-bf532.firebaseapp.com",
        projectId: "alpha-bf532",
        storageBucket: "alpha-bf532.firebasestorage.app",
        messagingSenderId: "825246353606",
        appId: "1:825246353606:web:44e39caffb3b94ecf16fc7"
    },
    {
        apiKey: "AIzaSyDOc-fy4ee5P1stiTurRW7TjpbI7EuCy6A",
        authDomain: "beta-fe071.firebaseapp.com",
        projectId: "beta-fe071",
        storageBucket: "beta-fe071.firebasestorage.app",
        messagingSenderId: "439571023304",
        appId: "1:439571023304:web:f15ccab49db87fc599ecfd"
    },
    {
        apiKey: "AIzaSyBBNaX9mgWUMl7l5KLUH5IyRCWBkR_EVi4",
        authDomain: "gamma-37b5d.firebaseapp.com",
        projectId: "gamma-37b5d",
        storageBucket: "gamma-37b5d.firebasestorage.app",
        messagingSenderId: "1009303987166",
        appId: "1:1009303987166:web:0bc0342c58d3c48dde734f"
    },
    {
        apiKey: "AIzaSyDoVcDTQwbpJM1yBZdFSCj7ESkn_RjoBGU",
        authDomain: "delta-a52aa.firebaseapp.com",
        projectId: "delta-a52aa",
        storageBucket: "delta-a52aa.firebasestorage.app",
        messagingSenderId: "1087068509825",
        appId: "1:1087068509825:web:349ba5e8f60355f3a6df80"
    },
    {
        apiKey: "AIzaSyAxxzDo49dayb6t9yWYwltOGwSXi9sEADw",
        authDomain: "epsilon-fee58.firebaseapp.com",
        projectId: "epsilon-fee58",
        storageBucket: "epsilon-fee58.firebasestorage.app",
        messagingSenderId: "965046340166",
        appId: "1:965046340166:web:6f4fc9ea480f7e5e979847"
    },
    {
        apiKey: "AIzaSyAIP4H492PrVmYVIRk_kVDK-lrdWng8gSk",
        authDomain: "zeta-d2bfb.firebaseapp.com",
        projectId: "zeta-d2bfb",
        storageBucket: "zeta-d2bfb.firebasestorage.app",
        messagingSenderId: "995953161773",
        appId: "1:995953161773:web:2e4984e04da40703e16aa4"
    },
    {
        apiKey: "AIzaSyBCCH6QBhnEwLY2-Lfm7PQ1OTt9VN6NFvw",
        authDomain: "etah-a1c08.firebaseapp.com",
        projectId: "etah-a1c08",
        storageBucket: "etah-a1c08.firebasestorage.app",
        messagingSenderId: "919449310506",
        appId: "1:919449310506:web:14803a1fd7973ed4acfa53"
    }
]
export { userColor, pkey, datePeriod, banks, projectConfigs };
//INSERT NAV LINKS
//first fetch links frm backend

/*
const links = ['Payroll', 'Cooperative'];
//slot them into template with id="nav-tmp"
const navTemp = document.querySelector('#nav-tmp');
const navMenu = navTemp.content.querySelector('#nav_menu');
for (const l of links) {
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = l;
    a.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(e.target.textContent);
    });
    navMenu.appendChild(a);
}
//define a custom autonomous c-nav and add it to the DOM
class autoNav extends HTMLElement {
    constructor () {
        super();

        let content = navTemp.content;
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(content.cloneNode(true));

        // let sheet = new CSSStyleSheet();
        // sheet.replace("li {color: blue;}").then(() => {
        //     shadowRoot.adoptedStyleSheets = [sheet];
        // });
    }

    connectedCallback () {
        console.log('added')
        // document.querySelector('c-nav').shadowRoot.querySelectorAll('menu > li').forEach(li => {
        //     // console.log(li);
        //     li.onclick = () => console.log(li.textContent)
        // });
    }
    disconnectedCallback () {
        console.log("Element removed from the DOM", "Remove the EventListeners in connectedCallback()");
    }
}
customElements.define('ctm-nav', autoNav);
//query DOM and add listeners for the c-nav links
*/