const Logs = require("../Schemas/Logs");

module.exports = {
  studentsTrigger: async (change) => {
    try {
      const log = new Logs({
        name: "students",
        operation: change.operationType,
        changeDetails: change,
      });
      await log.save();
    } catch (error) {
      console.error("Error logging students change:", error);
    }
  },

  registrationsTrigger: async (change) => {
    try {
      const log = new Logs({
        name: "registrations",
        operation: change.operationType,
        changeDetails: change,
      });
      await log.save();
    } catch (error) {
      console.error("Error logging registrations change:", error);
    }
  },

  eventsTrigger: async (change) => {
    try {
      const log = new Logs({
        name: "events",
        operation: change.operationType,
        changeDetails: change,
      });
      await log.save();
    } catch (error) {
      console.error("Error logging events change:", error);
    }
  },

  collegesTrigger: async (change) => {
    try {
      const log = new Logs({
        name: "colleges",
        operation: change.operationType,
        changeDetails: change,
      });
      await log.save();
    } catch (error) {
      console.error("Error logging colleges change:", error);
    }
  },
};
