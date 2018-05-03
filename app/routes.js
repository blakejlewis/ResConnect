// app/routes.js

var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');

var connection = require('../config/database');

module.exports = function(app, passport) {

	//FUNCTIONS FOR INDEX, LOGIN, SIGNUP

	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the homepage
	});

	app.get('/login', function(req, res) {

		res.render('login.ejs', { message: req.flash('loginMessage') }); // loads the login page
	});

	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true
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
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true 
	}));

	//FUNCTIONS FOR PROFILE PAGES AND DATA

	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			Employee: req.user
		});
	});

	app.get('/editProfile', isLoggedIn, function(req, res) {

		//this function loads the edit form for the profile when the profile module is clicked

		var query = "SELECT * FROM Community WHERE communityID = ?";
		var communityID = req.user.communityID;

		connection.query(query, communityID, function(err, rows, fields) {

			res.render('editProfile.ejs', {
				Employee: req.user,
				Community: rows
			});
		});
	});

	app.post('/editProfile', isLoggedIn, function(req, res) {
		// if the user decides to update their profile, then this post function updates the database

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

	//FUNCTION FOR DUTY MODULE

	app.get('/duty', isLoggedIn, function(req, res) {
		res.render('duty.ejs', {
			Employee: req.user
		});
	});

	//FUNCTIONS FOR COMMUNITY MAPPING MODULE PAGES AND DATA

	app.get('/mapping', isLoggedIn, function(req, res) {
		res.render('mapping.ejs', {
			Employee: req.user
		});
	});

	app.get('/newMapping', isLoggedIn, function(req, res) {

		//takes user to the new map page for date input

		res.render('newMapping.ejs', {
			Employee: req.user
		});
	});

	app.post('/newMapping', function(req, res){

		//when the date is entered, it takes the user to the map layout with no data attached to it yet
        var newMapMysql = {
           	caID: req.user.empID,
           	caName: req.user.firstName + " " + req.user.lastName,
            mapDate: req.body.mapDate,
            floorLevel: req.user.floorLevel,
            communityID: req.user.communityID
        };

        var insertQuery = "INSERT INTO CommunityMap ( caID, caName, mapDate, floorLevel, communityID ) VALUES (?,?,?,?,?)";

        connection.query(insertQuery, [newMapMysql.caID, newMapMysql.caName, newMapMysql.mapDate, newMapMysql.floorLevel, newMapMysql.communityID], function(err,rows) {});

		var query = "SELECT * FROM CommunityMap WHERE mapDate = ? AND caID = ?";
		connection.query(query, [newMapMysql.mapDate, newMapMysql.caID], function(err, rows, fields) {
			if (err) throw err;

			res.render('mapLayoutNoData.ejs', {
				Employee: req.user,
				communityMap: rows
			});
		});
	});

	app.get('/viewMapping', isLoggedIn, function(req, res) {

		// this function displays the list of maps. permissions level 1 is CA, so they only see theirs. 2 is pro, and they see their community's
		communityID = req.user.communityID;
		floorLevel = req.user.floorLevel;

		if(req.user.permissionsType == 1) {

			var query = "SELECT * FROM CommunityMap WHERE communityID = ? AND floorLevel = ? ORDER BY mapDate ASC";
			connection.query(query, [communityID, floorLevel], function(err, rows, fields) {
				if (err) throw err;

				res.render('viewMapping.ejs', {
					Employee: req.user,
					Maps: rows
				});
			});
		}
		else if(req.user.permissionsType == 2) {

			var query = "SELECT * FROM CommunityMap WHERE communityID = ? ORDER BY mapDate ASC";
			connection.query(query, communityID, function(err, rows, fields) {
				if (err) throw err;

				res.render('viewMapping.ejs', {
					Employee: req.user,
					Maps: rows
				});
			});
		}
	});

	app.get('/viewMap/:id', isLoggedIn, function(req, res){

		// gets the map that was chosen

		let mapID = req.params.id;

		var query = ("SELECT * FROM CommunityMap WHERE mapID = ?");
		connection.query(query, mapID, function(err, rows, fields){
			if (err) throw err;
			var rows1 = rows;

			var query2 = ("SELECT * FROM CommunityMapData WHERE mapID = ?");
			connection.query(query2, mapID, function(err, rows, fields){
				if(err) throw err;
				var rows2 = rows;

				if(rows2 !== 0){

					res.render('mapLayoutData.ejs', {

						// if there is room data, display that data 
						Employee: req.user,
						communityMap: rows1,
						communityMapData: rows2,
					});
				}
				else{

					res.render('mapLayoutNoData.ejs', {

						// this is for a blank map with no data 

						Employee: req.user,
						communityMap: rows1
					});
				}
			});
		});
	});

	app.post('/deleteMapping/:id', isLoggedIn, function(req, res) {
		// deletes a community map 

		var mapID = req.params.id;

		var deleteQueryMapInfo = ("DELETE FROM CommunityMapData WHERE mapID = ?");
		connection.query(deleteQueryMapInfo, mapID, function(err, rows) {
			if(err) throw err;
		});

		var deleteQueryMap = ("DELETE FROM CommunityMap WHERE mapID = ?");
		connection.query(deleteQueryMap, mapID, function(err, rows) {
			if(err) throw err;
			
			res.redirect(302, '/mapping');
		});
	});

	app.get('/addMapRoom/:mapID/:mapRoom', isLoggedIn, function(req, res) {
		let mapID = req.params.mapID;
		let mapRoom = req.params.mapRoom;

		var query1 = ("SELECT * FROM CommunityMapData WHERE mapID = ? AND mapRoom = ?");
		connection.query(query1, [mapID, mapRoom], function(err, rows, fields){
			var rows1 = rows;

			if (rows == 0){
				var query2 = ("SELECT * FROM CommunityMap WHERE mapID = ?");
				connection.query(query2, mapID, function(err, rows, fields){
					if (err) throw err;
					var rows2 = rows;

					res.render('addMapRoom.ejs', {

						// this displays a form to add data to a room

						Employee: req.user,
						mapRoom: mapRoom,
						communityMap: rows2
					});
				});

			}
			else {
				var query2 = ("SELECT * FROM CommunityMap WHERE mapID = ?");
				connection.query(query2, mapID, function(err, rows, fields){
				if(err) throw err;
				var rows2 = rows;

					res.render('viewMapRoom.ejs', {

						// this displays the room's full data if there is data attached to the room clicked

						Employee: req.user,
						mapRoom: mapRoom,
						communityMapData: rows1,
						communityMap: rows2
					});
				});
			}
		});
	});

	app.post('/addMapRoom/:mapID/:mapRoom', function(req, res) {

		// adds map room data to the database and takes the user back to the map layout with the updated data

		let mapID = req.params.mapID;
		let mapRoom = req.params.mapRoom;

		var newMapRoomMysql = {
           	roomNumber: req.body.roomNumber,
            resident1: req.body.resident1,
            resident2: req.body.resident2,
            roomColorID: req.body.roomColorID,
            leaderInRoom: req.body.leaderInRoom,
            visitMost: req.body.visitMost,
            notSeen: req.body.notSeen,
            factsAndInteractions: req.body.factsAndInteractions
        };

        var insertQuery = "INSERT INTO CommunityMapData ( roomNumber, mapID, mapRoom, resident1, resident2, roomColorID, leaderInRoom, visitMost, notSeen, factsAndInteractions ) VALUES (?,?,?,?,?,?,?,?,?,?)";

        connection.query(insertQuery, [newMapRoomMysql.roomNumber, mapID, mapRoom, newMapRoomMysql.resident1, newMapRoomMysql.resident2, newMapRoomMysql.roomColorID, newMapRoomMysql.leaderInRoom, newMapRoomMysql.visitMost, newMapRoomMysql.notSeen, newMapRoomMysql.factsAndInteractions], function(err,rows) {
        	if(err) throw err;

        	res.redirect(302, '/viewMap/' + mapID);
        });
	});

	//FUNCTIONS FOR ROOMMATE AGREEMENT MODULE PAGES AND DATA

	app.get('/agreement', isLoggedIn, function(req, res) {

		// roommate management module

		res.render('agreement.ejs', {
			Employee: req.user
		});
	});

	app.get('/newAgreement', isLoggedIn, function(req, res) {
		res.render('newAgreement.ejs', {
			// renders the agreement form

			Employee: req.user
		});
	});

	app.post('/newAgreement', function(req, res){
		// add new roommate agreement to the database

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
		// displays list of agreements. 1 sees they're own agreements, and 2 sees their community agreements. they are CA's and professionals, respectively.

		communityID = req.user.communityID;
		floorLevel = req.user.floorLevel;

		if(req.user.permissionsType == 1) {

			var query = "SELECT * FROM RoommateAgreement WHERE (communityID = ? AND floorLevel = ?) ORDER BY roomNumber ASC";
			connection.query(query, [communityID, floorLevel], function(err, rows, fields) {
			if (err) throw err;

				res.render('viewAgreement.ejs', {
					Employee: req.user,
					Agreements: rows
				});
			});
		}
		else if(req.user.permissionsType == 2) {

			var query = "SELECT * FROM RoommateAgreement WHERE (communityID = ?) ORDER BY roomNumber ASC";
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
		// gets the edit agreement form with all agreement data filled in

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
		//posts the updated agreement

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

		// deletes a roommate agreement

		var agreementID = req.params.id;
		var deleteQuery = ("DELETE FROM RoommateAgreement WHERE agreementID = ?");
		connection.query(deleteQuery, agreementID, function(err, rows) {
			if(err) throw err;
			res.redirect(302, '/agreement');
		});
	});

	//FUNCTIONS FOR CLP UPLOADING AND ACCESS

	app.post('/uploadCLP', isLoggedIn, function(req, res) {
		// supervisor uploads the CLP for CA access

		var communityID = req.user.communityID;

		console.log(req.files);

		var clpFile = req.files.clpFile;
		var clpName = communityID + "_CLP.pdf";
	
		clpFile.mv('public/files/CLPs/' + clpName, function(err) {
			if(err)
				return console.log(err);
		});

		var updateQuery = ("UPDATE Community SET clpFile = ? WHERE communityID = ?");
		connection.query(updateQuery, [clpName, communityID], function(err, rows) {
			if(err) throw err;
			res.redirect(302, '/proposal');
		});
	});

	app.post('/deleteCLP/:id', isLoggedIn, function(req, res) {
		// supervisor removes CLP to replace it

		var communityID = req.params.id;
		var updateQuery = ("UPDATE Community SET clpFile = NULL WHERE communityID = ?");
		connection.query(updateQuery, communityID, function(err, rows) {
			if(err) throw err;
		});

		fs.unlink('public/files/CLPs/' + communityID + '_CLP.pdf', (err) => {
			if(err) throw err;
		});

		res.redirect(302, '/proposal');

	});

	//FUNCTIONS FOR PROGRAM PROPOSAL MODULE PAGES AND DATA

	app.get('/proposal', isLoggedIn, function(req, res) {
		//gets the proposal module, a list of proposals for level 2, and a proposal form for level 1.

		communityID = req.user.communityID;

		if(req.user.permissionsType == 1) {

			var query = "SELECT * FROM Community WHERE communityID = ?";
			connection.query(query, communityID, function(err, rows, fields) {
				if (err) throw err;

				res.render('newProposal.ejs', { 
					Employee: req.user,
					Community: rows
		 		});
			});
	
		}
		else if(req.user.permissionsType == 2){

			var query1 = "SELECT * FROM ProgramProposal WHERE communityID = ?";
			connection.query(query1, communityID, function(err, rows, fields) {
				if (err) throw err;
				rows1 = rows;

				var query2 = "SELECT * FROM Community WHERE communityID = ?";
				connection.query(query2, communityID, function(err, rows, fields) {
					if (err) throw err;
					rows2 = rows;

					res.render('viewProposals.ejs', {
						Employee: req.user,
						Proposals: rows1,
						Community: rows2
					});
				});
			});
		}
	});

	app.post('/newProposal', function(req, res){
		// adds a new program proposal to the database. uploads a PRA if uploaded

        var newProgramProposalMysql = {
           	communityID: req.user.communityID,
            programProposer: (req.user.firstName + " " + req.user.lastName),
            eventName: req.body.eventName,
            eventDateTime: req.body.eventDateTime,
            eventLocation: req.body.eventLocation,
            eventDescription: req.body.eventDescription,
            learningOutcome: req.body.learningOutcome
        };

        var insertQuery = "INSERT INTO ProgramProposal ( communityID, programProposer, eventName, eventDateTime, eventLocation, eventDescription, learningOutcome) VALUES (?,?,?,?,?,?,?)";

        connection.query(insertQuery, [newProgramProposalMysql.communityID, newProgramProposalMysql.programProposer, newProgramProposalMysql.eventName, newProgramProposalMysql.eventDateTime, newProgramProposalMysql.eventLocation, newProgramProposalMysql.eventDescription, newProgramProposalMysql.learningOutcome], function(err,rows) {
        	if(err)
        		console.log(err);
        });

        if(req.files.eventPRA !== undefined){

	        var selectQuery = "SELECT * FROM ProgramProposal WHERE eventName = ? AND communityID = ?";
	        connection.query(selectQuery, [newProgramProposalMysql.eventName, newProgramProposalMysql.communityID], function(err, rows) {
	        	if(err)
	        		console.log(err);

	        	var eventPRA = req.files.eventPRA;
	  
				var praName = rows[0].proposal_ID + "_PRA.xlsx";
				
				eventPRA.mv('public/files/PRAs/' + praName, function(err) {
					if(err)
						return console.log(err);
				});

				var updateQuery = ("UPDATE ProgramProposal SET eventPRA = ? WHERE proposal_ID = ?");
				connection.query(updateQuery, [praName, rows[0].proposal_ID], function(err, rows) {
					if(err)
						console.log(err);

					res.redirect(302, '/proposal');
				});
	        });
    	}
    	else{
    		res.redirect(302, '/proposal');
    	}
	});

	app.get('/editProposal/:id', isLoggedIn, function(req, res) {
		//gets the proposal information with the data filled in

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

		// deletes a program proposal

		var proposal_ID = req.params.id;

		fs.unlink('public/files/PRAs/' + proposal_ID + '_PRA.xlsx', (err) => {
			if(err) throw err;
		});

		var deleteQuery = ("DELETE FROM ProgramProposal WHERE proposal_ID = ?");
		connection.query(deleteQuery, proposal_ID, function(err, rows) {
			if(err) throw err;
			res.redirect(302, '/proposal');
		});
	});

	//FUNCTION FOR LEADERSHIP MODULE

	app.get('/leadership', isLoggedIn, function(req, res) {

		// gets the leadership module

		res.render('leadership.ejs', {
			Employee: req.user
		});
	});

	//FUNCTION FOR LOGOUT

	app.get('/logout', function(req, res) {
		// logs user out

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