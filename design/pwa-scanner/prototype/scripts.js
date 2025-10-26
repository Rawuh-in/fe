(() => {
  const layout = document.querySelector(".layout");
  const screens = document.querySelectorAll(".screen");
  const resultCard = document.querySelector(".result-card");
  const resultTitle = resultCard.querySelector(".result-title");
  const badgeStatus = resultCard.querySelector(".badge-status");
  const resultDetails = resultCard.querySelector(".result-details");
  const fieldName = resultDetails.querySelector('[data-field="name"]');
  const fieldEvent = resultDetails.querySelector('[data-field="event"]');
  const fieldStage = resultDetails.querySelector('[data-field="stage"]');
  const fieldTime = resultDetails.querySelector('[data-field="time"]');
  const fieldHotel = resultDetails.querySelector('[data-field="hotel"]');
  const fieldRoom = resultDetails.querySelector('[data-field="room"]');
  const resultSubtext = resultCard.querySelector(".result-subtext");
  const hotelDetails = resultDetails.querySelector(".hotel-details");
  const resultActions = resultCard.querySelector(".result-actions");
  const btnPrimary = resultActions.querySelector('[data-action="scan-next"]');
  const btnSecondary = resultActions.querySelector('[data-action="scan-retry"]');
  const linkHistory = resultActions.querySelector('[data-action="view-history"]');
  const btnPrint = resultActions.querySelector('[data-action="print-label"]');
  const connectionBadge = document.querySelector(".connection");
  const bannerOffline = document.querySelector('[data-banner="offline"]');
  const toastContainer = document.querySelector(".status-toasts");
  const toastTemplate = document.getElementById("toast-template");
  const stageSelect = document.getElementById("stage");
  const badgeStage = document.querySelector(".badge-stage");
  const toggleOffline = document.getElementById("toggle-offline");
  const toggleDark = document.getElementById("toggle-dark");
  const manualForm = document.querySelector('[data-form="manual"]');
  const manualStage = document.getElementById("manual-stage");
  const manualName = document.getElementById("manual-name");

  let offlineMode = false;
  let offlineQueue = 3;
  let simulateTimeout;

  function showScreen(name) {
    screens.forEach((screen) => {
      const match = screen.dataset.screen === name || (screen.dataset.screen === "result" && name.startsWith("result"));
      screen.classList.toggle("hidden", !match);
    });

    if (name.startsWith("result")) {
      const status = name.replace("result-", "");
      const stage = stageSelect.value;
      showResult(status, { stage });
    }

    if (name === "scan") {
      startScanning();
    } else {
      stopScanning();
    }
  }

  function startScanning() {
    stopScanning();
    simulateTimeout = window.setTimeout(() => {
      const stage = stageSelect.value;
      const status = stage === "Hotel" ? "hotel" : "ok";
      showScreen(`result-${status}`);
      if (offlineMode) {
        offlineQueue += 1;
        updateOfflineBanner();
        pushToast("Tersimpan ke antrean offline", { type: "offline" });
      }
    }, 1400);
  }

  function stopScanning() {
    if (simulateTimeout) {
      window.clearTimeout(simulateTimeout);
      simulateTimeout = null;
    }
  }

  function showResult(status, options = {}) {
    const { stage = "Venue A", manual = false } = options;
    resultCard.dataset.status = status === "hotel" ? "ok" : status;

    const presets = {
      ok: {
        title: "Check-in Berhasil",
        badge: manual ? "Manual Verify" : "OK",
        subtext: "",
        showRetry: false,
        showHistory: false,
        primaryLabel: "Scan Berikutnya",
      },
      dup: {
        title: "QR Sudah Dipakai",
        badge: "DUP",
        subtext: "Terakhir dipakai 12.31 WIB • Petugas: Farah",
        showRetry: true,
        showHistory: true,
        primaryLabel: "Scan Ulang",
      },
      expired: {
        title: "QR Kedaluwarsa",
        badge: "EXPIRED",
        subtext: "Minta bantuan helpdesk",
        showRetry: true,
        showHistory: false,
        primaryLabel: "Scan Ulang",
      },
      invalid: {
        title: "QR Tidak Valid",
        badge: "INVALID",
        subtext: "",
        showRetry: true,
        showHistory: false,
        primaryLabel: "Scan Ulang",
      },
      hotel: {
        title: "Check-in Berhasil",
        badge: "OK",
        subtext: "",
        showRetry: false,
        showHistory: false,
        primaryLabel: "Scan Berikutnya",
      },
    };

    const preset = presets[status] || presets.ok;
    resultTitle.textContent = preset.title;
    badgeStatus.textContent = preset.badge;
    const badgeKey = manual ? "manual" : preset.badge.toLowerCase();
    badgeStatus.dataset.status = badgeKey;

    resultSubtext.textContent = preset.subtext;
    resultSubtext.classList.toggle("hidden", !preset.subtext);
    btnPrimary.textContent = preset.primaryLabel;
    btnSecondary.classList.toggle("hidden", true);
    linkHistory.classList.toggle("hidden", !preset.showHistory);

    fieldStage.textContent = stage;

    // Manual verify badge highlight
    badgeStatus.classList.toggle("badge-manual", manual);

    const now = new Date();
    const formatted = new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);
    fieldTime.textContent = `${formatted} WIB`;

    if (!manual) {
      fieldName.textContent = "Ayu Pratiwi";
    }
    fieldEvent.textContent = "Summit 2024";

    if (status === "hotel" || (stage === "Hotel" && status === "ok")) {
      hotelDetails.classList.remove("hidden");
      btnPrint.classList.remove("hidden");
      fieldHotel.textContent = "Hotel Sentosa";
      fieldRoom.textContent = status === "hotel" ? "1803" : "Pending Room";
    } else {
      hotelDetails.classList.add("hidden");
      btnPrint.classList.add("hidden");
    }
  }

  function updateOfflineBanner() {
    if (offlineMode && offlineQueue > 0) {
      bannerOffline.classList.remove("hidden");
      bannerOffline.querySelector(".banner-text").textContent = `Offline • ${offlineQueue} check-in akan dikirim saat online`;
    } else {
      bannerOffline.classList.add("hidden");
    }
  }

  function setOfflineMode(enabled) {
    offlineMode = enabled;
    connectionBadge.dataset.connection = enabled ? "offline" : "online";
    connectionBadge.querySelector(".label").textContent = enabled ? "Offline" : "Online";

    if (enabled) {
      if (offlineQueue === 0) {
        offlineQueue = 3;
      }
      updateOfflineBanner();
      pushToast("Tersimpan ke antrean offline", { type: "offline" });
    } else {
      pushToast("Terkirim", { type: "success" });
      offlineQueue = 0;
      updateOfflineBanner();
    }
  }

  function pushToast(message, options = {}) {
    const { type = "success", whenOffline = false } = options;
    if (whenOffline && !offlineMode) return;

    const toast = toastTemplate.content.firstElementChild.cloneNode(true);
    toast.dataset.type = type;
    toast.querySelector("p").textContent = message;
    toastContainer.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add("hide");
      window.setTimeout(() => toast.remove(), 300);
    }, 2600);
  }

  function toggleDarkMode(enabled) {
    document.body.classList.toggle("theme-dark", enabled);
    layout.classList.toggle("theme-dark", enabled);
  }

  // Events
  document.querySelectorAll("[data-action='show']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      if (target === "manual") {
        showScreen("manual");
      } else {
        showScreen(target);
      }
    });
  });

  document.querySelector("[data-action='open-camera']").addEventListener("click", (event) => {
    event.preventDefault();
    showScreen("scan");
  });

  document.querySelector("[data-action='show-manual']").addEventListener("click", (event) => {
    event.preventDefault();
    showScreen("manual");
  });

  btnPrimary.addEventListener("click", () => {
    showScreen("scan");
  });

  btnSecondary.addEventListener("click", () => {
    showScreen("scan");
  });

  manualForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = manualName.value.trim() || "Tamu Manual";
    const stage = manualStage.value;
    fieldName.textContent = name;
    showScreen("result-ok");
    showResult("ok", { stage, manual: true });
    manualName.value = "";
  });

  toggleOffline.addEventListener("change", (event) => {
    setOfflineMode(event.target.checked);
  });

  toggleDark.addEventListener("change", (event) => {
    toggleDarkMode(event.target.checked);
  });

  stageSelect.addEventListener("change", () => {
    const value = stageSelect.value;
    badgeStage.textContent = `Stage · ${value}`;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopScanning();
    }
  });

  // Initial state
  showScreen("home");
})();
