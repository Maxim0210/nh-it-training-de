const filters = document.querySelectorAll(".filter");
const maintenanceMode = true;

function initMaintenanceMode() {
  const scriptSource = document.currentScript?.src || new URL("app.js", window.location.href).toString();
  const logoSource = new URL("assets/new-horizons-muenchen-logo.svg", scriptSource).toString();
  const screen = document.createElement("main");

  document.documentElement.classList.add("maintenance-mode");

  screen.className = "maintenance-screen";
  screen.setAttribute("role", "status");
  screen.setAttribute("aria-live", "polite");
  screen.innerHTML = `
    <div class="maintenance-content">
      <img src="${logoSource}" alt="New Horizons">
      <span aria-hidden="true"></span>
      <h1>Die Seite befindet sich im Aufbau.</h1>
    </div>`;

  document.body.prepend(screen);
}

if (maintenanceMode) {
  initMaintenanceMode();
} else {
const cards = document.querySelectorAll(".course-card");
const searchForms = document.querySelectorAll(".search-box");
const searchInputs = document.querySelectorAll(".search-box input[name='q']");
const params = new URLSearchParams(window.location.search);
const localSearchGrid = document.querySelector(".choice-content .course-grid");
const shouldFilterHere = Boolean(localSearchGrid && cards.length);

let activeFilter = params.get("filter") || "all";
let activeQuery = params.get("q")?.trim() || "";

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function searchTargetUrl(form, query) {
  const fallback = "trainings/advanced-search.html#kurse";
  const target = new URL(form.getAttribute("action") || fallback, window.location.href);
  if (query) target.searchParams.set("q", query);
  if (activeFilter && activeFilter !== "all") target.searchParams.set("filter", activeFilter);
  if (!target.hash) target.hash = "#kurse";
  return target.toString();
}

function syncSearchInputs() {
  searchInputs.forEach((input) => {
    input.value = activeQuery;
  });
}

function ensureEmptyState() {
  let empty = document.querySelector("[data-search-empty]");
  if (!empty && localSearchGrid) {
    empty = document.createElement("p");
    empty.className = "search-empty";
    empty.dataset.searchEmpty = "";
    empty.textContent = "Keine passenden Kurse gefunden. Bitte Suchbegriff ändern oder direkt Beratung anfragen.";
    localSearchGrid.after(empty);
  }
  return empty;
}

function applyCourseView() {
  if (!shouldFilterHere) return;
  const query = normalize(activeQuery);
  let visibleCount = 0;

  cards.forEach((card) => {
    const categories = card.dataset.category || "";
    const text = normalize(card.textContent);
    const matchesFilter = activeFilter === "all" || categories.includes(activeFilter);
    const matchesSearch = !query || text.includes(query);
    const isVisible = matchesFilter && matchesSearch;
    card.style.display = isVisible ? "flex" : "none";
    if (isVisible) visibleCount += 1;
  });

  const empty = ensureEmptyState();
  if (empty) empty.classList.toggle("visible", visibleCount === 0);
}

filters.forEach((filter) => {
  filter.classList.toggle("active", filter.dataset.filter === activeFilter);

  filter.addEventListener("click", () => {
    activeFilter = filter.dataset.filter || "all";
    filters.forEach((item) => {
      item.classList.toggle("active", item.dataset.filter === activeFilter);
    });
    applyCourseView();
  });
});

document.querySelectorAll("[data-jump-filter]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    activeFilter = link.dataset.jumpFilter;
    filters.forEach((item) => {
      item.classList.toggle("active", item.dataset.filter === activeFilter);
    });
    document.querySelector("#kurse")?.scrollIntoView({ behavior: "smooth" });
    applyCourseView();
  });
});

searchForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    const input = form.querySelector("input[name='q']");
    const query = input?.value.trim() || "";

    if (!shouldFilterHere) {
      event.preventDefault();
      window.location.href = searchTargetUrl(form, query);
      return;
    }

    event.preventDefault();
    activeQuery = query;
    syncSearchInputs();
    document.querySelector("#kurse")?.scrollIntoView({ behavior: "smooth" });
    applyCourseView();
  });
});

if (shouldFilterHere) {
  syncSearchInputs();
  searchInputs.forEach((input) => {
    input.addEventListener("input", () => {
      activeQuery = input.value.trim();
      syncSearchInputs();
      applyCourseView();
    });
  });

  if (activeQuery || activeFilter !== "all") {
    applyCourseView();
    document.querySelector("#kurse")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function loadDailyNews() {
  const target = document.querySelector("[data-daily-news]");
  if (!target) return;

  try {
    const response = await fetch("/api/daily-news", { headers: { "Accept": "application/json" } });
    if (!response.ok) throw new Error("News endpoint failed");
    const data = await response.json();
    target.innerHTML = "";

    const intro = document.createElement("p");
    intro.textContent = data.sourceNote || "Aktuelle Lern- und IT-News aus offiziellen Quellen.";
    target.appendChild(intro);

    const list = document.createElement("ul");
    data.items.slice(0, 6).forEach((item) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = item.link;
      link.textContent = item.title;
      link.rel = "nofollow noopener";
      link.target = "_blank";
      li.appendChild(link);
      list.appendChild(li);
    });
    target.appendChild(list);
  } catch (error) {
    target.innerHTML = "<p>Live-News sind gerade nicht erreichbar. Die statischen Ratgeberartikel bleiben verfügbar und sind für SEO maßgeblich.</p>";
  }
}

loadDailyNews();

function initQcgCheck() {
  const form = document.querySelector("[data-qcg-check]");
  const result = document.querySelector("[data-qcg-result]");
  if (!form || !result) return;

  const topicMap = {
    cloud: {
      label: "Cloud, Azure und Microsoft 365",
      href: "trainings/thema-cloud.html",
      focus: "Cloud-Rollen, Microsoft 365 Administration, Azure Grundlagen oder Administrator-Kurse"
    },
    security: {
      label: "Cybersecurity und Compliance",
      href: "trainings/thema-security.html",
      focus: "Security-Grundlagen, Analystenrollen, Compliance und praktische Schutzmaßnahmen"
    },
    ki: {
      label: "KI, Copilot und Automatisierung",
      href: "trainings/thema-ki.html",
      focus: "KI-Grundlagen, Copilot-Nutzung, Automatisierung und produktive Teamprozesse"
    },
    data: {
      label: "Power BI, Python und Datenanalyse",
      href: "trainings/thema-data.html",
      focus: "Datenverständnis, Reporting, Power BI, Python und automatisierte Auswertungen"
    },
    pm: {
      label: "ITIL, PRINCE2 und Projektmanagement",
      href: "trainings/thema-pm.html",
      focus: "Service-Management, Projektrollen, Prozessverständnis und Zertifizierungspfade"
    }
  };

  const readValue = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value || "";

  const updateResult = () => {
    const team = readValue("team");
    const topic = topicMap[readValue("topic")] || topicMap.cloud;
    const format = readValue("format");
    const time = readValue("time");

    const isTeam = team === "small" || team === "group";
    const isSeminar = format === "seminar" || format === "hybrid" || isTeam;
    const isFast = time === "fast";

    const headline = isTeam
      ? "Teamqualifizierung und QCG gemeinsam prüfen."
      : "QCG-Eignung und passenden Kursweg prüfen.";

    const formatText = isSeminar
      ? "Für mehrere Mitarbeitende ist ein Firmenseminar oder ein abgestimmter Workshop oft übersichtlicher als einzelne Kursbuchungen."
      : "Für eine einzelne Person kann zuerst der konkrete Kurs mit Termin, Sprache und Förderbezug geprüft werden.";

    const timingText = isFast
      ? "Da der Start schnell erfolgen soll, ist ein kurzes Telefonat der beste nächste Schritt."
      : time === "planned"
        ? "Bei einem Zeitfenster von ein bis drei Monaten können Kursdaten, Förderlogik und interne Freigabe sauber vorbereitet werden."
        : "Wenn Budget und Planung noch offen sind, sollte zuerst der Qualifizierungsbedarf strukturiert werden.";

    result.innerHTML = `
      <span>Empfehlung</span>
      <h2>${headline}</h2>
      <p><strong>${topic.label}:</strong> Sinnvoll ist eine Beratung zu ${topic.focus}. ${formatText} ${timingText}</p>
      <div class="qcg-result-actions">
        <a class="button primary" href="kontakt.html">QCG-Beratung anfragen</a>
        <a class="button secondary" href="${topic.href}">Passende Kurse ansehen</a>
        <a class="button secondary" href="qcg-prozess.html">QCG-Prozess ansehen</a>
      </div>`;
  };

  form.addEventListener("change", updateResult);
  updateResult();
}

function initScrollProgress() {
  const progressBar = document.querySelector(".scroll-progress span");
  if (!progressBar) return;

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
    progressBar.style.setProperty("--scroll-progress", progress.toFixed(4));
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

function initAiAssistant() {
  if (document.querySelector("[data-ai-assistant]")) return;

  const scriptSource = document.currentScript?.src || document.querySelector("script[src*='app.js']")?.src || window.location.href;
  const scriptVersion = new URL(scriptSource, window.location.href).searchParams.get("v") || "20260624-2";
  const assistantImage = new URL(`assets/assistant-advisor.jpg?v=${scriptVersion}`, scriptSource).toString();
  const siteUrl = (path) => new URL(path, scriptSource).toString();
  const contactPhone = "089 997 409 352";
  const contactEmail = "max.dilewski@newhorizons-muenchen.de";

  const assistant = document.createElement("aside");
  assistant.className = "ai-assistant";
  assistant.dataset.aiAssistant = "";
  assistant.innerHTML = `
    <button class="ai-assistant-toggle" type="button" aria-expanded="false" aria-controls="ai-assistant-panel">
      <span class="ai-assistant-avatar"><img src="${assistantImage}" alt=""></span>
      <span><strong>KI-Assistentin</strong><small>Fragen zu Kursen?</small></span>
    </button>
    <section class="ai-assistant-panel" id="ai-assistant-panel" hidden aria-label="KI-Assistentin für Kursfragen">
      <div class="ai-assistant-head">
        <div>
          <span>New Horizons Assistenz</span>
          <strong>Wie kann ich helfen?</strong>
        </div>
        <button type="button" class="ai-assistant-close" aria-label="Assistent schließen">×</button>
      </div>
      <div class="ai-assistant-messages" aria-live="polite"></div>
      <div class="ai-assistant-chips" aria-label="Schnelle Fragen">
        <button type="button" data-question="Welcher Kurs passt zu mir?">Kurs finden</button>
        <button type="button" data-question="Wann kann ich starten?">Termine</button>
        <button type="button" data-question="Gibt es Förderung oder Bildungsgutschein?">Förderung</button>
        <button type="button" data-question="Bietet ihr Firmenseminare an?">Firmenseminare</button>
      </div>
      <form class="ai-assistant-form">
        <label class="visually-hidden" for="ai-assistant-input">Frage eingeben</label>
        <input id="ai-assistant-input" name="frage" autocomplete="off" placeholder="Frage eingeben">
        <button type="submit">Senden</button>
      </form>
      <div class="ai-assistant-contact">
        <a href="tel:+4989997409352">Anrufen</a>
        <a href="mailto:${contactEmail}">E-Mail</a>
      </div>
    </section>`;

  document.body.appendChild(assistant);

  const toggle = assistant.querySelector(".ai-assistant-toggle");
  const panel = assistant.querySelector(".ai-assistant-panel");
  const close = assistant.querySelector(".ai-assistant-close");
  const messages = assistant.querySelector(".ai-assistant-messages");
  const form = assistant.querySelector(".ai-assistant-form");
  const input = assistant.querySelector("#ai-assistant-input");

  const addMessage = (text, owner = "bot") => {
    const bubble = document.createElement("div");
    bubble.className = `ai-assistant-message ${owner}`;
    bubble.innerHTML = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  };

  const contactAnswer = `Für eine sichere Antwort verbindet dich Max Dilewski direkt mit dem passenden Kurs: <br><a href="tel:+4989997409352">${contactPhone}</a> · <a href="mailto:${contactEmail}">${contactEmail}</a>`;

  const answerQuestion = (rawQuestion) => {
    const question = rawQuestion.trim();
    if (!question) return;
    const normalized = normalize(question);

    addMessage(question, "user");

    let answer = "";
    if (/(preis|kosten|kostet|termin|start|datum|gebuhr|gebuehr|kondition)/.test(normalized)) {
      answer = `Viele Kurse hängen von Termin, Sprache, Durchführung, Teilnehmerzahl und Förderung ab. Deshalb werden Starttermin und Konditionen persönlich geprüft. ${contactAnswer}`;
    } else if (/(forderung|foerderung|bildungsgutschein|jobcenter|agentur|qcg|qualifizierungschancengesetz)/.test(normalized)) {
      answer = `Ja. Bildungsgutschein, QCG und Firmenförderung können je nach Situation geprüft werden. Am schnellsten ist eine kurze Anfrage mit Kursziel, Status und gewünschtem Zeitraum. <a href="${siteUrl("förderung.html")}">Förderung ansehen</a>`;
    } else if (/(firma|unternehmen|team|workshop|firmenseminar|mitarbeiter|gruppe|inhouse)/.test(normalized)) {
      answer = `Ja. Es gibt Firmenseminare, Teamtrainings, Workshops, Online Live Training, hybride Formate und Trainings für konkrete Rollen. <a href="${siteUrl("unternehmen.html")}">Firmenseminare ansehen</a>`;
    } else if (/(online|remote|live|hybrid|standort|vor ort|connected classroom|walkin)/.test(normalized)) {
      answer = `Viele Trainings sind online, remote, hybrid, Connected Classroom, WalkIn oder als Firmenseminar möglich. Welche Form passt, wird nach Kurs, Sprache, Termin und Teamgröße geprüft.`;
    } else if (/(azure|microsoft|power bi|python|security|cyber|ki|ai|copilot|itil|prince2|excel|office|comptia|cisco|adobe|vmware|citrix)/.test(normalized)) {
      const searchUrl = siteUrl(`trainings/advanced-search.html?q=${encodeURIComponent(question)}#kurse`);
      answer = `Dazu gibt es passende Kursseiten im Katalog. Ich öffne dir am besten die Suche mit deinem Begriff: <a href="${searchUrl}">Kurse zu „${question}“ anzeigen</a>. ${contactAnswer}`;
    } else if (/(kontakt|telefon|email|e-mail|berater|max|anrufen|rueckruf|ruckruf)/.test(normalized)) {
      answer = `Du erreichst Max Dilewski direkt unter <a href="tel:+4989997409352">${contactPhone}</a> oder per E-Mail an <a href="mailto:${contactEmail}">${contactEmail}</a>.`;
    } else if (/(katalog|alle kurse|kursliste|auswahl|finden|welcher kurs)/.test(normalized)) {
      answer = `Am schnellsten findest du passende Kurse über den Kurskatalog oder die erweiterte Suche. <a href="${siteUrl("kurskatalog.html")}">Kurskatalog öffnen</a> · <a href="${siteUrl("trainings/advanced-search.html")}">Advanced Search öffnen</a>`;
    } else {
      answer = `Ich kann Fragen zu Kursen, Terminen, Förderung, Online-Training und Firmenseminaren beantworten. Für diese konkrete Frage ist eine persönliche Einschätzung sinnvoll. ${contactAnswer}`;
    }

    window.setTimeout(() => addMessage(answer, "bot"), 220);
  };

  const openAssistant = () => {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    if (!messages.children.length) {
      addMessage(`Hallo, ich helfe bei Kursauswahl, Förderung, Terminen und Firmenseminaren. Wenn es konkret wird, verweise ich direkt an Max Dilewski.`);
    }
    window.setTimeout(() => input?.focus(), 60);
  };

  const closeAssistant = () => {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    if (panel.hidden) openAssistant();
    else closeAssistant();
  });

  close.addEventListener("click", closeAssistant);

  assistant.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => answerQuestion(button.dataset.question || ""));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    answerQuestion(input.value);
    input.value = "";
  });
}

function initCookieConsent() {
  if (document.querySelector("[data-cookie-consent]")) return;

  const scriptSource = document.currentScript?.src || document.querySelector("script[src*='app.js']")?.src || window.location.href;
  const siteUrl = (path) => new URL(path, scriptSource).toString();
  const cookieName = "nh_cookie_consent";
  const cookieVersion = "2026-06-29";
  const maxAge = 60 * 60 * 24 * 180;
  const isEnglish = document.documentElement.lang?.toLowerCase().startsWith("en");
  const t = isEnglish
    ? {
      headline: "Cookie settings",
      intro: "We use necessary cookies for site operation and consent storage. Analytics and marketing only run after consent.",
      acceptAll: "Accept all",
      necessaryOnly: "Necessary only",
      settings: "Settings",
      save: "Save selection",
      close: "Close cookie settings",
      necessary: "Necessary",
      necessaryText: "Required for page operation, security and storing your cookie choice.",
      analytics: "Analytics",
      analyticsText: "Helps us understand which pages and course searches work well. Currently not active.",
      marketing: "Marketing",
      marketingText: "Reserved for future campaign measurement. Currently not active.",
      privacy: "Privacy policy",
      footer: "Cookie settings"
    }
    : {
      headline: "Cookie-Einstellungen",
      intro: "Wir nutzen notwendige Cookies für den Betrieb der Seite und zum Speichern deiner Auswahl. Analyse und Marketing laufen nur nach Einwilligung.",
      acceptAll: "Alle akzeptieren",
      necessaryOnly: "Nur notwendige",
      settings: "Einstellungen",
      save: "Auswahl speichern",
      close: "Cookie-Einstellungen schließen",
      necessary: "Notwendig",
      necessaryText: "Erforderlich für Seitenbetrieb, Sicherheit und das Speichern deiner Cookie-Auswahl.",
      analytics: "Analyse",
      analyticsText: "Hilft zu verstehen, welche Seiten und Kurssuchen gut funktionieren. Aktuell nicht aktiv.",
      marketing: "Marketing",
      marketingText: "Vorbereitet für spätere Kampagnenmessung. Aktuell nicht aktiv.",
      privacy: "Datenschutz",
      footer: "Cookie-Einstellungen"
    };

  const readConsent = () => {
    const rawCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${cookieName}=`))
      ?.split("=")
      .slice(1)
      .join("=");

    const raw = rawCookie || localStorage.getItem(cookieName);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(decodeURIComponent(raw));
      return parsed.version === cookieVersion ? parsed : null;
    } catch {
      return null;
    }
  };

  const saveConsent = (preferences) => {
    const payload = {
      version: cookieVersion,
      necessary: true,
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
      savedAt: new Date().toISOString()
    };
    const encoded = encodeURIComponent(JSON.stringify(payload));
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${cookieName}=${encoded}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
    localStorage.setItem(cookieName, encoded);
    window.dispatchEvent(new CustomEvent("nhCookieConsent", { detail: payload }));
    return payload;
  };

  const existing = readConsent();
  const openSettingsButtons = [];

  const addFooterSettings = () => {
    const footerLinks = document.querySelector(".site-footer div:last-child");
    if (!footerLinks || footerLinks.querySelector("[data-cookie-settings-open]")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "footer-cookie-settings";
    button.dataset.cookieSettingsOpen = "";
    button.textContent = t.footer;
    footerLinks.appendChild(button);
    openSettingsButtons.push(button);
  };

  const consent = document.createElement("aside");
  consent.className = "cookie-consent";
  consent.dataset.cookieConsent = "";
  consent.innerHTML = `
    <div class="cookie-card" role="region" aria-label="${t.headline}">
      <div>
        <strong>${t.headline}</strong>
        <p>${t.intro} <a href="${siteUrl("datenschutz.html")}">${t.privacy}</a></p>
      </div>
      <div class="cookie-actions">
        <button type="button" class="cookie-button secondary" data-cookie-necessary>${t.necessaryOnly}</button>
        <button type="button" class="cookie-button ghost" data-cookie-settings>${t.settings}</button>
        <button type="button" class="cookie-button primary" data-cookie-all>${t.acceptAll}</button>
      </div>
    </div>
    <section class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title" hidden>
      <div class="cookie-modal-card">
        <div class="cookie-modal-head">
          <h2 id="cookie-modal-title">${t.headline}</h2>
          <button type="button" class="cookie-modal-close" aria-label="${t.close}">×</button>
        </div>
        <div class="cookie-option locked">
          <div>
            <strong>${t.necessary}</strong>
            <p>${t.necessaryText}</p>
          </div>
          <span>Immer aktiv</span>
        </div>
        <label class="cookie-option">
          <div>
            <strong>${t.analytics}</strong>
            <p>${t.analyticsText}</p>
          </div>
          <input type="checkbox" name="analytics">
        </label>
        <label class="cookie-option">
          <div>
            <strong>${t.marketing}</strong>
            <p>${t.marketingText}</p>
          </div>
          <input type="checkbox" name="marketing">
        </label>
        <div class="cookie-actions">
          <button type="button" class="cookie-button secondary" data-cookie-save>${t.save}</button>
          <button type="button" class="cookie-button primary" data-cookie-all-modal>${t.acceptAll}</button>
        </div>
      </div>
    </section>`;

  document.body.appendChild(consent);
  addFooterSettings();

  const banner = consent.querySelector(".cookie-card");
  const modal = consent.querySelector(".cookie-modal");
  const analytics = consent.querySelector("input[name='analytics']");
  const marketing = consent.querySelector("input[name='marketing']");

  const syncInputs = (preferences = readConsent()) => {
    analytics.checked = Boolean(preferences?.analytics);
    marketing.checked = Boolean(preferences?.marketing);
  };

  const showBanner = () => {
    banner.hidden = false;
    consent.classList.add("visible");
  };

  const hideBanner = () => {
    banner.hidden = true;
    consent.classList.remove("visible");
  };

  const openSettings = () => {
    syncInputs();
    modal.hidden = false;
    consent.classList.add("settings-open");
    consent.querySelector(".cookie-modal-close")?.focus();
  };

  const closeSettings = () => {
    modal.hidden = true;
    consent.classList.remove("settings-open");
  };

  const accept = (preferences) => {
    const saved = saveConsent(preferences);
    syncInputs(saved);
    closeSettings();
    hideBanner();
  };

  consent.querySelector("[data-cookie-necessary]").addEventListener("click", () => accept({ analytics: false, marketing: false }));
  consent.querySelector("[data-cookie-all]").addEventListener("click", () => accept({ analytics: true, marketing: true }));
  consent.querySelector("[data-cookie-settings]").addEventListener("click", openSettings);
  consent.querySelector("[data-cookie-save]").addEventListener("click", () => accept({ analytics: analytics.checked, marketing: marketing.checked }));
  consent.querySelector("[data-cookie-all-modal]").addEventListener("click", () => accept({ analytics: true, marketing: true }));
  consent.querySelector(".cookie-modal-close").addEventListener("click", closeSettings);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeSettings();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeSettings();
  });

  openSettingsButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showBanner();
      openSettings();
    });
  });

  if (existing) {
    hideBanner();
    syncInputs(existing);
  } else {
    showBanner();
  }
}

initCookieConsent();
initScrollProgress();
initQcgCheck();
initAiAssistant();
}
