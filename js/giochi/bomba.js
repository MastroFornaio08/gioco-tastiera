/* 💣 Bomba a Orologeria — Disinnesca la bomba digitando le parole prima che esploda!
   Ogni parola corretta aggiunge secondi preziosi. Chi sopravvive fa punti. */

GIOCHI.push({
  id: "bomba",
  nome: "Bomba a Orologeria",
  icona: "💣",
  desc: "La bomba sta per esplodere! Scrivi le parole richieste per aggiungere secondi al timer.",
  regole: [
    "La bomba parte da <b>20 secondi</b>.",
    "Digita la parola mostrata a schermo per guadagnare <b>2 secondi</b>.",
    "Più parole scrivi, più punti fai (100 a parola).",
    "Se il timer arriva a 0, la bomba esplode e perdi tutti i punti del round!",
    "Il round finisce in 60 secondi... se sopravvivi."
  ],
  gara: true,
  solo: true,
  durata: 60,

  generaPartita() {
    return fasceScalate(MAX_ROUND).map(fascia => {
      // Usiamo le parole medie e lunghe per dare difficoltà
      return { 
        sfide: scegliDistinti([...PAROLE.medie, ...PAROLE.lunghe], 30)
      };
    });
  },

  fantasma(dati) {
    // Il fantasma scoppia circa metà delle volte
    const scoppia = Math.random() < 0.4;
    const tempo = scoppia ? 15 + Math.random() * 25 : 60;
    const punti = scoppia ? 0 : 1500 + Math.floor(Math.random() * 1500);
    return {
      punti: punti,
      dettaglio: scoppia ? "esploso" : (punti / 100) + " disinneschi",
      tempo
    };
  },

  crea(api) {
    let bombeRisolte = 0;
    let indiceSfida = 0;
    let timerBomba = 20.0;
    let interval = null;
    let esplosa = false;
    let completato = false;

    api.etichetta("⏳ <b>Timer attivo</b> — Disinnesca per sopravvivere!");
    api.suggerimento("Scrivi la parola per aggiungere +2 secondi");

    api.arena.innerHTML =
      "<div class='bomba-display' id='bomba-timer' style='font-size: 3rem; font-weight: bold; color: #ff3b6b; text-align: center; margin-bottom: 20px; transition: transform 0.1s;'>20.0</div>" +
      "<div class='frase' id='bomba-word' style='text-align: center; font-size: 2rem; margin-bottom: 20px;'></div>" +
      "<input id='typer' class='typer' autocomplete='off' autocorrect='off' autocapitalize='none' spellcheck='false'>";

    const elTimer = api.arena.querySelector("#bomba-timer");
    const elWord = api.arena.querySelector("#bomba-word");
    const typer = api.arena.querySelector("#typer");
    
    function aggiornaParola() {
      if (indiceSfida >= api.dati.sfide.length) {
        indiceSfida = 0; // ricomincia in caso di mostri della tastiera
      }
      elWord.textContent = api.dati.sfide[indiceSfida];
      typer.value = "";
      typer.focus();
    }
    
    function ridisegna(scritto) {
      const bersaglio = api.dati.sfide[indiceSfida];
      let html = "";
      for (let i = 0; i < bersaglio.length; i++) {
        if (i < scritto.length) {
          html += `<c class="${scritto[i] === bersaglio[i] ? 'ok' : 'ko'}">${bersaglio[i]}</c>`;
        } else if (i === scritto.length) {
          html += `<c class="cur">${bersaglio[i]}</c>`;
        } else {
          html += `<c>${bersaglio[i]}</c>`;
        }
      }
      elWord.innerHTML = html;
    }

    aggiornaParola();
    ridisegna("");

    typer.addEventListener("input", () => {
      if (esplosa || completato) return;
      const bersaglio = api.dati.sfide[indiceSfida];
      const scritto = typer.value;
      ridisegna(scritto);
      
      if (scritto === bersaglio) {
        bombeRisolte++;
        timerBomba = Math.min(30, timerBomba + 2); // cap a 30s
        indiceSfida++;
        aggiornaParola();
        ridisegna("");
        if (window.Suoni) window.Suoni.playClick();
        
        elTimer.style.transform = "scale(1.3) rotate(5deg)";
        elTimer.style.color = "#5cff8f";
        setTimeout(() => {
          elTimer.style.transform = "scale(1) rotate(0deg)";
          elTimer.style.color = timerBomba <= 5 ? "#ff3b6b" : "inherit";
        }, 150);
      }
    });

    interval = setInterval(() => {
      if (completato || esplosa) return;
      timerBomba -= 0.1;
      
      if (timerBomba <= 5) {
        elTimer.style.color = "#ff3b6b";
        if (Math.floor(timerBomba * 10) % 10 === 0) {
          elTimer.style.transform = "scale(1.1)";
          if (window.Suoni) window.Suoni.playTick();
          setTimeout(() => elTimer.style.transform = "scale(1)", 50);
        }
      } else {
        elTimer.style.color = "inherit";
      }

      elTimer.textContent = Math.max(0, timerBomba).toFixed(1);

      if (timerBomba <= 0) {
        esplosa = true;
        clearInterval(interval);
        typer.disabled = true;
        elWord.innerHTML = "<span style='color:red'>💥 ESPLOSO!</span>";
        if (window.Suoni) window.Suoni.playBuzzer();
        if (window.Vibrazione) window.Vibrazione.errore();
        
        api.finito({
          punti: 0,
          dettaglio: "esploso (" + bombeRisolte + " disinneschi)"
        });
      }
    }, 100);

    const rifocalizza = () => typer.focus();
    api.arena.addEventListener("click", rifocalizza);

    function chiudi() {
      completato = true;
      clearInterval(interval);
      if (!esplosa) {
        api.finito({
          punti: bombeRisolte * 100,
          dettaglio: bombeRisolte + " disinneschi"
        });
      }
    }

    return {
      scaduto: chiudi,
      chiudi() {
        completato = true;
        clearInterval(interval);
        api.arena.removeEventListener("click", rifocalizza);
      }
    };
  }
});
