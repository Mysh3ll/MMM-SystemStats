const NodeHelper = require("node_helper");
const si = require("systeminformation");

module.exports = NodeHelper.create({
  start() {
    console.log("[MMM-SystemStats] Node helper started");
  },

  async getSystemStats() {
    try {
      const [cpuLoad, cpuTemperature, memory, filesystems, time] = await Promise.all([
        si.currentLoad(),
        si.cpuTemperature(),
        si.mem(),
        si.fsSize(),
        si.time(),
      ]);

      const mainFs = Array.isArray(filesystems) && filesystems.length > 0 ? filesystems[0] : null;
      const safeTemp = typeof cpuTemperature.main === "number" ? cpuTemperature.main : null;

      return {
        cpuLoad: Number(cpuLoad.currentLoad.toFixed(1)),
        cpuTemp: safeTemp !== null ? Number(safeTemp.toFixed(1)) : null,
        ramUsedPercent: Number(
          (((memory.total - memory.available) / memory.total) * 100).toFixed(1)
        ),
        diskUsedPercent:
          mainFs && typeof mainFs.use === "number" ? Number(mainFs.use.toFixed(1)) : null,
        uptimeSeconds: time.uptime,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("[MMM-SystemStats] Error in getSystemStats:", error);
      throw error;
    }
  },

  async socketNotificationReceived(notification, payload) {
    void payload;
    if (notification !== "GET_STATS") {
      return;
    }

    try {
      const stats = await this.getSystemStats();
      this.sendSocketNotification("STATS_UPDATE", stats);
    } catch (error) {
      console.error("[MMM-SystemStats] Failed to fetch stats:", error);
      this.sendSocketNotification("STATS_ERROR", {
        message: "Unable to read system metrics",
      });
    }
  },

  stop() {
    console.log("[MMM-SystemStats] Node helper stopped");
  },
});
