const fs = require('fs');

const Schedule = require('../models/schedule');
const User = require('../models/user');
const Activity = require('../models/activity');
const Issue = require('../models/issue');


const PER_PAGE = 10;

exports.getDashboard = async(req, res, next) => {
    var page = req.query.page || 1;
    try{
        const users_count = await User.find().countDocuments() - 1;
        const schedules_count = await Schedule.find().countDocuments();
        const activity_count = await Activity.find().countDocuments();
        const activities = await Activity
            .find()
            .sort('-entryTime')
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE);

        res.render("admin/index", {
            users_count : users_count,
            schedules_count : schedules_count,
            activities : activities,
            current : page,
            pages: Math.ceil(activity_count / PER_PAGE),
            });
    } catch(err) {
        console.log(err)
    }
}


exports.postDashboard = async(req, res, next) => {
    try {
        const search_value = req.body.searchUser;

        const schedules_count = await Schedule.find().countDocuments();
        const users_count = await User.find().countDocuments();

        const activities = await Activity
            .find({
                $or : [
                    {"user_id.username" :search_value},
                    {"category" : search_value}
                ]
            });

        res.render("admin/index", {
            users_count: users_count,
            schedules_count: schedules_count,
            activities: activities,
            current: 1,
            pages: 0,
        });

    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
}


exports.deleteAdminProfile = async(req, res, next) => {
    try{
        await User.findByIdAndRemove(req.user._id);
        res.redirect("/");
    } catch(err) {
        console.log(err);
        return res.redirect('back');
    }
}


exports.getAdminScheduleInventory = async(req, res, next) => {
    try{
        let page = req.params.page || 1;
        const filter = req.params.filter;
        const value = req.params.value;

        let searchObj = {};
        if(filter !== 'all' && value !== 'all') {
            searchObj[filter] = value;
         }

        const schedules_count = await Schedule.find(searchObj).countDocuments();

        const schedules = await Schedule
            .find(searchObj)
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE)

        res.render("admin/scheduleInventory", {
            schedules : schedules,
            current : page,
            pages: Math.ceil(schedules_count / PER_PAGE),
            filter : filter,
            value : value,
        });
    } catch(err) {
        return res.redirect('back');
    }
}


exports.postAdminScheduleInventory = async(req, res, next) => {
    try {
        let page = req.params.page || 1;
        const filter = req.body.filter.toLowerCase();
        const value = req.body.searchName;

        if(value == "") {
            req.flash("error", "Fusha e kerkimit eshte e zbrazet. Ju lutem mbushni fushen e kerkimit per te marrur rezultatin!");
            return res.redirect('back');
        }
        const searchObj = {};
        searchObj[filter] = value;

        const schedules_count = await Schedule.find(searchObj).countDocuments();

        const schedules = await Schedule
            .find(searchObj)
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE);

        res.render("admin/scheduleInventory", {
            schedules: schedules,
            current: page,
            pages: Math.ceil(schedules_count / PER_PAGE),
            filter: filter,
            value: value,
        });

    } catch(err) {
        return res.redirect('back');
    }
}

exports.getUpdateSchedule = async (req, res, next) => {

    try {
        const schedule_id = req.params.schedule_id;
        const schedule = await Schedule.findById(schedule_id);

        res.render('admin/schedule', {
            schedule: schedule,
        })
    } catch(err) {
        console.log(err);
        return res.redirect('back');
    }
};

exports.postUpdateSchedule = async(req, res, next) => {

    try {
        const description = req.sanitize(req.body.schedule.description);
        const schedule_info = req.body.schedule;
        const schedule_id = req.params.schedule_id;

        await Schedule.findByIdAndUpdate(schedule_id, schedule_info);

        res.redirect("/admin/scheduleInventory/all/all/1");
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

exports.getDeleteSchedule = async(req, res, next) => {
    try {
        const schedule_id = req.params.schedule_id;

        const schedule = await Schedule.findById(schedule_id);
        await schedule.remove();

        req.flash("success", `Libri me titull ${schedule.title} u fshi!`);
        res.redirect('back');

    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
};

exports.getUserList = async (req, res, next) =>  {
    try {
        const page = req.params.page || 1;

        const users = await User
            .find()
            .sort('-joined')
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE);

        const users_count = await User.find().countDocuments();

        res.render('admin/users', {
            users: users,
            current: page,
            pages: Math.ceil( users_count / PER_PAGE),
        });

    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

exports.postShowSearchedUser = async (req, res, next) => {
    try {
        const page = req.params.page || 1;
        const search_value = req.body.searchUser;

        const users = await User.find({
            $or: [
                {"firstName": search_value},
                {"lastName": search_value},
                {"username": search_value},
                {"email": search_value},
            ]
        });

        if(users.length <= 0) {
            req.flash("error", "Perdoruesi nuk u gjet!");
            return res.redirect('back');
        } else {
            res.render("admin/users", {
                users: users,
                current: page,
                pages: 0,
            });
        }
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};



exports.getUserProfile = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;

        const user = await User.findById(user_id);
        const issues = await Issue.find({"user_id.id": user_id});
        const activities = await Activity.find({"user_id.id": user_id}).sort('-entryTime');

        res.render("admin/user", {
            user: user,
            issues: issues,
            activities: activities,
        });
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
}

exports.getUserAllActivities = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;

        const activities = await Activity.find({"user_id.id": user_id})
                                         .sort('-entryTime');
        res.render("admin/activities", {
            activities: activities
        });
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
};

exports.postShowActivitiesByCategory = async (req, res, next) => {
    try {
        const category = req.body.category;
        const activities = await Activity.find({"category": category});

        res.render("admin/activities", {
            activities: activities,
        });
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
};

exports.getDeleteUser = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;
        const user = await User.findById(user_id);
        await user.remove();



        await Issue.deleteMany({"user_id.id": user_id});
        await Activity.deleteMany({"user_id.id": user_id});

        res.redirect("/admin/users/1");
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
}

exports.getAddNewSchedule = (req, res, next) => {
    res.render("admin/addSchedule");
}

exports.postAddNewSchedule = async(req, res, next) => {
    try {
//         const new_schedule = new Schedule({
//             title : req.body.title,
//             ISBN :req.body.ISBN,
//             stock : req.body.stock,
//             author : req.body.author,
//         description : req.body.description,
//    category : req.body.category
//         });

        const schedule_info = req.body.schedule;
        schedule_info.description = req.sanitize(schedule_info.description);

        const isDuplicate = await Schedule.find(schedule_info);

        if(isDuplicate.length > 0) {
            req.flash("error", "Ky liber eshte i regjistruar ne inventar");
            return res.redirect('back');
        }

        const new_schedule = new Schedule(schedule_info);
        await new_schedule.save();
        req.flash("success", `Libri me titullin ${new_schedule.title} u shtua ne inventar`);
        res.redirect("/admin/scheduleInventory/all/all/1");
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
};

exports.getAdminProfile = (req, res, next) => {
    res.render("admin/profile");
};

exports.postUpdateAdminProfile = async (req, res, next) => {
    try {
        const user_id = req.user._id;
        const update_info = req.body.admin;

        await User.findByIdAndUpdate(user_id, update_info);

        res.redirect("/admin/profile");

    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
};

exports.putUpdateAdminPassword = async (req, res, next) => {
    try {
        const user_id = req.user._id;
        const old_password = req.body.oldPassword;
        const new_password = req.body.password;

        const admin = await User.findById(user_id);
        await admin.changePassword(old_password, new_password);
        await admin.save();

        req.flash("success", "Fjalekalimi juaj eshte ndryshuar. Ju lutem kyquni perseri per ta konfirmuar.");
        res.redirect("/auth/admin-login");
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};
