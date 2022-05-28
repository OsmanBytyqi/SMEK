const express = require("express"),
      router = express.Router(),
      passport = require("passport"),
      middleware = require("../middleware"),
      User = require("../models/user"),
      Schedule = require("../models/schedule"),
      Activity = require("../models/activity"),
      Issue = require("../models/issue")

const adminController = require('../controllers/admin');

router.get("/admin", middleware.isAdmin, adminController.getDashboard);

router.post("/admin", middleware.isAdmin, adminController.postDashboard);

router.delete("/admin/delete-profile", middleware.isAdmin, adminController.deleteAdminProfile);

router.get("/admin/scheduleInventory/:filter/:value/:page", middleware.isAdmin, adminController.getAdminScheduleInventory);

router.post("/admin/scheduleInventory/:filter/:value/:page", middleware.isAdmin, adminController.postAdminScheduleInventory);

router.get("/admin/schedule/update/:schedule_id", middleware.isAdmin, adminController.getUpdateSchedule);

router.post("/admin/schedule/update/:schedule_id", middleware.isAdmin, adminController.postUpdateSchedule);

router.get("/admin/schedule/delete/:schedule_id", middleware.isAdmin, adminController.getDeleteSchedule);

router.get("/admin/users/:page", middleware.isAdmin, adminController.getUserList);

router.post("/admin/users/:page", middleware.isAdmin, adminController.postShowSearchedUser);

router.get("/admin/users/profile/:user_id", middleware.isAdmin, adminController.getUserProfile);

router.get("/admin/users/activities/:user_id", middleware.isAdmin, adminController.getUserAllActivities);

router.post("/admin/users/activities/:user_id", middleware.isAdmin, adminController.postShowActivitiesByCategory);

router.get("/admin/users/delete/:user_id", middleware.isAdmin, adminController.getDeleteUser);

router.get("/admin/schedules/add", middleware.isAdmin, adminController.getAddNewSchedule);

router.post("/admin/schedules/add",  adminController.postAddNewSchedule);

router.get("/admin/profile", middleware.isAdmin, adminController.getAdminProfile);

router.post("/admin/profile", middleware.isAdmin, adminController.postUpdateAdminProfile);

router.put("/admin/update-password", middleware.isAdmin, adminController.putUpdateAdminPassword);

module.exports = router;
