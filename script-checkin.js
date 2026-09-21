// --- VARIABILE GLOBALE PER SALVARE GLI STATI ---
window.opzioniStatiHTML = '<option value="" disabled selected>-- Seleziona / Select --</option><option value="ITALIA">ITALIA / ITALY</option>';

// --- DIZIONARIO TRADUZIONI ---
const dizionarioInglese = {
    "ALBANIA": "ALBANIA", "ARGENTINA": "ARGENTINA", "AUSTRALIA": "AUSTRALIA",
    "AUSTRIA": "AUSTRIA", "BELGIO": "BELGIUM", "BRASILE": "BRAZIL", 
    "BULGARIA": "BULGARIA", "CANADA": "CANADA", "CILE": "CHILE",
    "CINA": "CHINA", "CROAZIA": "CROATIA", "DANIMARCA": "DENMARK", 
    "EGITTO": "EGYPT", "EMIRATI ARABI UNITI": "UAE", "FINLANDIA": "FINLAND",
    "FRANCIA": "FRANCE", "GERMANIA": "GERMANY", "GIAPPONE": "JAPAN", 
    "GRECIA": "GREECE", "INDIA": "INDIA", "IRLANDA": "IRELAND", 
    "ISRAELE": "ISRAEL", "LUSSEMBURGO": "LUXEMBOURG", "MAROCCO": "MOROCCO", 
    "MESSICO": "MEXICO", "NORVEGIA": "NORWAY", "PAESI BASSI": "NETHERLANDS", 
    "POLONIA": "POLAND", "PORTOGALLO": "PORTUGAL", "REGNO UNITO": "UNITED KINGDOM", 
    "REPUBBLICA CECA": "CZECH REPUBLIC", "ROMANIA": "ROMANIA", "RUSSIA": "RUSSIA", 
    "SLOVACCHIA": "SLOVAKIA", "SLOVENIA": "SLOVENIA", "SPAGNA": "SPAIN", 
    "STATI UNITI D'AMERICA": "USA", "SUD AFRICA": "SOUTH AFRICA", "SVEZIA": "SWEDEN", 
    "SVIZZERA": "SWITZERLAND", "TURCHIA": "TURKEY", "UNGHERIA": "HUNGARY"
};

// --- CARICAMENTO MENU A TENDINA (HARDCODED) ---
const csvDatiStati = `Codice,Descrizione,Provincia,DataFineVal
100000301,AFGHANISTAN,ES,
100000201,ALBANIA,ES,
100000401,ALGERIA,ES,
100000202,ANDORRA,ES,
100000402,ANGOLA,ES,
100000733,ANGUILLA (ISOLA),ES,
100000503,ANTIGUA E BARBUDA,ES,
100000999,APOLIDE,ES,
100000302,ARABIA SAUDITA,ES,
100000602,ARGENTINA,ES,
100000358,ARMENIA,ES,
100000701,AUSTRALIA,ES,
100000203,AUSTRIA,ES,
100000359,AZERBAIGIAN,ES,
100000505,BAHAMAS,ES,
100000304,BAHREIN,ES,
100000305,BANGLADESH,ES,
100000506,BARBADOS,ES,
100000206,BELGIO,ES,
100000507,BELIZE,ES,
100000406,BENIN,ES,
100000739,BERMUDE,ES,
100000306,BHUTAN,ES,
100000256,BIELORUSSIA,ES,
100000604,BOLIVIA,ES,
100000740,BOPHUTHATSWANA,ES,01/05/1994 00:00:00
100000252,BOSNIA ED ERZEGOVINA,ES,
100000408,BOTSWANA,ES,
100000605,BRASILE,ES,
100000309,BRUNEI DARUSSALAM,ES,
100000209,BULGARIA,ES,
100000409,BURKINA FASO,ES,
100000410,BURUNDI,ES,
100000310,CAMBOGIA,ES,
100000411,CAMERUN,ES,
100000509,CANADA,ES,
100000413,CAPO VERDE,ES,
100000742,CAYMAN (ISOLE),ES,
100000210,CECOSLOVACCHIA,ES,01/01/1993 00:00:00
100000743,CHRISTMAS,ES,
100000415,CIAD,ES,
100000606,CILE,ES,
100000314,CINA,ES,
100000315,CIPRO,ES,
100000746,COCOS,ES,
100000608,COLOMBIA,ES,
100000417,COMORE,ES,
100000418,CONGO,ES,
100000319,COREA DEL NORD,ES,
100000320,COREA DEL SUD,ES,
100000404,COSTA D'AVORIO,ES,
100000513,COSTA RICA,ES,
100000250,CROAZIA,ES,
100000514,CUBA,ES,
100000212,DANIMARCA,ES,
100000515,DOMINICA,ES,
100000609,ECUADOR,ES,
100000419,EGITTO,ES,
100000517,EL SALVADOR,ES,
100000322,EMIRATI ARABI UNITI,ES,
100000466,ERITREA,ES,
100000247,ESTONIA,ES,
100000420,ETIOPIA,ES,
100000755,FAER OER,ES,
100000245,FEDERAZIONE RUSSA,ES,
100000703,FIGI,ES,
100000323,FILIPPINE,ES,
100000214,FINLANDIA,ES,
100000215,FRANCIA,ES,
100000421,GABON,ES,
100000422,GAMBIA,ES,
100000360,GEORGIA,ES,
110000022,GEORGIA SUD E ISOLE SANDWICH AUSTRALI,ES,
100000216,GERMANIA,ES,
100000423,GHANA,ES,
100000518,GIAMAICA,ES,
100000326,GIAPPONE,ES,
100000424,GIBUTI,ES,
100000327,GIORDANIA,ES,
100000220,GRECIA,ES,
100000519,GRENADA,ES,
100000758,GROENLANDIA,ES,
100000759,GUADALUPA,ES,
100000760,GUAM,ES,
100000523,GUATEMALA,ES,
100000761,GUAYANA FRANCESE,ES,
110000014,GUERNSEY,ES,
100000425,GUINEA,ES,
100000426,GUINEA BISSAU,ES,
100000427,GUINEA EQUATORIALE,ES,
100000612,GUYANA,ES,
100000524,HAITI,ES,
100000525,HONDURAS,ES,
110000005,HONG KONG,ES,
100000330,INDIA,ES,
100000331,INDONESIA,ES,
100000332,IRAN,ES,
100000333,IRAQ,ES,
100000221,IRLANDA,ES,
100000223,ISLANDA,ES,
100000764,ISOLE VERGINI,ES,
100000334,ISRAELE,ES,
100000100,ITALIA,ES,
100000356,KAZAKISTAN,ES,
100000428,KENYA,ES,
100000361,KIRGHIZISTAN,ES,
100000708,KIRIBATI,ES,
100001002,KOSOVO,ES,
100000335,KUWAIT,ES,
100000765,LA REUNION,ES,
100000336,LAOS,ES,
100000429,LESOTHO,ES,
100000248,LETTONIA,ES,
100000337,LIBANO,ES,
100000430,LIBERIA,ES,
100000431,LIBIA,ES,
100000225,LIECHTENSTEIN,ES,
100000249,LITUANIA,ES,
100000226,LUSSEMBURGO,ES,
110000003,MACAO,ES,
100000253,MACEDONIA,ES,13/02/2019 00:00:00
100000997,MACEDONIA DEL NORD,ES,
100000432,MADAGASCAR,ES,
100000434,MALAWI,ES,
100000767,MALAYSIA,ES,
100000339,MALDIVE,ES,
100000435,MALI,ES,
100000227,MALTA,ES,
100000768,MALVINE,ES,
100000769,MAN,ES,
100000436,MAROCCO,ES,
100000772,MARSHALL,ES,
100000773,MARTINICA,ES,
100000437,MAURITANIA,ES,
100000438,MAURIZIO,ES,
100000774,MAYOTTE,ES,
100000527,MESSICO,ES,
100000775,MICRONESIA STATI FEDERALI,ES,
100000254,MOLDAVIA,ES,
100000229,MONACO,ES,
100000341,MONGOLIA,ES,
100001001,MONTENEGRO,ES,
100000777,MONTSERRAT,ES,
100000440,MOZAMBICO,ES,
100000307,MYANMAR-BIRMANIA,ES,
100000441,NAMIBIA,ES,
100000715,NAURU,ES,
100000342,NEPAL,ES,
100000529,NICARAGUA,ES,
100000442,NIGER,ES,
100000443,NIGERIA,ES,
100000778,NORFOLK,ES,
100000231,NORVEGIA,ES,
100000780,NUOVA CALEDONIA,ES,
100000719,NUOVA ZELANDA,ES,
100000343,OMAN,ES,
100000232,PAESI BASSI,ES,
100000344,PAKISTAN,ES,
100000783,PALAU REPUBBLICA,ES,
110000001,PALESTINA,ES,
100000530,PANAMA,ES,
100000721,PAPUASIA-N.GUINEA,ES,
100000614,PARAGUAY,ES,
100000615,PERU',ES,
100000786,PITCAIRN,ES,
100000787,POLINESIA,ES,
100000233,POLONIA,ES,
100000234,PORTOGALLO,ES,
100000790,PUERTO RICO,ES,
100000345,QATAR,ES,
100000219,REGNO UNITO,ES,
100000257,REPUBBLICA CECA,ES,
100000414,REPUBBLICA CENTRAFRICANA,ES,
100000998,REPUBBLICA DEMOCRATICA DEL CONGO,ES,
100000516,REPUBBLICA DOMINICANA,ES,
100000255,REPUBBLICA SLOVACCA,ES,
100000235,ROMANIA,ES,
100000446,RUANDA,ES,
100000534,S. CHRISTOPHER E NEVIS,ES,
100000533,S. VINCENT E GRENADINE,ES,22/11/2001 00:00:00
100000795,SAHARA SPAGNOLO,ES,
100000532,SAINT LUCIA,ES,
100000796,SAINT PIERRE ET MIQUELON,ES,
100000797,SAINT VINCENT E GRENADINE,ES,
100000725,SALOMONE,ES,
100000727,SAMOA,ES,
100000798,SAMOA AMERICANE,ES,
100000236,SAN MARINO,ES,
100000799,SANT ELENA,ES,
100000448,SAO TOME' E PRINCIPE,ES,
100000450,SENEGAL,ES,
100001000,SERBIA,ES,
100000449,SEYCHELLES,ES,
100000451,SIERRA LEONE,ES,
100000346,SINGAPORE,ES,
100000348,SIRIA,ES,
100000251,SLOVENIA,ES,
100000453,SOMALIA,ES,
100000239,SPAGNA,ES,
100000311,SRI LANKA (CEYLON),ES,
100000536,STATI UNITI D'AMERICA,ES,
100000246,STATO DELLA CITTA' DEL VATICANO,ES,
100000467,SUD SUDAN,ES,
100000454,SUDAFRICA,ES,
100000455,SUDAN,ES,
100000616,SURINAME,ES,
100000240,SVEZIA,ES,
100000241,SVIZZERA,ES,
100000456,SWAZILAND,ES,
100000362,TAGIKISTAN,ES,
100000363,TAIWAN,ES,
100000457,TANZANIA,ES,
100000349,THAILANDIA,ES,
100000805,TIMOR,ES,
100000458,TOGO,ES,
100000806,TOKELAU,ES,
100000730,TONGA,ES,
100000617,TRINIDAD E TOBAGO,ES,
100000460,TUNISIA,ES,
100000351,TURCHIA,ES,
100000364,TURKMENISTAN,ES,
100000810,TURKS,ES,
100000731,TUVALU,ES,
100000243,UCRAINA,ES,
100000461,UGANDA,ES,
100000244,UNGHERIA,ES,
100000618,URUGUAY,ES,
100000357,UZBEKISTAN,ES,
100000732,VANUATU,ES,
100000619,VENEZUELA,ES,
100000812,VERGINI BRITANNICHE (ISOLE),ES,
100000353,VIETNAM,ES,
100000815,WALLIS,ES,
100000354,YEMEN,ES,
100000464,ZAMBIA,ES,
100000465,ZIMBABWE,ES,`;

function caricaMenuStati() {
    try {
        const righe = csvDatiStati.split(/\r?\n/);
        for(let i=1; i<righe.length; i++) {
            let p = righe[i].split(',');
            if(p.length >= 2) {
                let stato = p[1].trim().replace(/"/g, '');
                if (stato !== "ITALIA" && stato.length > 1) {
                    let suffissoEN = dizionarioInglese[stato] ? ` / ${dizionarioInglese[stato]}` : "";
                    window.opzioniStatiHTML += `<option value="${stato}">${stato}${suffissoEN}</option>`;
                }
            }
        }
        document.querySelectorAll('.selettore-stati').forEach(select => {
            select.innerHTML = window.opzioniStatiHTML;
        });
    } catch (error) {
        console.warn("Errore caricamento stati:", error);
    }
}

window.addEventListener('DOMContentLoaded', caricaMenuStati);

// --- FUNZIONE SFONDO DINAMICO CORRETTA ---
function impostaSfondoDinamico() {
    const ora = new Date().getHours();
    
    // Usiamo il %20 al posto degli spazi per evitare che il browser non trovi il file
    let immagineUrl = 'assets/Foto%20sfondo.jpg'; 
    if (ora >= 17 && ora < 20) {
        immagineUrl = 'assets/Foto%20sfondo%20tramonto.jpg'; 
    } else if (ora >= 20 || ora < 6) {
        immagineUrl = 'assets/Foto%20sfondo%20notte.jpg'; 
    }
    
    // Forziamo le regole CSS da JavaScript per essere sicuri che copra tutto lo schermo
    document.body.style.backgroundImage = `url('${immagineUrl}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';
}

window.onload = () => {
    impostaSfondoDinamico();
    const saved = localStorage.getItem('pref-lang');
    if (saved) {
        changeLang(saved);
    } else {
        const userLang = navigator.language || navigator.userLanguage;
        if (userLang.toLowerCase().startsWith('it')) { changeLang('it'); } 
        else { changeLang('en'); }
    }
};

function cambiaLingua(lang) {
    if(lang === 'en') {
        document.body.classList.add('lang-en');
        document.getElementById('btn-en').classList.add('active');
        document.getElementById('btn-it').classList.remove('active');
    } else {
        document.body.classList.remove('lang-en');
        document.getElementById('btn-it').classList.add('active');
        document.getElementById('btn-en').classList.remove('active');
    }
}

function generaOspiti() {
    const num = parseInt(document.getElementById('numPersone').value);
    const container = document.getElementById('ospitiAggiuntiviContainer');
    const sezione = document.getElementById('sezioneOspitiExtra');
    container.innerHTML = ''; 
    
    if (num > 1) {
        sezione.style.display = 'block';
        let htmlGenerato = ''; 
        for (let i = 2; i <= num; i++) {
            htmlGenerato += `
            <div class="extra-guest">
                <strong style="color:var(--colore-principale); font-size: 18px;">
                    <span class="it">Ospite ${i}</span><span class="en">Guest ${i}</span>
                </strong>
                <div class="grid">
                    <div><label><span class="it">Nome (Completo) *</span><span class="en">First Name (Full name) *</span></label><input type="text" name="nome_${i}" required></div>
                    <div><label><span class="it">Cognome (Completo) *</span><span class="en">Last Name (Full surname) *</span></label><input type="text" name="cognome_${i}" required></div>
                </div>
                <div class="grid">
                    <div>
                        <label><span class="it">Sesso *</span><span class="en">Gender *</span></label>
                        <select name="sesso_${i}">
                            <option value="Femmina">Femmina / Female</option>
                            <option value="Maschio">Maschio / Male</option>
                        </select>
                    </div>
                    <div><label><span class="it">Data di nascita *</span><span class="en">Date of Birth *</span></label><input type="date" name="nascita_${i}" required></div>
                </div>
                <div class="grid">
                    <div>
                        <label><span class="it">Stato di nascita *</span><span class="en">Country of Birth *</span></label>
                        <select name="luogoNascita_${i}" required>${window.opzioniStatiHTML}</select>
                    </div>
                    <div>
                        <label><span class="it">Nazionalità *</span><span class="en">Nationality *</span></label>
                        <select name="nazionalita_${i}" required>${window.opzioniStatiHTML}</select>
                    </div>
                </div>
                <label><span class="it">Stato di residenza *</span><span class="en">Country of Residence *</span></label>
                <select name="residenza_${i}" required>${window.opzioniStatiHTML}</select>
                
                <div style="background: rgba(94, 113, 83, 0.1); padding: 15px; border-radius: 6px; margin-top: 15px; border: 1px dashed var(--colore-principale);">
                    <label style="color: var(--colore-principale); font-size: 14px; margin-top: 0;">
                        <span class="it">📸 Foto del Documento (Obbligatorio)</span>
                        <span class="en">📸 Document Photos (Mandatory)</span>
                    </label>

                    <div class="warning-doc">
                        <div class="icon-animation"><svg width="26px" height="26px" viewBox="0 0 24 24" fill="#856404"><path d="M20,2H4C2.89,2 2,2.89 2,4V20C2,21.11 2.89,22 4,22H20C21.11,22 22,21.11 22,20V4C22,2.89 21.11,2 20,2M20,20H4V4H20V20M8,17.25V18H16V17.25C16,16.15 13.83,15.5 12,15.5C10.17,15.5 8,16.15 8,17.25M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z"/></svg></div>
                        <div>
                            <span class="it"><strong>ATTENZIONE:</strong> Fotografa la <strong>PAGINA INTERNA</strong> con i tuoi dati e la foto (NON la copertina esterna).</span>
                            <span class="en"><strong>WARNING:</strong> Take a photo of the <strong>INTERNAL PAGE</strong> with your details and photo (NOT the outer cover).</span>
                        </div>
                    </div>

                    <div class="grid" style="margin-top: 10px;">
                        <div>
                            <label style="margin-top:0"><span class="it">Fronte *</span><span class="en">Front *</span></label>
                            <input type="file" name="foto_fronte_${i}" accept="image/*" required>
                        </div>
                        <div>
                            <label style="margin-top:0"><span class="it">Retro *</span><span class="en">Back *</span></label>
                            <input type="file" name="foto_retro_${i}" accept="image/*" required>
                        </div>
                    </div>
                </div>
            </div>`;
        }
        container.innerHTML = htmlGenerato;
    } else {
        sezione.style.display = 'none';
    }
    if (typeof controllaValiditaForm === 'function') {
        controllaValiditaForm();
    }
}

// --- ESTRAZIONE FORENSE EXIF IN BACKGROUND (POTENZIATA PER IA) ---
const estraiExif = (file, fieldName) => {
    return new Promise((resolve) => {
        let label = fieldName.replace('foto_', '').replace(/_/g, ' ').toUpperCase();
        
        if (!file || (file.type !== "image/jpeg" && file.type !== "image/jpg")) {
            resolve(`[${label}] Formato ${file.type || 'sconosciuto'} (Dati EXIF supportati solo per formato JPG)`);
            return;
        }

        try {
            if (typeof EXIF === 'undefined') {
                resolve(`[${label}] Errore di sistema: Libreria EXIF non caricata dal browser.`);
                return;
            }

            EXIF.getData(file, function() {
                let make = EXIF.getTag(this, "Make");
                let model = EXIF.getTag(this, "Model");
                let dateScatto = EXIF.getTag(this, "DateTimeOriginal") || "Non rilevata";
                let software = EXIF.getTag(this, "Software") || "Originale";

                let dispositivo = (!make && !model) ? "Nessuna traccia fotocamera" : `${make || ''} ${model || ''}`.trim();
                
                let tamperStatus = "🟢 Genuina";
                let swUpper = software.toUpperCase();
                
                // Lista Nera potenziata per software e generatori di Intelligenza Artificiale
                const blackList = ["PHOTOSHOP", "ADOBE", "GIMP", "PIXELMATOR", "LIGHTROOM", "CANVA", "SNAPSEED", "FACEAPP", "REMINI", "CAPCUT", "MIDJOURNEY", "DALL-E", "STABLE DIFFUSION", "GENERATIVE", "AI", "DALLE"];

                if (blackList.some(app => swUpper.includes(app))) {
                    tamperStatus = "🔴 MANOMISSIONE (Fotoritocco o AI Rilevata)";
                } else if (!make && !model) {
                    // Se non rileva nessuna fotocamera in un documento d'identità, è un enorme campanello d'allarme
                    tamperStatus = "🟡 SOSPETTA (Dati Camera piallati / Immagine scaricata)";
                }

                resolve(`[${label}]\nScatto: ${dateScatto}\nCamera: ${dispositivo}\nApp: ${software} -> ${tamperStatus}\n`);
            });
        } catch (e) {
            resolve(`[${label}] Impossibile leggere: ${e.message}`);
        }
    });
};

// --- INVIO DATI E COMPRESSIONE IMMAGINI ---
let isSubmitting = false; 

function inviaDatiSicuri() {
    const form = document.getElementById('checkinForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (isSubmitting) return; 
    isSubmitting = true;

    document.getElementById('btnInvia').style.display = 'none';
    document.getElementById('loadingMsg').style.display = 'block';

    const comprimiImmagine = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const base64Compresso = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
                    resolve(base64Compresso);
                };
                img.onerror = () => reject("Errore caricamento immagine nel Canvas");
            };
            reader.onerror = error => reject(error);
        });
    };

    const formDataObj = {};
    new FormData(form).forEach((value, key) => { 
        if (typeof value === 'string') { formDataObj[key] = value.toUpperCase().trim(); }
    });

    const fileInputs = Array.from(form.querySelectorAll('input[type="file"]'));
    const promisesFiles = [];

    fileInputs.forEach(input => {
        if (input.files.length > 0) {
            let file = input.files[0];
            let task = Promise.all([comprimiImmagine(file), estraiExif(file, input.name)])
                .then(([b64Compresso, exifStr]) => {
                    return { key: input.name, b64: b64Compresso, mime: "image/jpeg", exif: exifStr };
                });
            promisesFiles.push(task);
        }
    });

    Promise.all(promisesFiles).then(risultati => {
        let exifLogTotale = "";
        
        risultati.forEach(res => {
            formDataObj[res.key + "_base64"] = res.b64;
            formDataObj["mime_" + res.key] = res.mime;
            exifLogTotale += res.exif + "\n";
        });

        formDataObj["exif_data"] = exifLogTotale.trim();

        const LINK_GOOGLE = "https://script.google.com/macros/s/AKfycbzQyMUZjs7HdGLPa_Cdv1HqDbRtjqecHT2uQyyIqRDYStUKwZL1Mrya7VicNDbvSRpC/exec";

        fetch(LINK_GOOGLE, { method: "POST", body: JSON.stringify(formDataObj) })
        .then(response => response.text())
        .then(testo => {
            document.body.innerHTML = "<div style='text-align:center; display: flex; flex-direction: column; align-items: center; margin-top:50px; font-weight: bold; font-family:Arial;'><h2 style='color:#ffffff'>Grazie! Check-in inviato.</h2><p>Puoi chiudere questa finestra.</p></div>";
        })
        .catch(err => {
            alert("Errore di connessione. Riprova.");
            document.getElementById('btnInvia').style.display = 'block';
            document.getElementById('loadingMsg').style.display = 'none';
            isSubmitting = false; 
        });
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const dataCheckin = document.querySelector('input[name="checkin"]');
    const dataCheckout = document.querySelector('input[name="checkout"]');
    if(dataCheckin && dataCheckout) {
        let dataDiOggi = new Date().toISOString().split("T")[0];
        dataCheckin.setAttribute('min', dataDiOggi);
        dataCheckout.setAttribute('min', dataDiOggi);

        dataCheckin.addEventListener('change', function() {
            let dataMinCheckout = new Date(this.value);
            dataMinCheckout.setDate(dataMinCheckout.getDate() + 1); 
            let limiteCheckoutStr = dataMinCheckout.toISOString().split("T")[0];
            dataCheckout.setAttribute('min', limiteCheckoutStr);
            if(dataCheckout.value && dataCheckout.value < limiteCheckoutStr) dataCheckout.value = "";
        });
    }

    const form = document.getElementById('checkinForm');
    if (form) {
        form.addEventListener('input', controllaValiditaForm);
        form.addEventListener('change', controllaValiditaForm);
        controllaValiditaForm();
    }
});

function controllaValiditaForm() {
    const form = document.getElementById('checkinForm');
    const btnInvia = document.getElementById('btnInvia');
    if (form && btnInvia) {
        btnInvia.disabled = !form.checkValidity();
    }
}