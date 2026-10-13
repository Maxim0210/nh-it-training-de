(() => {
  const root = document.querySelector("[data-course-finder]");
  if (!root) return;

  const catalog = [
    ["cloud", "beginner", "az-900-microsoft-azure-grundlagen.html", "AZ-900 Microsoft Azure Grundlagen"],
    ["cloud", "some", "az-104-microsoft-azure-administrator.html", "AZ-104 Microsoft Azure Administrator"],
    ["security", "beginner", "isc2-certified-in-cybersecurity.html", "ISC2 Certified in Cybersecurity"],
    ["security", "some", "comptia-security-plus.html", "CompTIA Security+"],
    ["data", "beginner", "introduction-to-python.html", "Introduction to Python"],
    ["data", "some", "pl-300-power-bi-data-analyst.html", "PL-300 Power BI Data Analyst"],
    ["ai", "beginner", "opexa-ai-productivity.html", "AI Productivity Essentials"],
    ["ai", "some", "chatgpt-prompt-engineering.html", "ChatGPT Prompt Engineering"],
    ["project", "beginner", "exin-agile-scrum-foundation.html", "EXIN Agile Scrum Foundation"],
    ["project", "some", "prince2-7-foundation.html", "PRINCE2 7 Foundation"],
    ["office", "beginner", "excel-365-level-1.html", "Excel 365 Level 1"],
    ["office", "some", "excel-365-level-2.html", "Excel 365 Level 2"],
    ["network", "beginner", "comptia-network-plus.html", "CompTIA Network+"],
    ["network", "some", "linux-system-administration.html", "Linux System Administration"],
    ["devops", "beginner", "devops-foundation.html", "DevOps Foundation"],
    ["devops", "some", "github-actions-and-devops.html", "GitHub Actions and DevOps"],
    ["ai", "some", "github-copilot-fundamentals.html", "GitHub Copilot Fundamentals"]
  ];
  const topics = { cloud: "Cloud & Azure", security: "Cybersecurity", data: "Data, Power BI & Python", ai: "KI & Copilot", project: "Projektmanagement & ITSM", office: "Office & Microsoft 365", network: "Netzwerk, Linux & Virtualisierung", devops: "DevOps & Entwicklung" };
  const levels = { beginner: "ohne Vorkenntnisse", some: "mit ersten Erfahrungen", advanced: "mit Berufserfahrung" };
  const situations = {
    arbeitssuchend: { label: "arbeitssuchend", action: "Bildungsgutschein und Einstieg besprechen", url: "trainings/arbeitsuchende.html" },
    arbeitnehmer: { label: "berufliche Weiterbildung", action: "Kursberatung anfragen", url: "trainings/arbeitnehmer.html" },
    unternehmen: { label: "Unternehmen", action: "Firmenseminar anfragen", url: "unternehmen.html" }
  };
  const paths = { cloud: "lernwege/azure-administrator-lernpfad.html", security: "lernwege/cybersecurity-lernpfad.html", data: "lernwege/power-bi-data-python-lernpfad.html", ai: "lernwege/ki-copilot-lernpfad.html", project: "lernwege/itil-prince2-projektmanagement-lernpfad.html" };
  const steps = [...root.querySelectorAll("[data-step]")];
  const form = root.querySelector("[data-finder-form]");
  const results = root.querySelector("[data-results]");
  const error = root.querySelector("[data-error]");
  const next = root.querySelector("[data-next]");
  const back = root.querySelector("[data-back]");
  const progress = root.querySelector("[data-progress]");
  const progressBar = root.querySelector("[role=progressbar]");
  let current = 0;

  function setStep(index, moveFocus = true) {
    current = index;
    steps.forEach((step, i) => { step.hidden = i !== current; });
    root.querySelector("[data-step-label]").textContent = `Schritt ${current + 1} von ${steps.length}`;
    progress.style.width = `${((current + 1) / steps.length) * 100}%`;
    progressBar.setAttribute("aria-valuenow", String(current + 1));
    back.hidden = current === 0;
    next.textContent = current === steps.length - 1 ? "Vorschläge ansehen" : "Weiter →";
    error.hidden = true;
    results.hidden = true;
    if (moveFocus) {
      const legend = steps[current].querySelector('legend');
      legend.tabIndex = -1;
      legend.focus({ preventScroll: true });
    }
  }

  function selected(name) { return form.elements[name].value; }

  function showResults() {
    const situation = situations[selected("situation")];
    const topic = selected("topic");
    const level = selected("level");
    const location = selected("location");
    const matches = catalog.filter(([t]) => t === topic);
    const advanced = level === "advanced";
    const chosen = matches.find(([, l]) => l === level) || matches.find(([, l]) => l === "some") || matches[0];
    const related = matches.filter((item) => item !== chosen).slice(0, 1);
    const list = advanced ? [] : [chosen, ...related];
    results.replaceChildren();
    const kicker = document.createElement("p");
    kicker.className = "finder-result-kicker";
    kicker.textContent = "Ihre Auswahl";
    const heading = document.createElement("h2");
    heading.id = "results-title";
    heading.tabIndex = -1;
    heading.textContent = "Ihre Kursvorschläge";
    const reason = document.createElement("p");
    reason.className = "finder-reason";
    reason.textContent = `${topics[topic]} · ${levels[level]} · ${location === "offen" ? "Standort noch offen" : location}`;
    const listNode = document.createElement("ul");
    listNode.className = "finder-course-list";
    list.forEach(([t, l, file, title], i) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `kurse/${file}`;
      link.textContent = title;
      const why = document.createElement("span");
      why.textContent = i === 0 ? `Einstieg ${levels[l]}.` : `Weitere Möglichkeit ${levels[l]}.`;
      item.append(link, why);
      listNode.append(item);
    });
    if (advanced) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = paths[topic] || `trainings/thema-${topic}.html`;
      link.textContent = paths[topic] ? `Lernweg: ${topics[topic]}` : `Alle Kurse: ${topics[topic]}`;
      const why = document.createElement("span");
      why.textContent = "Vergleichen Sie die Inhalte mit Ihrem bisherigen Wissen und Ihrem nächsten beruflichen Ziel.";
      item.append(link, why);
      listNode.append(item);
      if (paths[topic]) {
        const advice = document.createElement("li");
        advice.textContent = "Sie suchen eine Spezialisierung? Wir beraten Sie zu weiterführenden Kursen.";
        listNode.append(advice);
      }
    }
    const note = document.createElement("p");
    note.className = "finder-note";
    note.textContent = "Diese Auswahl bietet eine erste Orientierung. Gemeinsam klären wir Voraussetzungen, Termine und eine mögliche Förderung.";
    const contact = document.createElement("a");
    contact.className = "finder-contact";
    contact.href = `mailto:max.dilewski@nhacademy.de?subject=${encodeURIComponent("Anfrage zu meinen Kursvorschlägen")}&body=${encodeURIComponent(`Guten Tag,\n\nich möchte meine Kursauswahl besprechen.\n\nBerufliche Situation: ${situation.label}\nThema: ${topics[topic]}\nVorwissen: ${levels[level]}\nStandort: ${location === "offen" ? "Noch offen" : location}\nVorschläge: ${list.map((course) => course[3]).join(", ")}\n\nFreundliche Grüße`)}`;
    contact.textContent = situation.action;
    const route = document.createElement("a");
    route.className = "finder-route";
    route.href = situation.url;
    route.textContent = situation === situations.unternehmen ? "Informationen für Unternehmen" : situation === situations.arbeitssuchend ? "Informationen für Arbeitssuchende" : "Informationen für Arbeitnehmer";
    results.append(kicker, heading, reason, listNode, note, contact, route);
    if (situation === situations.unternehmen) {
      const qcg = document.createElement("a");
      qcg.className = "finder-route";
      qcg.href = "qcg-foerdercheck.html";
      qcg.textContent = "QCG-Fördercheck öffnen";
      results.append(qcg);
    }
    form.hidden = true;
    results.hidden = false;
    heading.focus({ preventScroll: true });
  }

  function advance() {
    const field = steps[current].querySelector("input:checked");
    if (!field) {
      error.hidden = false;
      steps[current].querySelector("input").focus({ preventScroll: true });
      return;
    }
    error.hidden = true;
    if (current < steps.length - 1) setStep(current + 1);
    else showResults();
  }

  next.addEventListener("click", advance);
  form.addEventListener("submit", (event) => { event.preventDefault(); advance(); });
  form.addEventListener("change", () => { error.hidden = true; });
  back.addEventListener("click", () => setStep(Math.max(0, current - 1)));
  root.querySelector("[data-reset]").addEventListener("click", () => {
    form.reset();
    form.hidden = false;
    results.hidden = true;
    error.hidden = true;
    setStep(0);
  });

  const requested = new URLSearchParams(location.search).get("situation");
  if (["arbeitssuchend", "arbeitnehmer", "unternehmen"].includes(requested)) {
    form.querySelector(`input[name="situation"][value="${requested}"]`).checked = true;
    setStep(1, false);
  } else setStep(0, false);
})();
