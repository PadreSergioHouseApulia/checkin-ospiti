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

// --- CARICAMENTO MENU A TENDINA DA CSV ---
async function caricaMenuStati() {
    try {
        // Percorso aggiornato ad assets/stati.csv
        const resStati = await fetch('assets/stati.csv');
        
        if (resStati.ok) {
            const txtStati = await resStati.text();
            const righe = txtStati.split(/\r?\n/);
            
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
        }

        document.querySelectorAll('.selettore-stati').forEach(select => {
            select.innerHTML = window.opzioniStatiHTML;
        });

    } catch (error) {
        console.warn("Dizionario CSV Stati non caricato.", error);
        document.querySelectorAll('.selettore-stati').forEach(select => {
            select.innerHTML = window.opzioniStatiHTML;
        });
    }
}

window.addEventListener('DOMContentLoaded', caricaMenuStati);

// --- FUNZIONE SFONDO DINAMICO AGGIUNTA ---
function impostaSfondoDinamico() {
    const ora = new Date().getHours();
    // Percorsi aggiornati ad assets/
    let immagineUrl = 'assets/Foto sfondo.jpg'; 

    if (ora >= 17 && ora < 20) {
        immagineUrl = 'assets/Foto sfondo tramonto.jpg'; 
    } else if (ora >= 20 || ora < 6) {
        immagineUrl = 'assets/Foto sfondo notte.jpg'; 
    }

    document.body.style.backgroundImage = `url('${immagineUrl}')`;
}

window.onload = () => {
    impostaSfondoDinamico();

    const saved = localStorage.getItem('pref-lang');
    if (saved) {
        changeLang(saved);
    } else {
        const userLang = navigator.language || navigator.userLanguage;
        if (userLang.toLowerCase().startsWith('it')) {
            changeLang('it');
        } else {
            changeLang('en');
        }
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
                        <select name="luogoNascita_${i}" required>
                            ${window.opzioniStatiHTML}
                        </select>
                    </div>
                    <div>
                        <label><span class="it">Nazionalità *</span><span class="en">Nationality *</span></label>
                        <select name="nazionalita_${i}" required>
                            ${window.opzioniStatiHTML}
                        </select>
                    </div>
                </div>
                
                <label><span class="it">Stato di residenza *</span><span class="en">Country of Residence *</span></label>
                <select name="residenza_${i}" required>
                    ${window.opzioniStatiHTML}
                </select>
                
                <div style="background: rgba(94, 113, 83, 0.1); padding: 15px; border-radius: 6px; margin-top: 15px; border: 1px dashed var(--colore-principale);">
                    <label style="color: var(--colore-principale); font-size: 14px; margin-top: 0;">
                        <span class="it">📸 Foto del Documento (Obbligatorio)</span>
                        <span class="en">📸 Document Photos (Mandatory)</span>
                    </label>
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
}

function inviaDatiSicuri() {
    const form = document.getElementById('checkinForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    document.getElementById('btnInvia').style.display = 'none';
    document.getElementById('loadingMsg').style.display = 'block';

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]); 
            reader.onerror = error => reject(error);
        });
    };

    const formDataObj = {};
    
    new FormData(form).forEach((value, key) => { 
        if (typeof value === 'string') {
            formDataObj[key] = value.toUpperCase().trim(); 
        }
    });

    const fileInputs = Array.from(form.querySelectorAll('input[type="file"]'));
    const promises = [];
    const fileKeys = [];

    fileInputs.forEach(input => {
        if (input.files.length > 0) {
            promises.push(getBase64(input.files[0]));
            fileKeys.push(input.name); 
            formDataObj["mime_" + input.name] = input.files[0].type;
        }
    });

    Promise.all(promises).then(risultati => {
        risultati.forEach((b64, index) => {
            formDataObj[fileKeys[index] + "_base64"] = b64;
        });

        const LINK_GOOGLE = "https://script.google.com/macros/s/AKfycbzQyMUZjs7HdGLPa_Cdv1HqDbRtjqecHT2uQyyIqRDYStUKwZL1Mrya7VicNDbvSRpC/exec";

        fetch(LINK_GOOGLE, {
            method: "POST",
            body: JSON.stringify(formDataObj)
        })
        .then(response => response.text())
        .then(testo => {
            document.body.innerHTML = "<div style='text-align:center; margin-top:50px; font-family:Arial;'><h2 style='color:#000000'>Grazie! Check-in inviato.</h2><p>Puoi chiudere questa finestra.</p></div>";
        })
        .catch(err => {
            alert("Errore di connessione. Riprova.");
            document.getElementById('btnInvia').style.display = 'block';
            document.getElementById('loadingMsg').style.display = 'none';
        });
    });
}

// --- BLOCCO DELLE DATE PASSATE PER IL CHECK-IN ---
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
            if(dataCheckout.value && dataCheckout.value < limiteCheckoutStr) {
                dataCheckout.value = "";
            }
        });
    }
});