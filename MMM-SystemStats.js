Module.register("MMM-SystemStats", {
  defaults: {
    updateInterval: 5000,
    animationSpeed: 300,
    units: "metric",
  },

  start() {
    this.stats = null;
    this.error = null;
    this.intervalHandle = null;
    this.requestStats();
    this.startScheduler();
  },

  startScheduler() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }

    this.intervalHandle = setInterval(() => {
      this.requestStats();
    }, this.config.updateInterval);
  },

  requestStats() {
    this.sendSocketNotification("GET_STATS");
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "STATS_UPDATE") {
      if (!this.isValidStats(payload)) {
        this.error = "Invalid metrics payload";
        this.stats = null;
        this.updateDom(this.config.animationSpeed);
        return;
      }

      this.error = null;
      this.stats = payload;
      this.updateDom(this.config.animationSpeed);
      return;
    }

    if (notification === "STATS_ERROR") {
      this.error = payload?.message || "Unknown error";
      this.stats = null;
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

  createRow(label, value) {
    const row = document.createElement("div");
    row.className = "system-stats__row";

    const labelEl = document.createElement("span");
    labelEl.className = "system-stats__label";
    labelEl.textContent = label;

    const valueEl = document.createElement("span");
    valueEl.className = "system-stats__value";
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
      this.createRow(this.translate("CPU_LABEL"), this.formatPercent(this.stats.cpuLoad))
    );
    wrapper.appendChild(
      this.createRow(this.translate("TEMP_LABEL"), this.formatTemperature(this.stats.cpuTemp))
    );
    wrapper.appendChild(
      this.createRow(this.translate("RAM_LABEL"), this.formatPercent(this.stats.ramUsedPercent))
    );
    wrapper.appendChild(
      this.createRow(this.translate("DISK_LABEL"), this.formatPercent(this.stats.diskUsedPercent))
    );
    wrapper.appendChild(
      this.createRow(this.translate("UPTIME_LABEL"), this.formatUptime(this.stats.uptimeSeconds))
    );
    return wrapper;
  },

  suspend() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  },

  resume() {
    this.requestStats();
    this.startScheduler();
  },

  stop() {
    this.suspend();
  },
});
