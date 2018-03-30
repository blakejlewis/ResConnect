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

		var updateQuery = ("UPDATE Employee SET password = ?, firstName = ?, lastName = ? WHERE empID = ?");
		connection.query(updateQuery, [updateProfileMysql.password, updateProfileMysql.firstName, updateProfileMysql.lastName, 
									   req.user.empID], function(err, rows){});
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
			floorLevel: req.user.floorLevel,
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

		var insertQuery = "INSERT INTO RoommateAgreement ( communityID, caID, floorLevel, roomNumber, roommate1, roommate2, stressor1, stressManagement1, stressHelp1, communicationVia1, stressor2, stressManagement2, stressHelp2, communicationVia2, studyTime, studyActivities, studyAdjustments, weekdaySleeptime, weekendSleeptime, sleepActivities, cleanTasks1, cleanFrequency1, cleanTasks2, cleanFrequency2, belongingPermission, sharedElectronics, sharedClothes, sharedFood, sharedHousehold, sharedOther, whileAway, respectPrivacy, roommate1Habits, roommate1PetPeeves, roommate2Habits, roommate2PetPeeves, guestPermission, guestPrivacy, whenLocked, alcoholDrugs, temperature, damage, roommate1Signature, roommate2Signature ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

		connection.query(insertQuery, [newAgreementMysql.communityID, newAgreementMysql.caID, newAgreementMysql.floorLevel, newAgreementMysql.roomNumber, newAgreementMysql.roommate1, 
									   newAgreementMysql.roommate2, newAgreementMysql.stressor1, newAgreementMysql.stressManagement1, 
									   newAgreementMysql.stressHelp1, newAgreementMysql.communicationVia1, newAgreementMysql.stressor2, 
									   newAgreementMysql.stressManagement2, newAgreementMysql.stressHelp2, newAgreementMysql.communicationVia2, 
									   newAgreementMysql.studyTime, newAgreementMysql.studyActivities, newAgreementMysql.studyAdjustments, 
									   newAgreementMysql.weekdaySleeptime, newAgreementMysql.weekendSleeptime, newAgreementMysql.sleepActivities, 
									   newAgreementMysql.cleanTasks1, newAgreementMysql.cleanFrequency1, newAgreementMysql.cleanTasks2, 
									   newAgreementMysql.cleanFrequency2, newAgreementMysql.belongingPermission, newAgreementMysql.sharedElectronics, 
									   newAgreementMysql.sharedClothes, newAgreementMysql.sharedFood, newAgreementMysql.sharedHousehold, 
									   newAgreementMysql.sharedOther, newAgreementMysql.whileAway, newAgreementMysql.respectPrivacy, 
									   newAgreementMysql.roommate1Habits, newAgreementMysql.roommate1PetPeeves, newAgreementMysql.roommate2Habits, 
									   newAgreementMysql.roommate2PetPeeves, newAgreementMysql.guestPermission, newAgreementMysql.guestPrivacy, 
									   newAgreementMysql.whenLocked, newAgreementMysql.alcoholDrugs, newAgreementMysql.temperature, newAgreementMysql.damage, 
									   newAgreementMysql.roommate1Signature, newAgreementMysql.roommate2Signature], function(err,rows) {
									   	if(err) throw err;
									   });
		res.redirect(302, '/agreement');	
	});

	app.get('/viewAgreement', isLoggedIn, function(req, res) {
		communityID = req.user.communityID;
		floorLevel = req.user.floorLevel;

		if(req.user.permissionsType == 1) {

			var query = "SELECT * FROM RoommateAgreement WHERE communityID = ? AND floorLevel = ?";
			connection.query(query, [communityID, floorLevel], function(err, rows, fields) {
			if (err) throw err;

				res.render('viewAgreement.ejs', {
					Employee: req.user,
					Agreements: rows
				});
			});
		}
		else if(req.user.permissionsType == 2) {

			var query = "SELECT * FROM RoommateAgreement WHERE communityID = ?";
			connection.query(query, communityID, function(err, rows, fields) {
				if (err) throw err;

				res.render('viewAgreement.ejs', {
					Employee: req.user,
					Agreements: rows
				});
			});
		}
	});

	app.get('/editAgreement/:id', isLoggedIn, function(req, res) {
		let agreementID = req.params.id;
		var query = ("SELECT * FROM RoommateAgreement WHERE agreementID = ?");
		connection.query(query, agreementID, function(err, rows, fields){
			if (err) throw err;

			res.render('editAgreement.ejs', {
				Employee: req.user,
				Agreement: rows
			});
		});
	});

	app.post('/updateAgreement/:id', isLoggedIn, function(req, res) {
		let agreementID = req.params.id;
		var updateAgreementMysql = {
			communityID: req.user.communityID,
			caID: req.user.empID,
			floorLevel: req.user.floorLevel,
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

		var updateQuery = ("UPDATE RoommateAgreement SET communityID = ?, caID = ?, floorLevel = ?, roomNumber = ?, roommate1 = ?, roommate2 = ?, stressor1 = ?, stressManagement1 = ?, stressHelp1 = ?, communicationVia1 = ?, stressor2 = ?, stressManagement2 = ?, stressHelp2 = ?, communicationVia2 = ?, studyTime = ?, studyActivities = ?, studyAdjustments = ?, weekdaySleeptime = ?, weekendSleeptime = ?, sleepActivities = ?, cleanTasks1 = ?, cleanFrequency1 = ?, cleanTasks2 = ?, cleanFrequency2 = ?, belongingPermission = ?, sharedElectronics = ?, sharedClothes = ?, sharedFood = ?, sharedHousehold = ?, sharedOther = ?, whileAway = ?, respectPrivacy = ?, roommate1Habits = ?, roommate1PetPeeves = ?, roommate2Habits = ?, roommate2PetPeeves = ?, guestPermission = ?, guestPrivacy = ?, whenLocked = ?, alcoholDrugs = ?, temperature = ?, damage = ?, roommate1Signature = ?, roommate2Signature = ? WHERE agreementID = ?");
		connection.query(updateQuery, [updateAgreementMysql.communityID, updateAgreementMysql.caID, updateAgreementMysql.floorLevel, updateAgreementMysql.roomNumber, updateAgreementMysql.roommate1, 
									   updateAgreementMysql.roommate2, updateAgreementMysql.stressor1, updateAgreementMysql.stressManagement1, 
									   updateAgreementMysql.stressHelp1, updateAgreementMysql.communicationVia1, updateAgreementMysql.stressor2, 
									   updateAgreementMysql.stressManagement2, updateAgreementMysql.stressHelp2, updateAgreementMysql.communicationVia2, 
									   updateAgreementMysql.studyTime, updateAgreementMysql.studyActivities, updateAgreementMysql.studyAdjustments, 
									   updateAgreementMysql.weekdaySleeptime, updateAgreementMysql.weekendSleeptime, updateAgreementMysql.sleepActivities, 
									   updateAgreementMysql.cleanTasks1, updateAgreementMysql.cleanFrequency1, updateAgreementMysql.cleanTasks2, 
									   updateAgreementMysql.cleanFrequency2, updateAgreementMysql.belongingPermission, updateAgreementMysql.sharedElectronics, 
									   updateAgreementMysql.sharedClothes, updateAgreementMysql.sharedFood, updateAgreementMysql.sharedHousehold, 
									   updateAgreementMysql.sharedOther, updateAgreementMysql.whileAway, updateAgreementMysql.respectPrivacy, 
									   updateAgreementMysql.roommate1Habits, updateAgreementMysql.roommate1PetPeeves, updateAgreementMysql.roommate2Habits, 
									   updateAgreementMysql.roommate2PetPeeves, updateAgreementMysql.guestPermission, updateAgreementMysql.guestPrivacy, 
									   updateAgreementMysql.whenLocked, updateAgreementMysql.alcoholDrugs, updateAgreementMysql.temperature, updateAgreementMysql.damage, 
									   updateAgreementMysql.roommate1Signature, updateAgreementMysql.roommate2Signature, agreementID], function(err,rows) {

									   	if(err) throw err;});
		res.redirect('/agreement');
	});

	app.post('/deleteAgreement/:id', isLoggedIn, function(req, res) {
		var agreementID = req.params.id;
		var deleteQuery = ("DELETE FROM RoommateAgreement WHERE agreementID = ?");
		connection.query(deleteQuery, agreementID, function(err, rows) {
			if(err) throw err;
			res.redirect(302, '/agreement');
		});
	});


	app.get('/proposal', isLoggedIn, function(req, res) {
		if(req.user.permissionsType == 1) {
			res.render('newProposal.ejs', { 
				Employee: req.user
		 	});
		}
		else if(req.user.permissionsType == 2){

			CommunityID = req.user.communityID;

			var query = "SELECT * FROM ProgramProposal WHERE communityID = ?";
			connection.query(query, CommunityID, function(err, rows, fields) {
				if (err) throw err;

				res.render('viewProposal.ejs', {
					Employee: req.user,
					Proposals: rows
				});
			});
			
		}
	});

	// process the signup form
	app.post('/newProposal', function(req, res){
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
		res.redirect(302, '/proposal');
	});

	app.get('/editProposal/:id', isLoggedIn, function(req, res) {
		let proposal_ID = req.params.id;
		var query = ("SELECT * FROM ProgramProposal WHERE proposal_ID = ?");
		connection.query(query, proposal_ID, function(err, rows, fields){
			if (err) throw err;

			res.render('editProposal.ejs', {
				Employee: req.user,
				Proposal: rows
			});
		});
	});

	app.post('/deleteProposal/:id', isLoggedIn, function(req, res) {
		var proposal_ID = req.params.id;
		var deleteQuery = ("DELETE FROM ProgramProposal WHERE proposal_ID = ?");
		connection.query(deleteQuery, proposal_ID, function(err, rows) {
			if(err) throw err;
			res.redirect(302, '/proposal');
		});
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
