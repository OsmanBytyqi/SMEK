const sharp = require('sharp');
const uid = require('uid');
const fs = require('fs');

const User = require("../models/user"),
      Activity = require("../models/activity"),
      Schedule = require("../models/schedule"),
      Issue = require("../models/issue");



const PER_PAGE = 5;

exports.getUserDashboard = async(req, res, next) => {
    var page = req.params.page || 1;
    const user_id = req. user._id;

    try {
        const user = await User.findById(user_id);

        const activities = await Activity
            .find({"user_id.id": req.user._id})
            .sort('-entryTime')
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE);

        const activity_count = await Activity
            .find({"user_id.id": req.user._id})
            .countDocuments();

        res.render("user/index", {
            user : user,
            current : page,
            pages: Math.ceil(activity_count / PER_PAGE),
            activities : activities,
        });
    } catch(err) {
        console.log(err);
        return res.redirect('back');
    }
}

exports.getUserProfile = (req, res, next) => {
    res.render("user/profile");
}

exports.putUpdatePassword = async(req, res, next) => {
    const username = req.user.username;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.password;

    try {
        const user = await User.findByUsername(username);
        await user.changePassword(oldPassword, newPassword);
        await user.save();

        const activity = new Activity({
            category: "Perditeso fjalekalimin",
            user_id : {
                id : req.user._id,
                username : req.user.username,
            },
        });
        await activity.save();

        req.flash("success", "Fjalekalimi juaj eshte perditesuar. Ju lutem kyquni perseri per ta konfirmuar.");
        res.redirect("/auth/user-login");
    } catch(err) {
        console.log(err);
        return res.redirect('back');
    }
}

exports.putUpdateUserProfile = async(req, res, next) => {
    try{
        const userUpdateInfo = {
            "firstName": req.body.firstName,
            "lastName": req.body.lastName,
            "email": req.body.email,
            "gender": req.body.gender,
            "address": req.body.address,
        }
        await User.findByIdAndUpdate(req.user._id, userUpdateInfo);

        const activity = new Activity({
            category: "Perditeso profilin",
            user_id: {
                id: req.user._id,
                username: req.user.username,
            }
        });
        await activity.save();

        res.redirect('back');
    } catch(err) {
        console.log(err);
        return res.redirect('back');
    }
}





exports.postIssueSchedule = async(req, res, next) => {
    if(req.user.scheduleIssueInfo.length >= 5) {
        req.flash("warning", "Ju nuk mund te te rezervoni me shume se 5 orare njokohsisht njekohesisht.");
        return res.redirect("back");
    }

    try {
        const schedule = await Schedule.findById(req.params.schedule_id);
        const user = await User.findById(req.params.user_id);

        schedule.stock -= 1;
        const issue =  new Issue({
            schedule_info: {
                id: schedule._id,
                title: schedule.title,
                author: schedule.author,
                ISBN: schedule.ISBN,
                category: schedule.category,
                stock: schedule.stock,
            },
            user_id: {
                id: user._id,
                username: user.username,
            }
        });

        user.scheduleIssueInfo.push(schedule._id);

        const activity = new Activity({
            info: {
                id: schedule._id,
                title: schedule.title,
            },
            category: "Merr",
            time: {
                id: issue._id,
                issueDate: issue.schedule_info.issueDate,
                returnDate: issue.schedule_info.returnDate,
            },
            user_id: {
                id: user._id,
                username: user.username,
            }
        });

        await issue.save();
        await user.save();
        await schedule.save();
        await activity.save();

        res.redirect("/schedules/all/all/1");
    } catch(err) {
        console.log(err);
        return res.redirect("back");
    }
}
exports.getShowRenewReturn = async(req, res, next) => {
    const user_id = req.user._id;
    try {
        const issue = await Issue.find({"user_id.id": user_id});
        res.render("user/return-renew", {user: issue});
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
}
exports.postReturnSchedule = async(req, res, next) => {
    try {
        const schedule_id = req.params.schedule_id;
        const pos = req.user.scheduleIssueInfo.indexOf(req.params.schedule_id);

        const schedule = await Schedule.findById(schedule_id);
        schedule.stock += 1;
        await schedule.save();

        const issue =  await Issue.findOne({"user_id.id": req.user._id});
        await issue.remove();

        req.user.scheduleIssueInfo.splice(pos, 1);
        await req.user.save();

        const activity = new Activity({
            info: {
                id: issue.schedule_info.id,
                title: issue.schedule_info.title,
            },
            category: "Kthe",
            time: {
                id: issue._id,
                issueDate: issue.schedule_info.issueDate,
                returnDate: issue.schedule_info.returnDate,
            },
            user_id: {
                id: req.user._id,
                username: req.user.username,
            }
        });
        await activity.save();

        res.redirect("/schedules/return-renew");
    } catch(err) {
        console.log(err);
        return res.redirect("back");
    }
}

exports.deleteUserAccount = async (req, res, next) => {
    try {
        const user_id = req.user._id;

        const user = await User.findById(user_id);
        await user.remove();

        await Issue.deleteMany({"user_id.id": user_id});

        await Activity.deleteMany({"user_id.id": user_id});

        res.redirect("/auth/user-signup");
    } catch (err) {
        console.log(err);
        res.redirect('/auth/user-signup');
    }
}
