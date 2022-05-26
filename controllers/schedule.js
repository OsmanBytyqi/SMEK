const Schedule = require('../models/schedule');
const PER_PAGE = 16;


exports.getSchedules = async(req, res, next) => {
    var page = req.params.page || 1;
    const filter = req.params.filter;
    const value = req.params.value;
    let searchObj = {};

    if(filter != 'all' && value != 'all') {
       searchObj[filter] = value;
    }

    try {
       const schedules = await Schedule
       .find(searchObj)
       .skip((PER_PAGE * page) - PER_PAGE)
       .limit(PER_PAGE);

       const count = await Schedule.find(searchObj).countDocuments();

       res.render("schedules", {
          schedules: schedules,
          current: page,
          pages: Math.ceil(count / PER_PAGE),
          filter: filter,
          value: value,
          user: req.user,
       })
    } catch(err) {
       console.log(err)
    }
}

exports.findSchedules = async(req, res, next) => {

   var page = req.params.page || 1;
   const filter = req.body.filter.toLowerCase();
   const value = req.body.searchName;

   if(value == "") {
       req.flash("error", "Fusha e kerkimit eshte e zbrazet. Ju lutem mbushni fushen e kerkimit per te marr rezultatin e kerkuar.");
       return res.redirect('back');
   }

   const searchObj = {};
   searchObj[filter] = value;

   try {
      const schedules = await Schedule
      .find(searchObj)
      .skip((PER_PAGE * page) - PER_PAGE)
      .limit(PER_PAGE)

      const count = await Schedule.find(searchObj).countDocuments();

      res.render("schedules", {
         schedules: schedules,
         current: page,
         pages: Math.ceil(count / PER_PAGE),
         filter: filter,
         value: value,
         user: req.user,
      })
   } catch(err) {
      console.log(err)
   }
}



exports.getScheduleDetails = async(req, res, next) => {
   try {
      const schedule_id = req.params.schedule_id;
      const schedule = await Schedule.findById(schedule_id);
      res.render("user/scheduleDetails", {schedule: schedule});
   } catch (err) {
      console.log(err);
      return res.redirect("back");
   }
}
