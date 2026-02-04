Module.register("MMM-SystemStats", {
  defaults: {
    updateInterval: 5000,
    animationSpeed: 300,
    units: "metric",
    showIcons: true,
    iconSize: 14,
    maxBackoffFactor: 8,
    thresholds: {
      cpu: { warning: 60, critical: 85 },
      temp: { warning: 65, critical: 80 },
      ram: { warning: 70, critical: 90 },
      disk: { warning: 80, critical: 95 },
    },
  },

  start() {
    this.stats = null;
    this.error = null;
    this.intervalHandle = null;
    this.retryTimeout = null;
    this.consecutiveErrors = 0;
    this.updateIntervalMs = this.resolveUpdateInterval(this.config.updateInterval);
    this.thresholds = this.normalizeThresholds(this.config.thresholds);
    this.requestStats();
    this.startScheduler();
  },

  resolveUpdateInterval(value) {
    if (typeof value === "string") {
      const trimmed = value.trim().toLowerCase();
      if (trimmed.endsWith("ms")) {
        const parsedMs = Number.parseFloat(trimmed.slice(0, -2));
        return Number.isFinite(parsedMs) && parsedMs > 0 ? parsedMs : 5000;
      }
      if (trimmed.endsWith("s")) {
        const parsedSeconds = Number.parseFloat(trimmed.slice(0, -1));
        return Number.isFinite(parsedSeconds) && parsedSeconds > 0 ? parsedSeconds * 1000 : 5000;
      }
    }

    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return value < 1000 ? value * 1000 : value;
    }

    return 5000;
  },

  normalizeThresholds(thresholds) {
    const fallback = {
      cpu: { warning: 60, critical: 85 },
      temp: { warning: 65, critical: 80 },
      ram: { warning: 70, critical: 90 },
      disk: { warning: 80, critical: 95 },
    };

    const safeThresholds = thresholds && typeof thresholds === "object" ? thresholds : {};
    const normalized = {};
    const keys = Object.keys(fallback);

    keys.forEach((key) => {
      const fromConfig = safeThresholds[key] || {};
      const warning = Number.isFinite(fromConfig.warning)
        ? fromConfig.warning
        : fallback[key].warning;
      const critical = Number.isFinite(fromConfig.critical)
        ? fromConfig.critical
        : fallback[key].critical;

      normalized[key] = {
        warning,
        critical: critical >= warning ? critical : warning,
      };
    });

    return normalized;
  },

  startScheduler() {
    this.clearRetryTimeout();

    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }

    this.intervalHandle = setInterval(() => {
      this.requestStats();
    }, this.updateIntervalMs);
  },

  requestStats() {
    this.sendSocketNotification("GET_STATS");
  },

  clearRetryTimeout() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  },

  scheduleRetry() {
    this.clearRetryTimeout();
    const exponent = Math.max(0, this.consecutiveErrors - 1);
    const backoffFactor = Math.min(2 ** exponent, this.config.maxBackoffFactor);
    const delay = this.updateIntervalMs * backoffFactor;

    this.retryTimeout = setTimeout(() => {
      this.retryTimeout = null;
      this.requestStats();
    }, delay);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "STATS_UPDATE") {
      if (!this.isValidStats(payload)) {
        this.consecutiveErrors += 1;
        this.error = "Invalid metrics payload";
        this.stats = null;
        this.scheduleRetry();
        this.updateDom(this.config.animationSpeed);
        return;
      }

      this.consecutiveErrors = 0;
      this.clearRetryTimeout();
      this.error = null;
      this.stats = payload;
      this.updateDom(this.config.animationSpeed);
      return;
    }

    if (notification === "STATS_ERROR") {
      this.consecutiveErrors += 1;
      this.error = payload?.message || "Unknown error";
      this.stats = null;
      this.scheduleRetry();
      this.updateDom(this.config.animationSpeed);
    }
  },

  getStyles() {
    return [this.file("MMM-SystemStats.css")];
  },

  getTranslations() {
    return {
      en: "translations/en.json",
      fr: "translations/fr.json",
    };
  },

  isValidStats(stats) {
    if (!stats || typeof stats !== "object") {
      return false;
    }

    const hasNumbers =
      typeof stats.cpuLoad === "number" &&
      typeof stats.ramUsedPercent === "number" &&
      typeof stats.uptimeSeconds === "number";
    const hasOptionalNumbers =
      (typeof stats.cpuTemp === "number" || stats.cpuTemp === null) &&
      (typeof stats.diskUsedPercent === "number" || stats.diskUsedPercent === null);

    return hasNumbers && hasOptionalNumbers;
  },

  formatPercent(value) {
    return typeof value === "number" ? `${value.toFixed(1)}%` : "N/A";
  },

  formatTemperature(value) {
    return typeof value === "number" ? `${value.toFixed(1)}°C` : "N/A";
  },

  formatUptime(seconds) {
    if (typeof seconds !== "number") {
      return "N/A";
    }

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
  },

  getSeverity(metricKey, value) {
    if (typeof value !== "number") {
      return "neutral";
    }

    const metricThresholds = this.thresholds?.[metricKey];
    if (!metricThresholds) {
      return "neutral";
    }

    if (value >= metricThresholds.critical) {
      return "critical";
    }

    if (value >= metricThresholds.warning) {
      return "warning";
    }

    return "ok";
  },

  createRow(iconName, label, value, severity) {
    const row = document.createElement("div");
    row.className = "system-stats__row";

    const labelEl = document.createElement("span");
    labelEl.className = "system-stats__label";
    if (this.config.showIcons && iconName) {
      const iconEl = document.createElement("img");
      iconEl.className = "system-stats__icon";
      iconEl.src = this.file(`public/icons/${iconName}.svg`);
      iconEl.alt = "";
      iconEl.width = this.config.iconSize;
      iconEl.height = this.config.iconSize;
      iconEl.setAttribute("aria-hidden", "true");
      labelEl.appendChild(iconEl);
    }

    const labelText = document.createElement("span");
    labelText.textContent = label;
    labelEl.appendChild(labelText);

    const valueEl = document.createElement("span");
    valueEl.className = "system-stats__value";
    if (severity) {
      valueEl.classList.add(`system-stats__value--${severity}`);
    }
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(valueEl);
    return row;
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "system-stats";

    if (this.error) {
      wrapper.classList.add("system-stats--error");
      wrapper.textContent = this.error;
      return wrapper;
    }

    if (!this.stats) {
      wrapper.classList.add("system-stats--loading");
      wrapper.textContent = this.translate("LOADING");
      return wrapper;
    }

    wrapper.appendChild(
      this.createRow(
        "cpu",
        this.translate("CPU_LABEL"),
        this.formatPercent(this.stats.cpuLoad),
        this.getSeverity("cpu", this.stats.cpuLoad)
      )
    );
    wrapper.appendChild(
      this.createRow(
        "temp",
        this.translate("TEMP_LABEL"),
        this.formatTemperature(this.stats.cpuTemp),
        this.getSeverity("temp", this.stats.cpuTemp)
      )
    );
    wrapper.appendChild(
      this.createRow(
        "ram",
        this.translate("RAM_LABEL"),
        this.formatPercent(this.stats.ramUsedPercent),
        this.getSeverity("ram", this.stats.ramUsedPercent)
      )
    );
    wrapper.appendChild(
      this.createRow(
        "disk",
        this.translate("DISK_LABEL"),
        this.formatPercent(this.stats.diskUsedPercent),
        this.getSeverity("disk", this.stats.diskUsedPercent)
      )
    );
    wrapper.appendChild(
      this.createRow(
        "uptime",
        this.translate("UPTIME_LABEL"),
        this.formatUptime(this.stats.uptimeSeconds)
      )
    );
    return wrapper;
  },

  suspend() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }

    this.clearRetryTimeout();
  },

  resume() {
    this.requestStats();
    this.startScheduler();
  },

  stop() {
    this.suspend();
  },
});
