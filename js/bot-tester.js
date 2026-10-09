/* 🤖 Bot Tester — Sistema di Test e Debug Automatico con Bot per tutti i minigiochi */

const BotTester = {
  inEsecuzione: false,
  richiestaStop: false,
  risultati: [],
  onAggiornamento: null,

  // Registra callback per aggiornamenti UI
  impostaListener(cb) {
    this.onAggiornamento = cb;
  },

  // Notifica la UI
  notifica(dati) {
    if (this.onAggiornamento) this.onAggiornamento(dati);
  },

  ferma() {
    this.richiestaStop = true;
    this.inEsecuzione = false;
  },

  // Esegue il test su uno o tutti i giochi
  async avvia({ giocoId = "tutti", numBot = 3, visuale = false, arenaEl = null }) {
    if (this.inEsecuzione) return;
    this.inEsecuzione = true;
    this.richiestaStop = false;
    this.risultati = [];

    const elencoGiochi = giocoId === "tutti" 
      ? [...GIOCHI] 
      : GIOCHI.filter(g => g.id === giocoId);

    if (elencoGiochi.length === 0) {
      this.inEsecuzione = false;
      return { successo: false, errore: "Nessun gioco selezionato." };
    }

    this.notifica({ tipo: "inizio", totale: elencoGiochi.length });

    for (let i = 0; i < elencoGiochi.length; i++) {
      if (this.richiestaStop) break;

      const gioco = elencoGiochi[i];
      this.notifica({ tipo: "giocoInizio", indice: i, gioco: gioco.id, nome: gioco.nome });

      const res = await this.testaSingoloGioco(gioco, numBot, visuale, arenaEl);
      this.risultati.push(res);

      this.notifica({ tipo: "giocoFine", indice: i, risultato: res });
      
      // Breve pausa per fluidità UI
      await new Promise(r => setTimeout(r, visuale ? 600 : 60));
    }

    this.inEsecuzione = false;
    this.notifica({ tipo: "completato", risultati: this.risultati });
    return this.risultati;
  },

  // Esegue il test con bot su un singolo minigioco
  async testaSingoloGioco(gioco, numBot = 3, visuale = false, arenaEl = null) {
    const tInizio = performance.now();
    const rep = {
      id: gioco.id,
      nome: gioco.nome,
      icona: gioco.icona || "🎮",
      pass: false,
      tempoMs: 0,
      dettagliBot: [],
      errori: [],
      avvisi: []
    };

    try {
      // 1. Verifica definizione e generaPartita
      if (typeof gioco.generaPartita !== "function") {
        throw new Error("Manca la funzione generaPartita()");
      }
      const matchData = gioco.generaPartita();
      if (!Array.isArray(matchData) || matchData.length === 0) {
        throw new Error(`generaPartita() deve restituire un Array (ricevuto: ${typeof matchData})`);
      }

      // 2. Setup bot
      const minP = gioco.minGiocatori || 1;
      const maxP = gioco.maxGiocatori || 6;
      const quanti = Math.min(Math.max(numBot, minP), maxP);

      const bots = [];
      for (let b = 0; b < quanti; b++) {
        bots.push({
          id: `p${b}`,
          nome: `Bot_${b + 1}`,
          avatar: ["🤖", "🦾", "👾", "🦊", "🦁", "🦖"][b % 6],
          colore: COLORI[b % COLORI.length],
          punti: 0,
          online: true
        });
      }

      // 3. Network Bus simulato per scambiare messaggi tra bot
      const istanze = new Map();
      const botFiniti = new Map();

      const bus = {
        invia(daId, m) {
          for (const [id, inst] of istanze.entries()) {
            if (id !== daId && inst && inst.messaggio) {
              try { inst.messaggio(m, daId); } 
              catch (e) { rep.avvisi.push(`Msg errore da ${daId} a ${id}: ${e.message}`); }
            }
          }
        },
        inviaA(aId, m, daId) {
          const inst = istanze.get(aId);
          if (inst && inst.messaggio) {
            try { inst.messaggio(m, daId); } 
            catch (e) { rep.avvisi.push(`Msg privato a ${aId}: ${e.message}`); }
          }
        }
      };

      const roundData = matchData[0];

      // 4. Creazione istanze per ciascun bot
      for (let i = 0; i < quanti; i++) {
        const b = bots[i];
        const isHost = (i === 0);

        // Se visuale e primo bot (host), usa l'arena visuale a schermo se disponibile
        let arena;
        if (visuale && isHost && arenaEl) {
          arena = arenaEl;
          arena.innerHTML = "";
        } else {
          arena = document.createElement("div");
          arena.className = "arena-test-bot";
        }

        const botApi = {
          round: 0,
          dati: roundData,
          sonoHost: isHost,
          arena: arena,
          io: b.id,
          giocatori: bots,
          indiceMio: i,
          nGiocatori: quanti,
          tempo: () => Math.round((performance.now() - tInizio) / 100) / 10,
          suggerimento: () => {},
          etichetta: () => {},
          nome: (id) => bots.find(x => x.id === id)?.nome || id,
          invia: (m) => bus.invia(b.id, m),
          aArbitro: (m) => bus.inviaA("p0", m, b.id),
          aGiocatore: (id, m) => bus.inviaA(id, m, b.id),
          avanzo: (p) => {},
          finito: (res) => {
            botFiniti.set(b.id, res);
          }
        };

        const inst = gioco.crea(botApi);
        if (inst) istanze.set(b.id, { inst, arena, api: botApi });
      }

      // 5. Azioni simulate dei Bot
      for (const [id, { inst, arena, api }] of istanze.entries()) {
        // Interazione simulata bot con input e tasti
        this._simulaAzioniBot(gioco.id, arena, inst, api, roundData);
      }

      if (visuale) {
        await new Promise(r => setTimeout(r, 1200));
      }

      // 6. Chiusura istanze e test scaduto()
      for (const [id, { inst, arena, api }] of istanze.entries()) {
        if (!botFiniti.has(id)) {
          if (inst.scaduto) {
            try { inst.scaduto(); } catch (e) { rep.avvisi.push(`Errore in scaduto() su ${id}: ${e.message}`); }
          } else {
            api.finito({ punti: 0, dettaglio: "scaduto" });
          }
        }
        if (inst.chiudi) {
          try { inst.chiudi(); } catch (e) { rep.avvisi.push(`Errore in chiudi() su ${id}: ${e.message}`); }
        }
      }

      rep.pass = true;
      rep.tempoMs = Math.round(performance.now() - tInizio);
      rep.dettagliBot = bots.map(b => {
        const esito = botFiniti.get(b.id) || { punti: 0, dettaglio: "—" };
        return `${b.nome}: ${esito.punti}pt (${esito.dettaglio || "—"})`;
      });

    } catch (err) {
      rep.pass = false;
      rep.tempoMs = Math.round(performance.now() - tInizio);
      rep.errori.push(err.message || String(err));
      console.error(`[BotTester] Errore su ${gioco.id}:`, err);
    }

    return rep;
  },

  // Simula azioni intelligenti dei bot per ciascun tipo di gioco
  _simulaAzioniBot(giocoId, arena, inst, api, roundData) {
    try {
      // 1. Tasti o click generici
      const bottoni = arena.querySelectorAll("button, .btn, .tris-cella, .ya-dado, .mem-carta, .foto-cella, .ord-num");
      if (bottoni && bottoni.length) {
        for (let b = 0; b < Math.min(bottoni.length, 6); b++) {
          const btn = bottoni[b];
          if (btn && !btn.disabled && btn.click) {
            btn.click();
          }
        }
      }

      // 2. Input di testo o numeri (es. Dattilo, Calcolo, Anagrammi, Conta, Bomba)
      const inputs = arena.querySelectorAll("input, .typer, .calc-input");
      if (inputs && inputs.length) {
        inputs.forEach(input => {
          if (giocoId === "calcolo") {
            const ris = (roundData && roundData.operazioni && roundData.operazioni[0]) ? roundData.operazioni[0].ris : 10;
            input.value = String(ris);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
          } else if (giocoId === "conta") {
            input.value = String(roundData?.countTarget || 5);
            input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
          } else if (giocoId === "anagrammi") {
            const parola = (roundData && roundData.parole && roundData.parole[0]) ? roundData.parole[0].parola : "test";
            input.value = parola;
            input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
          } else if (giocoId === "dattilo" || giocoId === "bomba") {
            input.value = "parola";
            input.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });
      }

      // 3. Yahtzee tiro dado
      if (giocoId === "yahtzee") {
        const btnTira = arena.querySelector("#ya-tira");
        if (btnTira && !btnTira.disabled) btnTira.click();
      }

      // 4. Escape room azioni di prova
      if (giocoId === "escaperoom") {
        const btnIndizio = arena.querySelector("#btn-indizio");
        if (btnIndizio && !btnIndizio.disabled) btnIndizio.click();
      }

      // 5. Riflessi e Cronometro colpisci
      if (giocoId === "riflessi" || giocoId === "cronometro") {
        const clickArea = arena.querySelector("#semaforo, #chrono-btn");
        if (clickArea) clickArea.click();
      }
    } catch (e) {
      // Ignora errori di simulazione opzionale
    }
  },

  // Genera resoconto testuale esportabile
  generaReportTesto() {
    const tot = this.risultati.length;
    const passati = this.risultati.filter(r => r.pass).length;
    const falliti = tot - passati;

    let txt = `========================================\n`;
    txt += `SfidaParty — Report Diagnostica Bot Tester\n`;
    txt += `Data: ${new Date().toLocaleString()}\n`;
    txt += `Risultato complessivo: ${passati}/${tot} Superati (${falliti} errori)\n`;
    txt += `========================================\n\n`;

    this.risultati.forEach(r => {
      const icon = r.pass ? "✅ PASS" : "❌ FAIL";
      txt += `${icon} | ${r.icona} ${r.nome} (${r.id}) — ${r.tempoMs}ms\n`;
      if (r.dettagliBot.length) {
        txt += `   Bot: ${r.dettagliBot.join(", ")}\n`;
      }
      if (r.errori.length) {
        txt += `   ERRORI: ${r.errori.join(" | ")}\n`;
      }
      if (r.avvisi.length) {
        txt += `   Avvisi: ${r.avvisi.join(" | ")}\n`;
      }
      txt += "\n";
    });

    return txt;
  }
};

window.BotTester = BotTester;
