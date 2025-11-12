# LLM Activity Monitor - TUI Prototype

Una Terminal UI per visualizzare e navigare le attività di un modello LLM durante l'elaborazione dei prompt.

## 🎯 Caratteristiche

- **Interfaccia Terminal-style**: Design monospace con estetica CLI classica
- **Timeline delle Attività**: Visualizzazione grafica delle operazioni del modello
- **Navigazione Interattiva**: Usa le frecce ← → per esplorare ogni step
- **6 Tipi di Attività**:
  - 🧠 **Think**: Analisi e pianificazione
  - 📖 **Read**: Lettura file/dati
  - ✍️ **Write**: Scrittura/modifica
  - 🔧 **Tool**: Uso di strumenti
  - ⚖️ **Decision**: Decisioni strategiche
  - 🔄 **Pivot**: Cambio di approccio

## 🚀 Demo

Apri semplicemente `index.html` in un browser moderno o visita la [GitHub Page](https://yourusername.github.io/tui-playground/).

## 💻 Come Usare

1. **Inserisci un prompt** nella barra di input in basso
2. **Premi INVIO** per avviare la simulazione
3. **Osserva la timeline** che si popola con le icone delle attività
4. **Clicca su un'icona** o usa **← →** per navigare tra gli step
5. **Visualizza i dettagli** dello snippet per ogni attività
6. **Premi ESC** per pulire la timeline e ricominciare

## 📦 Struttura del Progetto

```
tui-playground/
├── index.html      # Struttura HTML principale
├── style.css       # Styling terminal + timeline
├── script.js       # Logica di simulazione e navigazione
└── README.md       # Questa documentazione
```

## 🎨 Personalizzazione

### Aggiungere Nuovi Tipi di Attività

Modifica l'oggetto `ACTIVITIES` in `script.js`:

```javascript
const ACTIVITIES = {
    nuova_attivita: {
        icon: '🎯',
        label: 'Nome',
        color: '#hexcolor'
    }
};
```

### Modificare la Sequenza di Simulazione

Edita l'array `SAMPLE_ACTIVITIES` in `script.js` per creare scenari personalizzati.

## 🌐 Deploy su GitHub Pages

1. Fai il commit di tutti i file
2. Vai su Settings → Pages
3. Seleziona branch `main` e cartella `/ (root)`
4. Salva e attendi qualche minuto
5. La tua TUI sarà disponibile su `https://username.github.io/tui-playground/`

## 🛠️ Tecnologie

- **HTML5**
- **CSS3** (animazioni, flexbox, scrollbar custom)
- **Vanilla JavaScript** (ES6+)
- Nessuna dipendenza esterna!

## 📝 Note Tecniche

- Stile monospace per mantenere l'autenticità del terminale
- Animazioni CSS per transizioni fluide
- Event listener per keyboard navigation
- Simulazione asincrona con delay realistici

## 🎯 Prossimi Sviluppi

- [ ] Import/export delle sequenze di attività
- [ ] Temi personalizzabili
- [ ] Integrazione con API LLM reali
- [ ] Statistiche e metriche di performance
- [ ] Timeline multipli per comparazioni

## 📄 Licenza

MIT License - Sentiti libero di usare questo progetto come preferisci!

---

**Creato con** ❤️ **per esplorare l'UX delle interfacce LLM**
