// app/routes.js
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

// Add the credentials to access database
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'trixie1',
    database : 'resconnect'
});

connection.connect(function(err) {
    if(err){
        console.log(err.code);
        console.log(err.fatal);
    }
    else
        console.log('Connection successful');
});

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			Employee: req.user
		});
	});

	app.get('/editProfile', isLoggedIn, function(req, res) {
		res.render('editProfile.ejs', {
			Employee: req.user
		});
	});

	app.post('/editProfile', isLoggedIn, function(req, res) {
		var updateProfileMysql = {
			password: bcrypt.hashSync(req.body.password, null, null),
			firstName: req.body.firstName,
			lastName: req.body.lastName
		}

		var insertQuery = ("UPDATE Employee SET password = ?, firstName = ?, lastName = ? WHERE empID = ?");
		connection.query(insertQuery, [updateProfileMysql.password, updateProfileMysql.firstName, updateProfileMysql.lastName, req.user.empID], function(err, rows){});
		res.redirect('/profile');
	})

	app.get('/duty', isLoggedIn, function(req, res) {
		res.render('duty.ejs', {
			Employee: req.user
		});
	});

	app.get('/mapping', isLoggedIn, function(req, res) {
		res.render('mapping.ejs', {
			Employee: req.user
		});
	});

	app.get('/agreement', isLoggedIn, function(req, res) {
		res.render('agreement.ejs', {
			Employee: req.user
		});
	});

	app.get('/newAgreement', isLoggedIn, function(req, res) {
		res.render('newAgreement.ejs', {
			Employee: req.user
		});
	});

	app.post('/newAgreement', function(req, res){
		var newAgreementMysql = {
			communityID: req.user.communityID,
			caID: req.user.empID,
			roomNumber: req.body.roomNumber,
			roommate1: req.body.roommate1,
			roommate2: req.body.roommate2,
			stressor1: req.body.stressor1,
			stressManagement1: req.body.stressManagement1,
			stressHelp1: req.body.stressHelp1,
			communicationVia1: req.body.communicationVia1,
			stressor2: req.body.stressor2,
			stressManagement2: req.body.stressManagement2,
			stressHelp2: req.body.stressHelp2,
			communicationVia2: req.body.communicationVia2,
			studyTime: req.body.studyTime,
			studyActivities: req.body.studyActivities,
			studyAdjustments: req.body.studyAdjustments,
			weekdaySleeptime: req.body.weekdaySleeptime,
			weekendSleeptime: req.body.weekendSleeptime,
			sleepActivities: req.body.sleepActivities,
			cleanTasks1: req.body.cleanTasks1,
			cleanFrequency1: req.body.cleanFrequency1,
			cleanTasks2: req.body.cleanTasks2,
			cleanFrequency2: req.body.cleanFrequency2,
			belongingPermission: req.body.belongingPermission,
			sharedElectronics: req.body.sharedElectronics,
			sharedClothes: req.body.sharedClothes,
			sharedFood: req.body.sharedFood,
			sharedHousehold: req.body.sharedHousehold,
			sharedOther: req.body.sharedOther,
			whileAway: req.body.whileAway,
			respectPrivacy: req.body.respectPrivacy,
			roommate1Habits: req.body.roommate1Habits,
			roommate1PetPeeves: req.body.roommate1PetPeeves,
			roommate2Habits: req.body.roommate2Habits,
			roommate2PetPeeves: req.body.roommate2PetPeeves,
			guestPermission: req.body.guestPermission,
			guestPrivacy: req.body.guestPrivacy,
			whenLocked: req.body.whenLocked,
			alcoholDrugs: req.body.alcoholDrugs,
			temperature: req.body.temperature,
			damage: req.body.damage,
			roommate1Signature: req.body.roommate1Signature,
			roommate2Signature: req.body.roommate2Signature
		};

		var insertQuery = "INSERT INTO RoommateAgreement ( communityID, caID, roomNumber, roommate1, roommate2, stressor1, stressManagement1, stressHelp1, communicationVia1, stressor2, stressManagement2, stressHelp2, communicationVia2, studyTime, studyActivities, studyAdjustments, weekdaySleeptime, weekendSleeptime, sleepActivities, cleanTasks1, cleanFrequency1, cleanTasks2, cleanFrequency2, belongingPermission, sharedElectronics, sharedClothes, sharedFood, sharedHousehold, sharedOther, whileAway, respectPrivacy, roommate1Habits, roommate1PetPeeves, roommate2Habits, roommate2PetPeeves, guestPermission, guestPrivacy, whenLocked, alcoholDrugs, temperature, damage, roommate1Signature, roommate2Signature ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

		connection.query(insertQuery, [newAgreementMysql.communityID, newAgreementMysql.caID, newAgreementMysql.roomNumber, newAgreementMysql.roommate1, newAgreementMysql.roommate2, newAgreementMysql.stressor1, newAgreementMysql.stressManagement1, newAgreementMysql.stressHelp1, newAgreementMysql.communicationVia1, newAgreementMysql.stressor2, newAgreementMysql.stressManagement2, newAgreementMysql.stressHelp2, newAgreementMysql.communicationVia2, newAgreementMysql.studyTime, newAgreementMysql.studyActivities, newAgreementMysql.studyAdjustments, newAgreementMysql.weekdaySleeptime, newAgreementMysql.weekendSleeptime, newAgreementMysql.sleepActivities, newAgreementMysql.cleanTasks1, newAgreementMysql.cleanFrequency1, newAgreementMysql.cleanTasks2, newAgreementMysql.cleanFrequency2, newAgreementMysql.belongingPermission, newAgreementMysql.sharedElectronics, newAgreementMysql.sharedClothes, newAgreementMysql.sharedFood, newAgreementMysql.sharedHousehold, newAgreementMysql.sharedOther, newAgreementMysql.whileAway, newAgreementMysql.respectPrivacy, newAgreementMysql.roommate1Habits, newAgreementMysql.roommate1PetPeeves, newAgreementMysql.roommate2Habits, newAgreementMysql.roommate2PetPeeves, newAgreementMysql.guestPermission, newAgreementMysql.guestPrivacy, newAgreementMysql.whenLocked, newAgreementMysql.alcoholDrugs, newAgreementMysql.temperature, newAgreementMysql.damage, newAgreementMysql.roommate1Signature, newAgreementMysql.roommate2Signature], function(err,rows) {});
		res.redirect(302, '/agreement');	
	});

	app.get('/proposal', isLoggedIn, function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('proposal.ejs', { 
			Employee: req.user
		 });
	});

	// process the signup form
	app.post('/proposal', function(req, res){
        var newProgramProposalMysql = {
           	communityID: req.user.communityID,
            programProposer: (req.user.firstName + " " + req.user.lastName),
            eventName: req.body.eventName,
            eventDateTime: req.body.eventDateTime,
            eventLocation: req.body.eventLocation,
            eventDescription: req.body.eventDescription,
            learningOutcome: req.body.learningOutcome,
            eventPRA: req.body.eventPRA
        };

        var insertQuery = "INSERT INTO ProgramProposal ( communityID, programProposer, eventName, eventDateTime, eventLocation, eventDescription, learningOutcome, eventPRA ) values (?,?,?,?,?,?,?,?)";

        connection.query(insertQuery, [newProgramProposalMysql.communityID, newProgramProposalMysql.programProposer, newProgramProposalMysql.eventName, newProgramProposalMysql.eventDateTime, newProgramProposalMysql.eventLocation, newProgramProposalMysql.eventDescription, newProgramProposalMysql.learningOutcome, newProgramProposalMysql.eventPRA], function(err,rows) {});
		res.redirect(302, '/profile');
	});

	app.get('/leadership', isLoggedIn, function(req, res) {
		res.render('leadership.ejs', {
			Employee: req.user
		});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
