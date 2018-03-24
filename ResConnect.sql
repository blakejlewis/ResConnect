-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2018-03-08 01:31:41.628

-- tables
-- Table: Community
CREATE TABLE Community (
    communityID varchar(100) NOT NULL,
    communityName varchar(100) NOT NULL,
    communityType char(1) NOT NULL,
    clpFile varchar(100) NOT NULL,
    numStaff int NOT NULL,
    supervisorID int NOT NULL,
    numFloors int NOT NULL,
    floorWidth int NOT NULL,
    floorLength int NOT NULL,
    CONSTRAINT Community_pk PRIMARY KEY (communityID)
);

-- Table: CommunityMap
CREATE TABLE CommunityMap (
    mapID int NOT NULL AUTO_INCREMENT,
    caID int NOT NULL,
    mapDate date NOT NULL,
    floorLevel int NOT NULL,
    communityID varchar(100) NOT NULL,
    CONSTRAINT CommunityMap_pk PRIMARY KEY (mapID)
);

-- Table: CommunityMapData
CREATE TABLE CommunityMapData (
    roomNumber int NOT NULL,
    mapID int NOT NULL,
    resident1 varchar(100) NOT NULL,
    resident2 varchar(100) NOT NULL,
    resident3 varchar(100) NULL,
    resident4 varchar(100) NULL,
    roomColorID char(1) NOT NULL,
    leaderInRoom bool NOT NULL,
    visitMost bool NOT NULL,
    notSeen bool NOT NULL,
    roomConnectedWith int NULL,
    roomConnectedWith2 int NULL,
    factsAndInteractions varchar(100) NOT NULL,
    CONSTRAINT CommunityMapData_pk PRIMARY KEY (roomNumber)
);

-- Table: Employee
CREATE TABLE Employee (
    empID int NOT NULL,
    webID varchar(100) NOT NULL,
    password varchar(100) NOT NULL,
    firstName varchar(100) NOT NULL,
    lastName varchar(100) NOT NULL,
    birthday date NOT NULL,
    permissionsType char(1) NOT NULL,
    communityID varchar(100) NOT NULL,
    floorLevel int NOT NULL,
    CONSTRAINT Employee_pk PRIMARY KEY (empID)
);

-- Table: ProgramProposal
CREATE TABLE ProgramProposal (
    proposal_ID int NOT NULL AUTO_INCREMENT,
    communityID varchar(100) NOT NULL,
    programProposer varchar(100) NOT NULL,
    eventName varchar(100) NOT NULL,
    eventDateTime timestamp NULL,
    eventLocation varchar(100) NOT NULL,
    eventDescription varchar(100) NOT NULL,
    learningOutcome varchar(100) NOT NULL,
    eventPRA varchar(100) NULL,
    CONSTRAINT ProgramProposal_pk PRIMARY KEY (proposal_ID)
);
 
-- Table: RoommateAgreement
CREATE TABLE RoommateAgreement (
    agreementID int NOT NULL AUTO_INCREMENT,
    communityID varchar(100) NOT NULL,
    caID int NOT NULL,
    roomNumber int NOT NULL,
    roommate1 varchar(100) NOT NULL,
    roommate2 varchar(100) NOT NULL,
    stressor1 varchar(100) NOT NULL,
    stressManagement1 varchar(100) NOT NULL,
    stressHelp1 varchar(100) NOT NULL,
    communicationVia1 varchar(100) NOT NULL,
    stressor2 varchar(100) NOT NULL,
    stressManagement2 varchar(100) NOT NULL,
    stressHelp2 varchar(100) NOT NULL,
    communicationVia2 varchar(100) NOT NULL,
    studyTime char(1) NOT NULL,
    studyActivities varchar(100) NOT NULL,
    studyAdjustments bool NOT NULL,
    weekdaySleeptime time NOT NULL,
    weekendSleeptime time NOT NULL,
    sleepActivities varchar(100) NOT NULL,
    cleanTasks1 varchar(100) NOT NULL,
    cleanFrequency1 varchar(100) NOT NULL,
    cleanTasks2 varchar(100) NOT NULL,
    cleanFrequency2 varchar(100) NOT NULL,
    belongingPermission varchar(100) NOT NULL,
    sharedElectronics varchar(100) NOT NULL,
    sharedClothes varchar(100) NOT NULL,
    sharedFood varchar(100) NOT NULL,
    sharedHousehold varchar(100) NOT NULL,
    sharedOther varchar(100) NOT NULL,
    whileAway varchar(100) NOT NULL,
    respectPrivacy varchar(100) NOT NULL,
    roommate1Habits varchar(100) NOT NULL,
    roommate1PetPeeves varchar(100) NOT NULL,
    roommate2Habits varchar(100) NOT NULL,
    roommate2PetPeeves varchar(100) NOT NULL,
    guestPermission varchar(100) NOT NULL,
    guestPrivacy varchar(100) NOT NULL,
    whenLocked char(2) NOT NULL,
    alcoholDrugs bool NOT NULL,
    temperature varchar(100) NOT NULL,
    damage varchar(100) NOT NULL,
    roommate1Signature varchar(100) NOT NULL,
    roommate2Signature varchar(100) NOT NULL,
    CONSTRAINT RoommateAgreement_pk PRIMARY KEY (agreementID)
);

-- foreign keys
-- Reference: CommunityMapData_CommunityMap (table: CommunityMapData)
ALTER TABLE CommunityMapData ADD CONSTRAINT CommunityMapData_CommunityMap FOREIGN KEY CommunityMapData_CommunityMap (mapID)
    REFERENCES CommunityMap (mapID);

-- Reference: CommunityMap_Community (table: CommunityMap)
ALTER TABLE CommunityMap ADD CONSTRAINT CommunityMap_Community FOREIGN KEY CommunityMap_Community (communityID)
    REFERENCES Community (communityID);

-- Reference: CommunityMap_Employee (table: CommunityMap)
ALTER TABLE CommunityMap ADD CONSTRAINT CommunityMap_Employee FOREIGN KEY CommunityMap_Employee (caID)
    REFERENCES Employee (empID);

-- Reference: Community_Employee (table: Employee)
ALTER TABLE Employee ADD CONSTRAINT Community_Employee FOREIGN KEY Community_Employee (communityID)
    REFERENCES Community (communityID);

-- Reference: ProgramProposal_Community (table: ProgramProposal)
ALTER TABLE ProgramProposal ADD CONSTRAINT ProgramProposal_Community FOREIGN KEY ProgramProposal_Community (communityID)
    REFERENCES Community (communityID);

-- Reference: RoommateAgreement_Community (table: RoommateAgreement)
ALTER TABLE RoommateAgreement ADD CONSTRAINT RoommateAgreement_Community FOREIGN KEY RoommateAgreement_Community (communityID)
    REFERENCES Community (communityID);

-- Reference: RoommateAgreement_Employee (table: RoommateAgreement)
ALTER TABLE RoommateAgreement ADD CONSTRAINT RoommateAgreement_Employee FOREIGN KEY RoommateAgreement_Employee (caID)
    REFERENCES Employee (empID);

-- End of file.

