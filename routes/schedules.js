const express = require("express"),
      router = express.Router();


const scheduleController = require('../controllers/schedule');

router.get("/schedules/:filter/:value/:page", scheduleController.getSchedules);

router.post("/schedules/:filter/:value/:page", scheduleController.findSchedules);

router.get("/schedules/details/:schedule_id", scheduleController.getScheduleDetails);
module.exports = router;
