const LINK_GOOGLE_SCRIPT = "https://script.google.com/macros/s/AKfycbzQyMUZjs7HdGLPa_Cdv1HqDbRtjqecHT2uQyyIqRDYStUKwZL1Mrya7VicNDbvSRpC/exec";
const MESI = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

let dbCheckin = []; 
let dbRichieste = []; 
let impostazioniGlobali = {};
let vistaAttuale = "dashboard"; 
let meseCorrente = new Date().getMonth();
let annoCorrente = new Date().getFullYear();
let graficoOccupazione = null; 
let threatMap = null;

// --- MOTORE TRADUZIONE CODICI POLIZIA ---
let dictComuni = {}; let dictStati = {};
async function caricaDizionari() {
    try {
        let resCom = await fetch('assets/comuni.csv'); 
        if (resCom.ok) {
            let txtCom = await resCom.text();
            let righeCom = txtCom.split(/\r?\n/);
            for (let i = 1; i < righeCom.length; i++) {
                let p = righeCom[i].split(',');
                if (p.length >= 2) {
                    let cod = p[0].trim(); let nom = p[1].trim().toUpperCase(); let fine = p[3] ? p[3].trim() : "";
                    if (!dictComuni[nom] || fine === "") dictComuni[nom] = cod;
                }
            }
        }
        let resStat = await fetch('assets/stati.csv'); 
        if (resStat.ok) {
            let txtStat = await resStat.text();
            let righeStat = txtStat.split(/\r?\n/);
            for (let i = 1; i < righeStat.length; i++) {
                let p = righeStat[i].split(',');
                if (p.length >= 2) {
                    let cod = p[0].trim(); let nom = p[1].trim().toUpperCase(); let fine = p[3] ? p[3].trim() : "";
                    if (!dictStati[nom] || fine === "") dictStati[nom] = cod;
                    if (nom === "ITALIA") { dictStati["ITALIANA"] = cod; dictStati["ITALIANO"] = cod; }
                }
            }
        }
    } catch(e) { console.warn("Dizionari CSV non trovati."); }
}
caricaDizionari(); 

function getCodiciLuogo(luogo) {
    if(!luogo) return { nazione: "", comune: "" };
    luogo = luogo.trim().toUpperCase();
    if(dictComuni[luogo]) return { nazione: "100000100", comune: dictComuni[luogo] }; 
    if(dictStati[luogo]) return { nazione: dictStati[luogo], comune: "" }; 
    return { nazione: luogo, comune: "" }; 
}
function getCodiceNazione(nazionalita) {
    if(!nazionalita) return "";
    nazionalita = nazionalita.trim().toUpperCase();
    if(dictStati[nazionalita]) return dictStati[nazionalita];
    if(nazionalita === "ITALIANA" || nazionalita === "ITALIANO") return "100000100";
    return nazionalita; 
}

// --- MODALE GRAFICA CUSTOM (Sostituisce gli alert) ---
function mostraAlertCustom(testo, tipo = "info") {
    let icona = "ℹ️";
    let titolo = "Notifica";
    if (tipo === "success") { icona = "✅"; titolo = "Operazione Riuscita"; }
    else if (tipo === "error") { icona = "❌"; titolo = "Attenzione"; }
    else if (tipo === "warning") { icona = "⚠️"; titolo = "Avviso di Sicurezza"; }

    document.getElementById('alert-custom-icon').innerText = icona;
    document.getElementById('alert-custom-titolo').innerText = titolo;
    document.getElementById('alert-custom-testo').innerText = testo;
    document.getElementById('customAlertModal').style.display = 'flex';
}

// --- PASSWORD E LOGIN ---
function mostraNascondiPwd(id) { 
    let input = document.getElementById(id);
    if (input) input.type = (input.type === 'password') ? 'text' : 'password'; 
}

async function verificaPassword() {
    const user = document.getElementById('usernameInput').value.trim(); 
    const pwd = document.getElementById('passwordInput').value;
    const btn = document.getElementById('btn-accedi');
    btn.innerText = "Verifica in corso..."; btn.disabled = true;

    let ip = "Sconosciuto"; let loc = "Sconosciuta"; let coords = "";
    try {
        let geo = await fetch('https://ipinfo.io/json').then(r => r.json());
        if(geo.ip) { ip = geo.ip; loc = `${geo.city || ''}, ${geo.country || ''}`; coords = geo.loc; }
    } catch(e1) { 
        try {
            let geo2 = await fetch('https://freeipapi.com/api/json').then(r => r.json());
            if(geo2.ipAddress) { ip = geo2.ipAddress; loc = `${geo2.cityName || ''}, ${geo2.countryName || ''}`; coords = `${geo2.latitude},${geo2.longitude}`; }
        } catch(e2) { console.log("Telemetria bloccata"); }
    }

    fetch(LINK_GOOGLE_SCRIPT, {
        method: "POST",
        body: JSON.stringify({ action: "verificaPassword", username: user, password: pwd, ip: ip, location: loc, coords: coords })
    }).then(r => r.text()).then(risposta => {
        if (risposta.startsWith("FORCE_PWD_CHANGE")) {
            let parti = risposta.split("|");
            localStorage.setItem('tempUser', parti[2]); 
            document.getElementById('cambioPasswordModal').style.display = 'flex';
            document.getElementById('btn-chiudi-modal-pwd').style.display = 'none'; 
            document.getElementById('banner-scadenza-pwd').style.display = 'block';
            document.getElementById('testo-modal-pwd').innerText = "Devi scegliere una nuova password prima di continuare.";
            btn.innerText = "Accedi"; btn.disabled = false;
        } else if (risposta === "ADMIN" || risposta === "BASE") {
            localStorage.setItem('adminSessionExp', Date.now() + 5 * 60 * 1000); 
            localStorage.setItem('userRole', risposta); 
            localStorage.setItem('currentUser', user); 
            document.body.className = "role-" + risposta.toLowerCase(); 
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            btn.innerText = "Accedi"; btn.disabled = false;
            
            aggiornaUIBiometria(); 
            caricaDati();
            controllaCompleanno();
            controllaScadenzaPassword(); 
        } else {
            document.getElementById('messaggioErrore').style.display = 'block';
            btn.innerText = "Accedi"; btn.disabled = false;
        }
    }).catch(() => {
        document.getElementById('messaggioErrore').style.display = 'block';
        btn.innerText = "Accedi"; btn.disabled = false;
    });
}

function gestisciInvio(event) { if (event.key === "Enter") verificaPassword(); }

function apriCambioPasswordVolontario() {
    document.getElementById('cambioPasswordModal').style.display = 'flex';
    document.getElementById('btn-chiudi-modal-pwd').style.display = 'block';
    document.getElementById('banner-scadenza-pwd').style.display = 'none';
    document.getElementById('testo-modal-pwd').innerText = "Inserisci i dati per aggiornare la password di accesso.";
}

function salvaNuovaPassword(event) {
    let isObbligatorio = document.getElementById('btn-chiudi-modal-pwd').style.display === 'none';
    let targetUser = isObbligatorio ? localStorage.getItem('tempUser') : localStorage.getItem('currentUser');
    const oldPwd = document.getElementById('pwd-vecchia').value;
    const newPwd = document.getElementById('pwd-nuova').value;
    const confirmPwd = document.getElementById('pwd-conferma').value;
    const erroreMsg = document.getElementById('msg-pwd');

    if (newPwd.length < 6) {
        erroreMsg.innerText = "La nuova password deve avere almeno 6 caratteri.";
        erroreMsg.style.display = 'block'; return;
    }
    if (newPwd !== confirmPwd) {
        erroreMsg.innerText = "Le due nuove password non coincidono!";
        erroreMsg.style.display = 'block'; return;
    }

    erroreMsg.style.color = "#5e7153";
    erroreMsg.innerText = "Aggiornamento sul server in corso...";
    erroreMsg.style.display = 'block';

    fetch(LINK_GOOGLE_SCRIPT, { method: 'POST', body: JSON.stringify({ action: "cambiaPasswordManuale", username: targetUser, vecchia: oldPwd, nuova: newPwd }) })
    .then(r => r.text())
    .then(res => {
        if (res === "CAMBIO_OK") {
            document.getElementById('pwd-vecchia').value = ""; document.getElementById('pwd-nuova').value = ""; document.getElementById('pwd-conferma').value = "";
            erroreMsg.style.display = 'none';
            localStorage.setItem('mese_ultimo_cambio_pwd', new Date().getMonth());
            if (isObbligatorio) {
                mostraAlertCustom("Password aggiornata! Ora puoi effettuare il login con la nuova password.", "success");
                document.getElementById('cambioPasswordModal').style.display = 'none';
                document.getElementById('banner-scadenza-pwd').style.display = 'none';
                document.getElementById('passwordInput').value = ""; 
            } else {
                mostraAlertCustom("Password aggiornata con successo!", "success");
                chiudiModal('cambioPasswordModal');
                document.getElementById('banner-scadenza-pwd-pre').style.display = 'none';
            }
        } else if (res === "VECCHIA_ERRATA") {
            erroreMsg.style.color = "red"; erroreMsg.innerText = "La password attuale inserita è errata!";
        } else {
            erroreMsg.style.color = "red"; erroreMsg.innerText = "Errore di connessione.";
        }
    }).catch(() => {
        erroreMsg.style.color = "red"; erroreMsg.innerText = "Errore di comunicazione col server.";
    });
}

function controllaScadenzaPassword() {
    const oggi = new Date(); const giornoAttuale = oggi.getDate(); const meseAttuale = oggi.getMonth(); const annoAttuale = oggi.getFullYear();
    const ultimoGiornoMese = new Date(annoAttuale, meseAttuale + 1, 0).getDate();
    const giorniMancanti = ultimoGiornoMese - giornoAttuale;
    const ultimoMeseCambio = localStorage.getItem('mese_ultimo_cambio_pwd');
    const bannerPreAvviso = document.getElementById('banner-scadenza-pwd-pre');
    const spanGiorni = document.getElementById('giorni-rimanenti');

    if (giorniMancanti <= 4 && giorniMancanti >= 0 && ultimoMeseCambio != meseAttuale + 1 && giornoAttuale !== 1) {
        spanGiorni.innerText = giorniMancanti + 1; bannerPreAvviso.style.display = 'block';
    } else { bannerPreAvviso.style.display = 'none'; }
}

function cambiaVista(tipo) {
    vistaAttuale = tipo;
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-' + tipo).classList.add('active');
    
    const idNascondi = ['contenitore-schede', 'contenitore-calendario', 'contenitore-utenti', 'contenitore-sicurezza', 'contenitore-impostazioni'];
    idNascondi.forEach(id => document.getElementById(id).style.display = 'none');

    const titoli = { 
        dashboard: "Statistiche in Tempo Reale", checkin: "Check-in Attivi", richieste: "Richieste di Prenotazione",
        calendario: "Calendario Completo", archivio: "Archivio Check-in Passati", 
        utenti: "Gestione Utenti del Sistema", impostazioni: "Impostazioni Globali", sicurezza: "Centro di Sicurezza"
    };
    document.getElementById('titolo-sezione').innerText = titoli[tipo];

    if (tipo === 'calendario') { document.getElementById('contenitore-calendario').style.display = 'block'; generaCalendario(); } 
    else if (tipo === 'utenti') { document.getElementById('contenitore-utenti').style.display = 'block'; caricaUtenti(); } 
    else if (tipo === 'impostazioni') { document.getElementById('contenitore-impostazioni').style.display = 'block'; caricaImpostazioni(); } 
    else if (tipo === 'sicurezza') { document.getElementById('contenitore-sicurezza').style.display = 'block'; caricaSecurityLogs(); } 
    else { document.getElementById('contenitore-schede').style.display = 'grid'; renderizzaSchedeODashboard(); }
}

function aggiornaUIKillSwitch(stato) {
    const btn = document.getElementById('btn-kill-switch'); const statusSpan = document.getElementById('kill-switch-status');
    if (!btn || !statusSpan) return;
    if (stato === "ON") { statusSpan.innerHTML = "🔴 Manutenzione"; btn.innerHTML = "Attiva Sito"; btn.style.backgroundColor = "var(--verde-ok)"; } 
    else { statusSpan.innerHTML = "🟢 Sito Attivo"; btn.innerHTML = "Disattiva"; btn.style.backgroundColor = "var(--rosso-allerta)"; }
}

function toggleKillSwitch() {
    let statoAttuale = impostazioniGlobali["maintenance_mode"] === "ON" ? "ON" : "OFF";
    let nuovoStato = statoAttuale === "ON" ? "OFF" : "ON";
    let titolo = nuovoStato === "ON" ? "🛑 Attiva Manutenzione" : "🟢 Ripristina Sito";
    let messaggio = nuovoStato === "ON" ? "ATTENZIONE: Il sito pubblico verrà isolato. Password Amministratore richiesta." : "Il sito tornerà online. Password richiesta.";
    let coloreBtn = nuovoStato === "ON" ? "var(--rosso-allerta)" : "var(--verde-ok)";
    
    document.getElementById('ks-titolo').innerText = titolo; document.getElementById('ks-messaggio').innerText = messaggio;
    document.getElementById('ks-nuovo-stato').value = nuovoStato; document.getElementById('ks-password').value = "";
    document.getElementById('msg-ks').style.display = 'none';
    let btnConferma = document.getElementById('btn-conferma-ks'); btnConferma.style.background = coloreBtn; btnConferma.innerText = "Conferma Operazione";
    document.getElementById('killSwitchModal').style.display = 'flex';
}

function confermaKillSwitch(event) {
    const pwd = document.getElementById('ks-password').value; const nuovoStato = document.getElementById('ks-nuovo-stato').value;
    const currentUser = localStorage.getItem('currentUser'); const msgKs = document.getElementById('msg-ks');
    
    if(!pwd) { msgKs.innerText = "Devi inserire la password di amministratore."; msgKs.style.display = 'block'; return; }

    const btn = event.target; btn.innerText = "⏳ Autenticazione..."; btn.disabled = true;

    fetch(LINK_GOOGLE_SCRIPT, { method: "POST", body: JSON.stringify({ action: "toggleMaintenance", state: nuovoStato, username: currentUser, password: pwd }) })
    .then(r => r.text()).then(res => {
        if (res === "PWD_ERRATA") {
            msgKs.innerText = "❌ Password errata o utente non autorizzato."; msgKs.style.display = 'block'; btn.disabled = false; btn.innerText = "Conferma Operazione";
        } else {
            impostazioniGlobali["maintenance_mode"] = res; aggiornaUIKillSwitch(res); chiudiModal('killSwitchModal'); btn.disabled = false;
            document.getElementById('success-ks-icon').innerText = res === "ON" ? "🛑" : "🟢";
            document.getElementById('success-ks-titolo').innerText = res === "ON" ? "Sito Disattivato" : "Sito Online";
            document.getElementById('success-ks-titolo').style.color = res === "ON" ? "var(--rosso-allerta)" : "var(--verde-ok)";
            document.getElementById('success-ks-messaggio').innerText = res === "ON" ? "Il sito è in Manutenzione." : "Il sito è Online.";
            document.getElementById('successKillSwitchModal').style.display = 'flex';
        }
    }).catch(e => { msgKs.innerText = "❌ Errore server."; msgKs.style.display = 'block'; btn.disabled = false; btn.innerText = "Conferma Operazione"; });
}

function caricaSecurityLogs() {
    document.getElementById('security-log-body').innerHTML = '<tr><td colspan="5" style="padding:10px; text-align:center;">Caricamento in corso... ⏳</td></tr>';
    if (!threatMap) { threatMap = L.map('threat-map').setView([41.8719, 12.5674], 5); L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OSM' }).addTo(threatMap); }
    setTimeout(() => { threatMap.invalidateSize(); }, 300);

    fetch(LINK_GOOGLE_SCRIPT, { method: "POST", body: JSON.stringify({ action: "getSecurityLogs" }) }).then(r => r.json()).then(logs => {
        let tbody = document.getElementById('security-log-body');
        if (!logs || logs.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="padding:10px; text-align:center; color:#27ae60; font-weight:bold;">Nessuna anomalia. Il sistema è pulito. 🟢</td></tr>'; return; }

        let html = ""; let bounds = [];
        threatMap.eachLayer((layer) => { if(layer instanceof L.CircleMarker) layer.remove(); });

        logs.forEach(log => {
            let timestamp = log[0] || "-"; let evento = log[1] || "-"; let dettagli = log[2] || "-"; let ip = log[3] || "-"; let pos = log[4] || "-"; let coords = log[5] || "";
            let eventBadge = evento.includes("FAIL") ? `<span style="color:var(--rosso-allerta); font-weight:bold;">${evento}</span>` : evento;
            if (coords && evento.includes("FAIL")) {
                let latlon = coords.split(",");
                if (latlon.length === 2) {
                    L.circleMarker([parseFloat(latlon[0]), parseFloat(latlon[1])], { color: '#e74c3c', fillColor: '#e74c3c', fillOpacity: 0.7, radius: 8 }).addTo(threatMap).bindPopup(`<b>IP:</b> ${ip}<br><b>Loc:</b> ${pos}<br><b>Ora:</b> ${timestamp}`);
                    bounds.push([parseFloat(latlon[0]), parseFloat(latlon[1])]);
                }
            }
            html += `<tr style="border-bottom: 1px solid #eee;"><td style="padding:10px; font-size:13px; color:#666;">${timestamp}</td><td style="padding:10px;">${eventBadge}</td><td style="padding:10px; font-family:monospace; font-size:13px;">${dettagli}</td><td style="padding:10px; font-size:13px; color:var(--colore-principale);"><b>${ip}</b></td><td style="padding:10px; font-size:13px; color:#666;">${pos}</td></tr>`;
        });
        tbody.innerHTML = html;
        if (bounds.length > 0) threatMap.fitBounds(bounds, {padding: [50, 50], maxZoom: 10});
    }).catch(() => document.getElementById('security-log-body').innerHTML = '<tr><td colspan="5" style="padding:10px; text-align:center; color:red;">Errore di connessione.</td></tr>');
}

function svuotaSecurityLog(event) {
    if(!confirm("Sicuro di voler svuotare il registro di sicurezza?")) return;
    const btn = event.target; btn.innerText = "⏳"; btn.disabled = true;
    fetch(LINK_GOOGLE_SCRIPT, { method: "POST", body: JSON.stringify({ action: "clearSecurityLogs" }) }).then(() => { btn.innerText = "🗑️ Svuota Log"; btn.disabled = false; caricaSecurityLogs(); });
}

// --- GESTIONE UTENTI (SOLO ADMIN) ---
function caricaUtenti() {
    document.getElementById('lista-utenti-box').innerHTML = "Caricamento utenti... ⏳";
    fetch(LINK_GOOGLE_SCRIPT, { method: "POST", body: JSON.stringify({ action: "getUtenti" }) })
    .then(r => r.json())
    .then(utenti => {
        let html = "";
        utenti.forEach(u => {
            let badgeColor = u[2] === "ADMIN" ? "var(--blu-info)" : "var(--verde-ok)";
            let attivi = u[3]; // Dispositivi attivi salvati
            let limit = u[4];  // Max dispositivi configurati
            let slotInfo = `<span style="font-size:11px; color:#666; margin-left:10px;">Dispositivi: ${attivi}/${limit}</span>`;
            
            let btnSvuotaDisp = `<button onclick="svuotaDispositiviUtente('${u[0]}', event)" style="background:var(--giallo-attesa); color:#333; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-weight:bold; margin-right:5px;" title="Rimuove le associazioni Biometriche">📱 Sblocca Slot</button>`;
            let btnEdit = `<button onclick="apriModificaUtente('${u[0]}', '${u[2]}', ${limit})" style="background:#e0e6ed; color:#333; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-weight:bold; margin-right:5px;">✏️ Modifica</button>`;
            let btnDelete = u[0] === "admin" ? `<span style="font-size:12px; color:#999; margin-left:10px;">Ineliminabile</span>` : `<button onclick="eliminaUtente('${u[0]}', event)" style="background:var(--rosso-allerta); color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">🗑️ Elimina</button>`;
            
            html += `<div class="user-list-item"><div><strong>${u[0]}</strong> <span style="background:${badgeColor}; color:white; font-size:10px; padding:3px 8px; border-radius:10px; margin-left:10px;">${u[2]}</span>${slotInfo}</div><div style="margin-top:5px;">${btnSvuotaDisp}${btnEdit}${btnDelete}</div></div>`;
        });
        document.getElementById('lista-utenti-box').innerHTML = html;
    }).catch(() => document.getElementById('lista-utenti-box').innerHTML = "Errore di caricamento.");
}

function aggiungiUtente(event) {
    const newUser = document.getElementById('new-user').value.trim();
    const newPwd = document.getElementById('new-pwd').value;
    const newPwdConfirm = document.getElementById('new-pwd-confirm').value;
    const newRole = document.getElementById('new-role').value;
    const newMaxDev = document.getElementById('new-max-dev').value;
    
    if(!newUser || newPwd.length < 6) { mostraAlertCustom("Inserisci uno username valido e una password di almeno 6 caratteri.", "warning"); return; }
    if(newPwd !== newPwdConfirm) { mostraAlertCustom("Le due password non coincidono!", "warning"); return; }
    
    const btn = event.target; btn.innerText = "⏳"; btn.disabled = true;
    fetch(LINK_GOOGLE_SCRIPT, { method: "POST", body: JSON.stringify({ action: "addUtente", newUser: newUser, newPwd: newPwd, newRole: newRole, maxDev: newMaxDev }) })
    .then(r => r.text()).then(res => {
        btn.innerText = "➕ Crea"; btn.disabled = false;
        if(res === "ESISTE") {
            mostraAlertCustom("Username già in uso!", "warning");
        } else { 
            document.getElementById('new-user').value = ""; 
            document.getElementById('new-pwd').value = ""; 
            document.getElementById('new-pwd-confirm').value = ""; 
            document.getElementById('new-max-dev').value = "1";
            mostraAlertCustom("Utente creato con successo!", "success");
            caricaUtenti(); 
        }
    });
}

function apriModificaUtente(oldName, oldRole, maxDev) {
    document.getElementById('edit-user-oldname').value = oldName;
    document.getElementById('edit-user-newname').value = oldName;
    document.getElementById('edit-user-pwd').value = "";
    document.getElementById('edit-user-pwd-confirm').value = "";
    document.getElementById('edit-user-role').value = oldRole;
    document.getElementById('edit-user-max-dev').value = maxDev; 
    
    document.getElementById('edit-user-role').disabled = (oldName === "admin");
    document.getElementById('modificaUtenteModal').style.display = 'flex';
}

function salvaModificaUtente(event) {
    const oldName = document.getElementById('edit-user-oldname').value;
    const newName = document.getElementById('edit-user-newname').value.trim();
    const newPwd = document.getElementById('edit-user-pwd').value;
    const newPwdConfirm = document.getElementById('edit-user-pwd-confirm').value;
    const newRole = document.getElementById('edit-user-role').value;
    const newMaxDev = document.getElementById('edit-user-max-dev').value;

    if(!newName) { mostraAlertCustom("Il nome utente non può essere vuoto.", "warning"); return; }
    if(newPwd) {
        if(newPwd.length < 6) { mostraAlertCustom("La nuova password deve avere almeno 6 caratteri.", "warning"); return; }
        if(newPwd !== newPwdConfirm) { mostraAlertCustom("Le due password non coincidono!", "warning"); return; }
    }

    let btn = (event && event.target && event.target.tagName === 'BUTTON') ? event.target : document.querySelector('#modificaUtenteModal button');
    if(btn) { btn.innerText = "⏳"; btn.disabled = true; }

    fetch(LINK_GOOGLE_SCRIPT, { 
        method: "POST", 
        body: JSON.stringify({ action: "editUtente", oldUser: oldName, newUser: newName, newPwd: newPwd, newRole: newRole, maxDev: newMaxDev }) 
    })
    .then(r => r.text()).then(res => {
        if(btn) { btn.innerText = "💾 Salva Utente"; btn.disabled = false; }
        if (res === "ESISTE") {
            mostraAlertCustom("Il nuovo nome utente scelto è già in uso!", "warning");
        } else if (res === "KO") {
            mostraAlertCustom("Errore di sicurezza o utente non trovato.", "error");
        } else {
            chiudiModal('modificaUtenteModal');
            mostraAlertCustom("Modifiche salvate con successo!", "success");
            caricaUtenti();
        }
    });
}

function eliminaUtente(user, event) {
    if(!confirm("Sicuro di voler eliminare l'utente: " + user + "?")) return;
    const btn = event.target; btn.innerText = "⏳"; btn.disabled = true;
    fetch(LINK_GOOGLE_SCRIPT, { method: "POST", body: JSON.stringify({ action: "deleteUtente", targetUser: user }) })
    .then(() => caricaUtenti());
}

function svuotaDispositiviUtente(user, event) {
    if(!confirm(`Vuoi revocare tutti gli accessi biometrici per l'utente ${user}?`)) return;
    const btn = event.target; btn.innerText = "⏳"; btn.disabled = true;
    fetch(LINK_GOOGLE_SCRIPT, { method: "POST", body: JSON.stringify({ action: "clearUserDevices", targetUser: user }) })
    .then(() => {
        mostraAlertCustom(`Slot dispositivi azzerati per ${user}.`, "success");
        caricaUtenti();
    });
}

function caricaImpostazioni() {
    fetch(LINK_GOOGLE_SCRIPT, { method: "POST", body: JSON.stringify({ action: "getImpostazioni" }) }).then(r => r.json()).then(imp => {
        impostazioniGlobali = imp; document.getElementById('conf-wifi-nome').value = imp["wifi_nome"] || "Padresergio House"; document.getElementById('conf-wifi-pwd').value = imp["wifi_password"] || "PadreSergio2022*"; aggiornaUIKillSwitch(imp["maintenance_mode"] || "OFF");
    });
}

function salvaImpostazioni(event) {
    const btn = event.target; btn.innerText = "Salvataggio... ⏳"; btn.disabled = true;
    let nuoveImp = { "wifi_nome": document.getElementById('conf-wifi-nome').value, "wifi_password": document.getElementById('conf-wifi-pwd').value, "maintenance_mode": impostazioniGlobali["maintenance_mode"] || "OFF" };
    fetch(LINK_GOOGLE_SCRIPT, { method: "POST", body: JSON.stringify({ action: "saveImpostazioni", impostazioni: nuoveImp }) }).then(r => r.text()).then(res => {
        btn.innerText = "💾 Salva Impostazioni"; btn.disabled = false; if(res === "OK") { impostazioniGlobali = nuoveImp; mostraAlertCustom("Impostazioni salvate con successo!", "success"); }
    });
}

function caricaDati() {
    if (vistaAttuale === 'sicurezza') { caricaSecurityLogs(); return; } if (vistaAttuale === 'utenti') { caricaUtenti(); return; } if (vistaAttuale === 'impostazioni') { caricaImpostazioni(); return; }
    if(!['calendario', 'utenti', 'impostazioni', 'sicurezza'].includes(vistaAttuale)) document.getElementById('contenitore-schede').innerHTML = '<div id="loading-message">Sincronizzazione dati in corso... ⏳</div>';
    
    Promise.all([
        fetch(LINK_GOOGLE_SCRIPT).then(r => r.json()), fetch(LINK_GOOGLE_SCRIPT + "?tipo=richieste").then(r => r.json()),
        (localStorage.getItem('userRole') === 'ADMIN') ? fetch(LINK_GOOGLE_SCRIPT, { method: "POST", body: JSON.stringify({ action: "getImpostazioni" }) }).then(r=>r.json()) : Promise.resolve({})
    ]).then(([checkins, richieste, imp]) => {
        dbCheckin = checkins.reverse(); dbRichieste = richieste.reverse();
        if(imp.wifi_password) { impostazioniGlobali = imp; aggiornaUIKillSwitch(imp["maintenance_mode"] || "OFF"); }
        if (vistaAttuale === 'calendario') generaCalendario(); else if (!['utenti', 'impostazioni', 'sicurezza'].includes(vistaAttuale)) renderizzaSchedeODashboard();
    }).catch(() => {
        if(!['calendario', 'utenti', 'impostazioni', 'sicurezza'].includes(vistaAttuale)) document.getElementById('contenitore-schede').innerHTML = '<div id="loading-message" style="color:red;">Errore di connessione al database.</div>';
    });
}

function renderizzaSchedeODashboard() {
    if (['calendario', 'utenti', 'impostazioni', 'sicurezza'].includes(vistaAttuale)) return;
    if (vistaAttuale === 'dashboard') { generaDashboard(); return; }

    const cont = document.getElementById('contenitore-schede'); cont.innerHTML = ''; 
    let oggi = new Date(); oggi.setHours(0,0,0,0); let elementiMostrati = 0;

    if (vistaAttuale === "checkin" || vistaAttuale === "archivio") {
        dbCheckin.forEach((riga, index) => {
            let dOut = parseData(riga[2]); if(!dOut) return;
            let isArchivio = (dOut < oggi); if ((vistaAttuale === 'checkin' && isArchivio) || (vistaAttuale === 'archivio' && !isArchivio)) return;
            
            elementiMostrati++; let stato = riga[14] || "Da Controllare";
            let clCard = (stato.includes("Approvato")) ? "card approvato" : (stato === "Bloccato" ? "card bloccato" : "card"); if(vistaAttuale === 'archivio') clCard = "card archivio";
            let clBadge = (stato.includes("Approvato")) ? "badge ok" : (stato === "Bloccato" ? "badge nero" : "badge attesa"); if(vistaAttuale === 'archivio') clBadge = "badge grigio";

            let bottoni = "";
            if(vistaAttuale !== 'archivio') {
                if (stato.includes("Approvato")) {
                    let nomePulito = String(riga[4] || "").replace(/'/g, "\\'"); bottoni = `<button class="btn-email" onclick="copiaMessaggio('${nomePulito}', '${riga[1]}')">💬 Copia Benvenuto</button><button class="btn-dettagli admin-only" style="background:var(--blu-info); color:white;" onclick="generaCSVCompleto(dbCheckin[${index}])">📥 Ri-scarica CSV</button>`;
                } else if (stato === "Bloccato") {
                    bottoni = `<button class="btn-rifiuta" disabled style="background:#ccc; cursor:not-allowed;">✏️ Bloccato</button><button class="btn-approva" disabled style="background:#ccc; cursor:not-allowed;">🚫 Bloccato</button>`;
                } else {
                    bottoni = `<button class="btn-rifiuta" onclick="apriModifica(${index})">✏️ Correggi</button><button class="btn-approva" onclick="approvaEScarica(${index}, event)">✅ Approva</button><button class="btn-rifiuta" style="background-color: var(--nero-blocco);" onclick="bloccaCheckin(${index}, event)">🚫 Blocca</button>`;
                }
            }

            cont.innerHTML += `<div class="${clCard}"><div class="card-header"><h3 class="ospite-nome">${riga[4]} ${riga[5]}</h3><span class="${clBadge}">${vistaAttuale==='archivio' ? 'ARCHIVIATO' : stato}</span></div><div class="card-dettagli"><div><strong>Arrivo:</strong> ${riga[1]}</div><div><strong>Partenza:</strong> ${riga[2]}</div><div><strong>Ospiti:</strong> ${riga[3]}</div></div><div class="btn-group"><button class="btn-dettagli" onclick="apriDettagli(${index})">👁️ Foto / Info</button>${bottoni}</div></div>`;
        });
    } else if (vistaAttuale === "richieste") {
        dbRichieste.forEach((riga, index) => {
            elementiMostrati++; let statoRichiesta = riga[9] || "Da Contattare";
            let clCardRichiesta = "card"; let clBadgeRichiesta = "badge attesa";
            
            if (statoRichiesta === "Accettata") { clCardRichiesta = "card richiesta-accettata"; clBadgeRichiesta = "badge blu"; } else if (statoRichiesta === "Rifiutata") { clCardRichiesta = "card richiesta-rifiutata"; clBadgeRichiesta = "badge rosso"; }

            let bottoniRichiesta = "";
            if (statoRichiesta !== "Accettata" && statoRichiesta !== "Rifiutata") {
                bottoniRichiesta = `<button class="btn-approva" onclick="cambiaStatoRichiesta(${index}, 'Accettata', event)">✅ Accetta</button><button class="btn-rifiuta" onclick="cambiaStatoRichiesta(${index}, 'Rifiutata', event)">❌ Rifiuta</button>`;
            } else {
                let esito = statoRichiesta.toLowerCase(); let linkWa = generaLinkMessaggio(riga[1], riga[5], riga[6], riga[4], riga[3], 'whatsapp', esito); let linkMail = generaLinkMessaggio(riga[1], riga[5], riga[6], riga[4], riga[3], 'email', esito);
                bottoniRichiesta = `<a href="${linkMail}" class="btn-email">📧 Mail Proposta</a><a href="${linkWa}" target="_blank" class="btn-whatsapp">💬 WA Proposta</a>`;
            }

            cont.innerHTML += `<div class="${clCardRichiesta}"><div class="card-header"><h3 class="ospite-nome">${riga[1]} ${riga[2]}</h3><span class="${clBadgeRichiesta}">${statoRichiesta.toUpperCase()}</span></div><div class="card-dettagli"><div><strong>Periodo:</strong> ${riga[5]} ➔ ${riga[6]}</div><div><strong>Ospiti:</strong> ${riga[7]}</div></div><div class="btn-group"><button class="btn-dettagli" onclick="apriInfoRichiesta(${index})">👁️ Vedi Info</button>${bottoniRichiesta}</div></div>`;
        });
    }
    if(elementiMostrati === 0) cont.innerHTML = '<div id="loading-message">Nessun dato presente in questa sezione.</div>';
}

function generaDashboard() {
    const cont = document.getElementById('contenitore-schede'); let oggi = new Date(); oggi.setHours(0,0,0,0);
    let giorniNelMeseScelto = new Date(annoCorrente, meseCorrente + 1, 0).getDate(); let ospitiTotaliStorico = 0; let nottiOccupateMeseScelto = 0; let prossimiArrivi = 0;
    let labelsGiorni = []; let dataOccupazione = [];
    
    for(let i=1; i<=giorniNelMeseScelto; i++) { labelsGiorni.push(i); dataOccupazione.push(0); }

    function calcolaNottiEPopolaGrafico(dIn, dOut) {
        let count = 0; for(let d=1; d<=giorniNelMeseScelto; d++) { let date = new Date(annoCorrente, meseCorrente, d); if(date >= dIn && date < dOut) { count++; dataOccupazione[d-1] = 1; } } return count;
    }

    dbCheckin.forEach(c => {
        if(c[14] === "Bloccato" || !c[14].includes("Approvato")) return; let dIn = parseData(c[1]); let dOut = parseData(c[2]); if(!dIn || !dOut) return;
        ospitiTotaliStorico += parseInt(c[3]) || 0; nottiOccupateMeseScelto += calcolaNottiEPopolaGrafico(dIn, dOut);
        let diffGiorni = (dIn - oggi) / (1000 * 60 * 60 * 24); if(diffGiorni >= 0 && diffGiorni <= 7) prossimiArrivi++;
    });

    dbRichieste.forEach(r => {
        if(r[9] !== "Accettata") return; let dIn = parseData(r[5]); let dOut = parseData(r[6]); if(!dIn || !dOut) return;
        ospitiTotaliStorico += parseInt(r[7]) || 0; nottiOccupateMeseScelto += calcolaNottiEPopolaGrafico(dIn, dOut);
        let diffGiorni = (dIn - oggi) / (1000 * 60 * 60 * 24); if(diffGiorni >= 0 && diffGiorni <= 7) prossimiArrivi++;
    });

    let tassoOccupazione = Math.round((nottiOccupateMeseScelto / giorniNelMeseScelto) * 100); if (tassoOccupazione > 100) tassoOccupazione = 100;

    cont.innerHTML = `
        <div class="dash-nav-mese" style="grid-column: 1 / -1; background: white; padding: 16px 20px; border-radius: 12px; box-shadow: var(--ombra-card); display: flex; justify-content: space-between; align-items: center;">
            <button onclick="cambiaMese(-1)" style="padding: 10px 18px; cursor: pointer; border: none; background: var(--colore-sfondo); border-radius: 8px; font-weight: bold; color: var(--colore-principale); font-size: 14px; transition: background 0.2s;">❮ Mese Prec.</button>
            <h2 style="color: var(--colore-principale); margin: 0; font-family: 'Georgia', serif; font-size: 20px;">${MESI[meseCorrente]} ${annoCorrente}</h2>
            <button onclick="cambiaMese(1)" style="padding: 10px 18px; cursor: pointer; border: none; background: var(--colore-sfondo); border-radius: 8px; font-weight: bold; color: var(--colore-principale); font-size: 14px; transition: background 0.2s;">Mese Succ. ❯</button>
        </div>
        <div class="dashboard-grid">
            <div class="dash-card"><div class="dash-icon">📈</div><div class="dash-value">${tassoOccupazione}%</div><div class="dash-label">Occupazione Mensile</div></div>
            <div class="dash-card"><div class="dash-icon">👥</div><div class="dash-value">${ospitiTotaliStorico}</div><div class="dash-label">Ospiti Totali (Storico)</div></div>
            <div class="dash-card"><div class="dash-icon">🛎️</div><div class="dash-value">${prossimiArrivi}</div><div class="dash-label">Arrivi in 7 gg (Da Oggi)</div></div>
        </div>
        <div class="grafico-container" style="grid-column: 1 / -1; margin-top: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <button onclick="cambiaMese(-1)" style="padding: 8px 14px; cursor: pointer; border: none; background: var(--colore-sfondo); border-radius: 7px; font-weight: bold; color: var(--colore-principale);">❮ Prec</button>
                <h3 style="margin: 0; color: var(--colore-principale); text-align: center; font-family: 'Georgia', serif;">Andamento Mensile (${MESI[meseCorrente]} ${annoCorrente})</h3>
                <button onclick="cambiaMese(1)" style="padding: 8px 14px; cursor: pointer; border: none; background: var(--colore-sfondo); border-radius: 7px; font-weight: bold; color: var(--colore-principale);">Succ ❯</button>
            </div>
            <canvas id="occupazioneChart" height="80"></canvas>
        </div>
    `;

    setTimeout(() => {
        const ctx = document.getElementById('occupazioneChart').getContext('2d'); if (graficoOccupazione != null) { graficoOccupazione.destroy(); }
        graficoOccupazione = new Chart(ctx, { type: 'bar', data: { labels: labelsGiorni, datasets: [{ label: 'Notte Occupata', data: dataOccupazione, backgroundColor: dataOccupazione.map(v => v === 1 ? 'rgba(94, 113, 83, 0.8)' : 'rgba(232, 248, 245, 0.5)'), borderColor: dataOccupazione.map(v => v === 1 ? '#5e7153' : '#bdc3c7'), borderWidth: 1, borderRadius: 4 }] }, options: { responsive: true, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(c) { return c.raw === 1 ? "Occupato" : "Libero"; } } } }, scales: { y: { beginAtZero: true, max: 1, ticks: { stepSize: 1, callback: function(v) { return v === 1 ? 'Sì' : 'No'; } } } } } });
    }, 100);
}

function cambiaMese(dir) { meseCorrente += dir; if(meseCorrente > 11) { meseCorrente = 0; annoCorrente++; } if(meseCorrente < 0) { meseCorrente = 11; annoCorrente--; } if (vistaAttuale === 'dashboard') generaDashboard(); else if (vistaAttuale === 'calendario') generaCalendario(); }

function generaCalendario() {
    document.getElementById('mese-anno-titolo').innerText = MESI[meseCorrente] + " " + annoCorrente;
    const griglia = document.getElementById('griglia-giorni'); griglia.innerHTML = `<div class="giorno-nome">Lun</div><div class="giorno-nome">Mar</div><div class="giorno-nome">Mer</div><div class="giorno-nome">Gio</div><div class="giorno-nome">Ven</div><div class="giorno-nome">Sab</div><div class="giorno-nome">Dom</div>`;

    let primoGiorno = new Date(annoCorrente, meseCorrente, 1).getDay(); if(primoGiorno === 0) primoGiorno = 7; 
    let giorniNelMese = new Date(annoCorrente, meseCorrente + 1, 0).getDate();

    for(let i=1; i<primoGiorno; i++) griglia.innerHTML += '<div class="giorno-box vuoto"></div>';
    const escapeStr = (str) => String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');

    for(let g=1; g<=giorniNelMese; g++) {
        let dataCorrente = new Date(annoCorrente, meseCorrente, g); let occupantiAM = []; let occupantiPM = []; 

        for(let i=0; i<dbCheckin.length; i++) {
            let r = dbCheckin[i]; if(!r[14] || !r[14].includes("Approvato")) continue;
            let dIn = parseData(r[1]); let dOut = parseData(r[2]); if(!dIn || !dOut) continue; dIn.setHours(0,0,0,0); dOut.setHours(0,0,0,0);
            let ospiteObj = {n: String(r[4]||"")+" "+String(r[5]||""), o: String(r[3]||""), i: String(r[1]||""), f: String(r[2]||""), t: "Check-in Registrato"};
            if(dataCorrente > dIn && dataCorrente < dOut) { occupantiAM.push(ospiteObj); occupantiPM.push(ospiteObj); }
            else if (dataCorrente.getTime() === dIn.getTime()) { occupantiPM.push(ospiteObj); } else if (dataCorrente.getTime() === dOut.getTime()) { occupantiAM.push(ospiteObj); }
        }

        for(let i=0; i<dbRichieste.length; i++) {
            let r = dbRichieste[i]; if(r[9] !== "Accettata") continue;
            let dIn = parseData(r[5]); let dOut = parseData(r[6]); if(!dIn || !dOut) continue; dIn.setHours(0,0,0,0); dOut.setHours(0,0,0,0);
            let ospiteObj = {n: String(r[1]||"")+" "+String(r[2]||""), o: String(r[7]||""), i: String(r[5]||""), f: String(r[6]||""), t: "Prenotazione dal Sito"};
            if(dataCorrente > dIn && dataCorrente < dOut) { occupantiAM.push(ospiteObj); occupantiPM.push(ospiteObj); }
            else if (dataCorrente.getTime() === dIn.getTime()) { occupantiPM.push(ospiteObj); } else if (dataCorrente.getTime() === dOut.getTime()) { occupantiAM.push(ospiteObj); }
        }

        let isAM = occupantiAM.length > 0; let isPM = occupantiPM.length > 0; let boxHtml = "";

        if (isAM && isPM) {
            if (occupantiAM[0].n === occupantiPM[0].n) {
                let o = occupantiAM[0]; boxHtml = `<div class="giorno-box occupato-full" onclick="mostraAnteprimaCalendario('${escapeStr(o.n)}', '${escapeStr(o.o)}', '${escapeStr(o.i)}', '${escapeStr(o.f)}', '${escapeStr(o.t)}')">${g}<br><span style="font-size:9px; text-transform:uppercase;">Occupato</span><br><span class="nome-calendario">${o.n}</span></div>`;
            } else {
                let oIn = occupantiPM[0]; boxHtml = `<div class="giorno-box occupato-full" onclick="mostraAnteprimaCalendario('${escapeStr(oIn.n)}', '${escapeStr(oIn.o)}', '${escapeStr(oIn.i)}', '${escapeStr(oIn.f)}', '${escapeStr(oIn.t)}')">${g}<br><span style="font-size:9px; text-transform:uppercase;">Cambio</span><br><span class="nome-calendario">↑ ${occupantiAM[0].n}</span><span class="nome-calendario">↓ ${occupantiPM[0].n}</span></div>`;
            }
        } else if (isPM) {
            let o = occupantiPM[0]; boxHtml = `<div class="giorno-box occupato-pm" onclick="mostraAnteprimaCalendario('${escapeStr(o.n)}', '${escapeStr(o.o)}', '${escapeStr(o.i)}', '${escapeStr(o.f)}', '${escapeStr(o.t)}')">${g}<br><span style="font-size:9px; text-transform:uppercase;">Check-in</span><br><span class="nome-calendario" style="text-align:right; padding-right:4px;">${o.n}</span></div>`;
        } else if (isAM) {
            let o = occupantiAM[0]; boxHtml = `<div class="giorno-box occupato-am" onclick="mostraAnteprimaCalendario('${escapeStr(o.n)}', '${escapeStr(o.o)}', '${escapeStr(o.i)}', '${escapeStr(o.f)}', '${escapeStr(o.t)}')">${g}<br><span style="font-size:9px; text-transform:uppercase;">Check-out</span><br><span class="nome-calendario" style="text-align:left; padding-left:4px;">${o.n}</span></div>`;
        } else { boxHtml = `<div class="giorno-box libero">${g}<br><span style="font-size:9px; text-transform:uppercase;">Libero</span></div>`; }
        griglia.innerHTML += boxHtml;
    }
}

function mostraAnteprimaCalendario(nome, ospiti, arrivo, partenza, stato) {
    document.getElementById('anteprima-nome').innerText = nome; document.getElementById('anteprima-ospiti').innerText = ospiti; document.getElementById('anteprima-arrivo').innerText = arrivo; document.getElementById('anteprima-partenza').innerText = partenza; document.getElementById('anteprima-stato').innerText = stato; document.getElementById('anteprima-stato').style.color = stato.includes("Sito") ? "var(--blu-info)" : "var(--rosso-allerta)"; document.getElementById('anteprimaCalendarioModal').style.display = 'flex';
}

function copiaMessaggio(nome, dataArrivo) {
    const msg = `Ciao ${nome}, ti aspettiamo a PadreSergio House il ${dataArrivo}!\n\nIl check-in è disponibile a partire dalle 15:00. Ti inviamo a breve la posizione esatta.\n\nA presto!`; navigator.clipboard.writeText(msg).then(() => mostraAlertCustom("Messaggio copiato negli appunti!", "success"));
}

function generaLinkMessaggio(nome, arrivo, partenza, telefono, email, tipo, esito) {
    let testo = ""; let url = "";
    if (esito === 'accettata') { testo = `Ciao ${nome},\nsiamo felici di confermarti la disponibilità per le date dal ${arrivo} al ${partenza}!\n\nPer confermare la prenotazione e ricevere i dettagli sul pagamento, rispondi a questo messaggio.\n\nTi aspettiamo a PadreSergio House!`; } else { testo = `Gentile ${nome},\nti ringraziamo per aver scelto PadreSergio House. Purtroppo per le date dal ${arrivo} al ${partenza} non abbiamo disponibilità in quanto la struttura è già occupata.\n\nSperiamo di poterti accogliere in futuro!\n\nCordiali saluti,\nPadreSergio House`; }
    if (tipo === 'whatsapp') url = `https://wa.me/${String(telefono || '').replace(/\D/g, '')}?text=${encodeURIComponent(testo)}`; else if (tipo === 'email') url = `mailto:${email || ''}?subject=${encodeURIComponent(esito === 'accettata' ? "Disponibilità Confermata" : "Aggiornamento Disponibilità")}&body=${encodeURIComponent(testo)}`; return url;
}

function cambiaStatoRichiesta(index, nuovoStato, event) {
    if (nuovoStato === 'Accettata') {
        let req = dbRichieste[index]; let dReqIn = parseData(req[5]); let dReqOut = parseData(req[6]);
        if (dReqIn && dReqOut) {
            let overlap = false; let overlapNome = "";
            for (let c of dbCheckin) {
                if (c[14] === "Bloccato" || !c[14].includes("Approvato")) continue;
                let dIn = parseData(c[1]); let dOut = parseData(c[2]); if (dIn && dOut && dReqIn < dOut && dReqOut > dIn) { overlap = true; overlapNome = (c[4]||"")+" "+(c[5]||""); break; }
            }
            if (!overlap) {
                for (let i = 0; i < dbRichieste.length; i++) {
                    if (i === index || dbRichieste[i][9] !== "Accettata") continue;
                    let c = dbRichieste[i]; let dIn = parseData(c[5]); let dOut = parseData(c[6]); if (dIn && dOut && dReqIn < dOut && dReqOut > dIn) { overlap = true; overlapNome = (c[1]||"")+" "+(c[2]||""); break; }
                }
            }
            if (overlap) { mostraAlertCustom(`IMPOSSIBILE ACCETTARE: SOVRAPPOSIZIONE DATE!\n\nQuesta richiesta coincide con le date di: ${overlapNome}.`, "warning"); return; }
        }
    }
    const btn = event.target; btn.innerText = "Attendere..."; btn.disabled = true; fetch(LINK_GOOGLE_SCRIPT, { method: "POST", body: JSON.stringify({ action: "updateStatusRichiesta", row: dbRichieste.length - 1 - index, status: nuovoStato }) }).then(() => caricaDati());
}

function apriInfoRichiesta(index) {
    const r = dbRichieste[index]; document.getElementById('modal-titolo').innerText = `Richiesta: ${r[1]} ${r[2]}`; document.getElementById('contenuto-modale').innerHTML = `<div class="sezione-dati"><p><strong>Periodo:</strong> dal ${r[5]} al ${r[6]}</p><p><strong>Ospiti:</strong> ${r[7]}</p><p><strong>Contatti:</strong> ${r[3]} | Tel. ${r[4]}</p><p><strong>Messaggio:</strong><br><i>"${r[8] || 'Nessun messaggio'}"</i></p></div>`; document.getElementById('dettagliModal').style.display = 'flex';
}

function chiudiModal(id) { document.getElementById(id).style.display = 'none'; }

function apriDettagli(index) {
    const riga = dbCheckin[index]; document.getElementById('modal-titolo').innerText = 'Dettagli: ' + riga[4] + ' ' + riga[5];
    let f1 = (riga[12] && riga[12] !== "N/A") ? `<a href="${riga[12]}" target="_blank" class="foto-doc-link">📸 Apri Foto Fronte (Capogruppo)</a>` : ''; let f2 = (riga[13] && riga[13] !== "N/A") ? `<a href="${riga[13]}" target="_blank" class="foto-doc-link">📸 Apri Foto Retro (Capogruppo)</a>` : '';
    let extraStr = riga[15] || 'Nessuno';
    if (extraStr !== 'Nessuno') {
        extraStr = extraStr.replace(/Foto Fronte: (https?:\/\/[^\s]+)/g, '<br><a href="$1" target="_blank" class="foto-doc-link" style="margin-top: 5px;">📸 Apri Foto Fronte</a>'); extraStr = extraStr.replace(/Foto Retro: (https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="foto-doc-link" style="margin-top: 5px;">📸 Apri Foto Retro</a><br>'); extraStr = extraStr.replace(/Foto Fronte: N\/A/g, ''); extraStr = extraStr.replace(/Foto Retro: N\/A/g, '');
    }
    document.getElementById('contenuto-modale').innerHTML = `<div class="sezione-dati"><p style="font-size:14px;"><strong>Doc:</strong> ${riga[6]}<br><strong>Nato:</strong> ${riga[8]} a ${riga[9]}<br><strong>Naz:</strong> ${riga[10]} | <strong>Res:</strong> ${riga[11]}</p><div>${f1} ${f2}</div><hr><strong>Extra:</strong><pre style="white-space:pre-wrap; font-size:13px; font-family:inherit;">${extraStr}</pre></div>`; document.getElementById('dettagliModal').style.display = 'flex';
}

function formattaDataPerInput(d) { if(!d) return ""; let p = String(d).split('/'); if(p.length === 3) return `${p[2]}-${p[1]}-${p[0]}`; return d; }

function apriModifica(index) {
    const r = dbCheckin[index]; document.getElementById('edit-index').value = index; document.getElementById('edit-arrivo').value = formattaDataPerInput(r[1]); document.getElementById('edit-partenza').value = formattaDataPerInput(r[2]); document.getElementById('edit-nome').value = r[4]; document.getElementById('edit-cognome').value = r[5]; document.getElementById('edit-doc').value = r[6]; document.getElementById('edit-nascita').value = r[8]; document.getElementById('edit-luogo').value = r[9]; document.getElementById('edit-nazionalita').value = r[10]; document.getElementById('edit-residenza').value = r[11]; document.getElementById('edit-ospitiExtra').value = r[15] || ""; document.getElementById('modificaModal').style.display = 'flex';
}

function approvaEScarica(index, event) {
    let chk = dbCheckin[index]; let dReqIn = parseData(chk[1]); let dReqOut = parseData(chk[2]);
    if (dReqIn && dReqOut) {
        let overlap = false; let overlapNome = "";
        for (let i = 0; i < dbCheckin.length; i++) {
            if (i === index) continue; let c = dbCheckin[i]; if (!c[14] || !c[14].includes("Approvato")) continue; let dIn = parseData(c[1]); let dOut = parseData(c[2]);
            if (dIn && dOut && dReqIn < dOut && dReqOut > dIn) { overlap = true; overlapNome = (c[4]||"")+" "+(c[5]||""); break; }
        }
        if (!overlap) {
            for (let r of dbRichieste) {
                if (r[9] !== "Accettata") continue; let dIn = parseData(r[5]); let dOut = parseData(r[6]);
                if (dIn && dOut && dReqIn < dOut && dReqOut > dIn) { overlap = true; overlapNome = (r[1]||"")+" "+(r[2]||""); break; }
            }
        }
        if (overlap) { mostraAlertCustom(`IMPOSSIBILE PROCEDERE: SOVRAPPOSIZIONE DATE!\n\nQuesto check-in coincide con le date di: ${overlapNome}.`, "warning"); return; }
    }
    const btn = event.target; btn.innerText = "Salvataggio in corso...💾"; btn.disabled = true; fetch(LINK_GOOGLE_SCRIPT, { method: "POST", body: JSON.stringify({ action: "updateStatus", row: dbCheckin.length - 1 - index, status: "Approvato" }) }).then(() => { generaCSVCompleto(dbCheckin[index]); caricaDati(); });
}

function bloccaCheckin(index, event) { 
    if(!confirm("Sei sicuro di voler bloccare?")) return; 
    const btn = event.target; btn.innerText = "Attendere..."; btn.disabled = true; 
    fetch(LINK_GOOGLE_SCRIPT, { method: "POST", body: JSON.stringify({ action: "updateStatus", row: dbCheckin.length - 1 - index, status: "Bloccato" }) }).then(() => caricaDati()); 
}

function salvaModifiche(event, approva) {
    const index = document.getElementById('edit-index').value; let chk = dbCheckin[index]; let dReqIn = parseData(chk[1]); let dReqOut = parseData(chk[2]);
    if (approva && dReqIn && dReqOut) {
        let overlap = false; let overlapNome = "";
        for (let i = 0; i < dbCheckin.length; i++) {
            if (i == index) continue; let c = dbCheckin[i]; if (!c[14] || !c[14].includes("Approvato")) continue; let dIn = parseData(c[1]); let dOut = parseData(c[2]);
            if (dIn && dOut && dReqIn < dOut && dReqOut > dIn) { overlap = true; overlapNome = (c[4]||"")+" "+(c[5]||""); break; }
        }
        if (!overlap) {
            for (let r of dbRichieste) {
                if (r[9] !== "Accettata") continue; let dIn = parseData(r[5]); let dOut = parseData(r[6]);
                if (dIn && dOut && dReqIn < dOut && dReqOut > dIn) { overlap = true; overlapNome = (r[1]||"")+" "+(r[2]||""); break; }
            }
        }
        if (overlap) { mostraAlertCustom(`IMPOSSIBILE APPROVARE: SOVRAPPOSIZIONE DATE!\n\nI dati coincidono con le date di: ${overlapNome}.`, "warning"); return; }
    }
    const btn = event.target; const testoOriginale = btn.innerText; btn.innerText = "Salvataggio... ⏳"; btn.disabled = true;
    const payload = {
        action: "editDati", row: dbCheckin.length - 1 - index, checkin: document.getElementById('edit-arrivo').value, checkout: document.getElementById('edit-partenza').value, nome: document.getElementById('edit-nome').value, cognome: document.getElementById('edit-cognome').value, documento: document.getElementById('edit-doc').value, nascita: document.getElementById('edit-nascita').value, luogoNascita: document.getElementById('edit-luogo').value, nazionalita: document.getElementById('edit-nazionalita').value, residenza: document.getElementById('edit-residenza').value, ospitiExtra: document.getElementById('edit-ospitiExtra').value, approva: approva
    };
    fetch(LINK_GOOGLE_SCRIPT, { method: "POST", body: JSON.stringify(payload) }).then(() => { 
        let rAgg = [...dbCheckin[index]]; rAgg[1]=payload.checkin; rAgg[2]=payload.checkout; rAgg[4]=payload.nome; rAgg[5]=payload.cognome; rAgg[8]=payload.nascita; rAgg[9]=payload.luogoNascita; rAgg[10]=payload.nazionalita; rAgg[11]=payload.residenza; rAgg[15]=payload.ospitiExtra;
        // Ricalcola il numero totale ospiti: 1 (capogruppo) + numero di ospiti extra
        let numExtra = (payload.ospitiExtra || "").split("--- OSPITE").length - 1;
        rAgg[3] = 1 + numExtra;
        if (approva) { rAgg[14] = "Corretto e Approvato"; generaCSVCompleto(rAgg); } chiudiModal('modificaModal'); caricaDati(); btn.innerText = testoOriginale; btn.disabled = false;
    });
}

function generaCSVCompleto(riga) {
    const LICENZA = "SLBA000982-0018"; let csv = []; const fmtS = (s) => String(s).toUpperCase().startsWith('M') ? "1" : "2";
    let nascitaCapo = getCodiciLuogo(riga[9]); let resCapo = getCodiciLuogo(riga[11]); let nazCapo = getCodiceNazione(riga[10]);
    csv.push([1, String(riga[4]||"").toUpperCase(), String(riga[5]||"").toUpperCase(), parseDataString(riga[1]), parseDataString(riga[2]), "", LICENZA, fmtS(riga[7]||""), parseDataString(riga[8]), "", "", nascitaCapo.nazione, nascitaCapo.comune, resCapo.nazione, resCapo.comune, nazCapo].join(","));
    let extraStr = riga[15] || "";
    if (extraStr.includes("--- OSPITE")) {
        extraStr.split("--- OSPITE").slice(1).forEach(blocco => {
            let c = blocco.match(/Cognome: (.*)/)?.[1] || ""; let n = blocco.match(/Nome: (.*)/)?.[1] || ""; let s = blocco.match(/Sesso: (.*)/)?.[1] || ""; let d = (blocco.match(/Nascita: (.*?) a /) || [])[1] || ""; let luogoNascitaOspite = (blocco.match(/Nascita: .*? a (.*)/) || [])[1] || ""; let nazionalitaOspite = blocco.match(/Nazionalità: (.*)/)?.[1] || ""; let residenzaOspite = blocco.match(/Residenza: (.*)/)?.[1] || "";
            let nascitaOsp = getCodiciLuogo(luogoNascitaOspite); let resOsp = getCodiciLuogo(residenzaOspite); let nazOsp = getCodiceNazione(nazionalitaOspite);
            csv.push([1, n.trim().toUpperCase(), c.trim().toUpperCase(), parseDataString(riga[1]), parseDataString(riga[2]), "", LICENZA, fmtS(s), parseDataString(d.trim()), "", "", nascitaOsp.nazione, nascitaOsp.comune, resOsp.nazione, resOsp.comune, nazOsp].join(","));
        });
    }
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv.join("\n")], { type: 'text/csv;charset=utf-8;' })); link.download = `PayTourist_${riga[5]}.csv`; link.click();
}

function parseData(s) { if(!s) return null; let p = String(s).includes('-') ? String(s).split('-') : (String(s).includes('/') ? String(s).split('/') : []); if(p.length !== 3) return null; return p[0].length === 4 ? new Date(p[0], p[1]-1, p[2]) : new Date(p[2], p[1]-1, p[0]); }
function parseDataString(s) { if(!s) return ""; let p = String(s).includes('-') ? String(s).split('-') : (String(s).includes('/') ? String(s).split('/') : []); if(p.length !== 3) return s; return p[0].length === 4 ? `${p[2]}/${p[1]}/${p[0]}` : s; }

function esci() {
    localStorage.removeItem('adminSessionExp'); localStorage.removeItem('userRole'); localStorage.removeItem('currentUser');
    document.body.className = ""; document.getElementById('main-content').style.display = 'none'; document.getElementById('login-screen').style.display = 'flex'; document.getElementById('usernameInput').value = ''; document.getElementById('passwordInput').value = ''; document.getElementById('messaggioErrore').style.display = 'none';
}

function controllaSessione() {
    let exp = localStorage.getItem('adminSessionExp');
    if (exp && Date.now() < parseInt(exp)) {
        localStorage.setItem('adminSessionExp', Date.now() + 5 * 60 * 1000); let ruolo = localStorage.getItem('userRole') || 'base';
        document.body.className = "role-" + ruolo.toLowerCase(); document.getElementById('login-screen').style.display = 'none'; document.getElementById('main-content').style.display = 'block';
        aggiornaUIBiometria(); 
        caricaDati(); controllaCompleanno(); controllaScadenzaPassword(); 
    } else { esci(); }
}
window.addEventListener('load', controllaSessione);

function controllaCompleanno() {
    const oggi = new Date(); const mese = oggi.getMonth(); const giorno = oggi.getDate(); const anno = oggi.getFullYear(); const auguriFatti = localStorage.getItem('auguri_compleanno_' + anno);
    if (mese === 4 && giorno === 23 && !auguriFatti) { document.getElementById('schermata-compleanno').style.display = 'flex'; lanciaCoriandoli(); }
}
function chiudiCompleanno() { const anno = new Date().getFullYear(); localStorage.setItem('auguri_compleanno_' + anno, 'true'); document.getElementById('schermata-compleanno').style.display = 'none'; }
function lanciaCoriandoli() {
    const durata = 5 * 1000; const fineAnimazione = Date.now() + durata; const coloriStruttura = ['#5e7153', '#f39c12', '#27ae60', '#ffffff']; 
    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: coloriStruttura, zIndex: 100001 });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: coloriStruttura, zIndex: 100001 });
        if (Date.now() < fineAnimazione) { requestAnimationFrame(frame); }
    }());
}

// ==========================================
// FASE 3: MOTORE BIOMETRICO (WEBAUTHN MDM)
// ==========================================

window.addEventListener('load', () => {
    if (localStorage.getItem('biometric_token') && window.PublicKeyCredential) {
        document.getElementById('btn-biometria').style.display = 'block';
    }
});

function aggiornaUIBiometria() {
    const btn = document.getElementById('btn-registra-bio');
    if (!btn) return;
    let token = localStorage.getItem('biometric_token');
    
    if (token) {
        btn.innerHTML = "❌ Rimuovi Biometria";
        btn.style.backgroundColor = "var(--rosso-allerta)";
        btn.style.color = "white";
        btn.setAttribute('onclick', 'rimuoviBiometria()');
    } else {
        btn.innerHTML = "👆 Abilita Biometria";
        btn.style.backgroundColor = ""; 
        btn.style.color = "";
        btn.setAttribute('onclick', 'registraBiometria()');
    }
}

async function registraBiometria() {
    if (!window.PublicKeyCredential) {
        mostraAlertCustom("Il tuo browser o dispositivo non supporta l'autenticazione biometrica sicura.", "warning");
        return;
    }
    
    let currentUser = localStorage.getItem('currentUser');
    if (!currentUser) { mostraAlertCustom("Devi essere loggato per abilitare il dispositivo.", "warning"); return; }

    try {
        const token = crypto.randomUUID(); 
        const challenge = new Uint8Array(32); window.crypto.getRandomValues(challenge);
        const userId = new Uint8Array(16); window.crypto.getRandomValues(userId);

        const pubKey = {
            challenge: challenge,
            rp: { name: "PadreSergio Security" },
            user: { id: userId, name: currentUser, displayName: currentUser },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
            authenticatorSelection: { userVerification: "preferred" },
            timeout: 60000,
            attestation: "none"
        };

        const cred = await navigator.credentials.create({ publicKey: pubKey });
        
        if (cred) {
            const btn = document.getElementById('btn-registra-bio');
            const testoOriginale = btn.innerText;
            btn.innerText = "⏳ Sincronizzazione...";

            fetch(LINK_GOOGLE_SCRIPT, {
                method: "POST",
                body: JSON.stringify({ action: "linkDevice", username: currentUser, token: token })
            }).then(r => r.text()).then(res => {
                if (res === "OK") {
                    localStorage.setItem('biometric_token', token);
                    mostraAlertCustom("Dispositivo autorizzato con successo!", "success");
                    aggiornaUIBiometria(); 
                } else if (res === "LIMIT_REACHED") {
                    mostraAlertCustom("Slot dispositivi esauriti!\n\nHai raggiunto il numero massimo di dispositivi consentiti per il tuo ruolo.", "warning");
                    btn.innerText = testoOriginale;
                } else {
                    mostraAlertCustom("Errore durante il salvataggio sul server.", "error");
                    btn.innerText = testoOriginale;
                }
            });
        }
    } catch (err) {
        console.error(err);
        mostraAlertCustom("ERRORE HARDWARE BIOMETRICO:\n\n" + err.message, "error");
    }
}

function rimuoviBiometria() {
    let token = localStorage.getItem('biometric_token');
    let currentUser = localStorage.getItem('currentUser');
    if(!token || !currentUser) return;
    
    const btn = document.getElementById('btn-registra-bio');
    btn.innerText = "⏳ Revoca..."; btn.disabled = true;

    fetch(LINK_GOOGLE_SCRIPT, {
        method: "POST",
        body: JSON.stringify({ action: "unlinkDevice", username: currentUser, token: token })
    }).then(r => r.text()).then(res => {
        btn.disabled = false;
        localStorage.removeItem('biometric_token');
        mostraAlertCustom("Dispositivo scollegato. Biometria rimossa.", "success");
        aggiornaUIBiometria(); 
    });
}

async function eseguiLoginBiometrico() {
    let token = localStorage.getItem('biometric_token');
    if (!token) return;
    
    try {
        const challenge = new Uint8Array(32); window.crypto.getRandomValues(challenge);
        const pubKey = { challenge: challenge, timeout: 60000, userVerification: "required" };
        const assertion = await navigator.credentials.get({ publicKey: pubKey });
        
        if (assertion) {
            const btn = document.getElementById('btn-biometria');
            btn.innerText = "⏳ Decriptazione...";
            
            let ipB = "Sconosciuto"; let locB = "Sconosciuta"; let coordsB = "";
            try {
                let geo1 = await fetch('https://ipinfo.io/json').then(r => r.json());
                if(geo1.ip) { ipB = geo1.ip; locB = `${geo1.city || ''}, ${geo1.country || ''}`; coordsB = geo1.loc; }
            } catch(e) {}

            fetch(LINK_GOOGLE_SCRIPT, {
                method: "POST",
                body: JSON.stringify({ action: "loginBiometrico", token: token, ip: ipB, location: locB, coords: coordsB })
            }).then(r => r.text()).then(res => {
                if (res.startsWith("ADMIN") || res.startsWith("BASE")) {
                    let parts = res.split("|");
                    localStorage.setItem('adminSessionExp', Date.now() + 5 * 60 * 1000); 
                    localStorage.setItem('userRole', parts[0]); 
                    localStorage.setItem('currentUser', parts[1]); 
                    document.body.className = "role-" + parts[0].toLowerCase(); 
                    document.getElementById('login-screen').style.display = 'none';
                    document.getElementById('main-content').style.display = 'block';
                    btn.innerHTML = `👆 Usa Impronta / FaceID`; 
                    
                    aggiornaUIBiometria(); 
                    caricaDati(); controllaScadenzaPassword(); 
                } else {
                    mostraAlertCustom("Token biometrico revocato dal server o non valido. Usa la password.", "warning");
                    localStorage.removeItem('biometric_token'); 
                    btn.style.display = 'none'; 
                    btn.innerHTML = `👆 Usa Impronta / FaceID`; 
                }
            });
        }
    } catch (err) { console.log("Login biometrico interrotto:", err); }
}