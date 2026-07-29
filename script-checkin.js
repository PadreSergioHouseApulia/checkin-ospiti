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
            document.body.innerHTML = "<div style='text-align:center; margin-top:50px; font-family:Arial;'><h2 style='color:#000000'>Grazie! Check-in inviato.</h2><p>Puoi chiudere questa finestra.</p></div>";
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
});