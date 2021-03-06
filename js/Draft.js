var Storage = {
    SHEET_KEY: 'csgochi-draft-sheetcode',
    POOL_KEY:  'csgochi-draft-pool',
    CACHE_KEY: 'csgochi-draft-cache',

    recallSheetCode: function () {
        if (localStorage.getItem(this.SHEET_KEY) === null) {
            return false;
        }

        return localStorage.getItem(this.SHEET_KEY);
    },

    storeSheetCode: function (code) {
        localStorage.setItem(this.SHEET_KEY, code);
    },

    storeCache: function (poolList) {
        localStorage.setItem(this.CACHE_KEY, ko.toJSON(poolList));
    },

    recallCache: function (poolList) {
        return JSON.parse(localStorage.getItem(this.CACHE_KEY));
    },

    storePool: function (poolList) {
        localStorage.setItem(this.POOL_KEY, ko.toJSON(poolList));
    },

    recallPool: function () {
        return ko.observable(JSON.parse(localStorage.getItem(this.POOL_KEY)));
    },

    teamStorageKey: function (team) {
        return 'csgochi-draft-team' + team.id;
    },

    storeTeam: function (team) {
        localStorage.setItem(this.teamStorageKey(team), ko.toJSON(team));
    },

    recallTeam: function (team) {
        return JSON.parse(localStorage.getItem(this.teamStorageKey(team)));
    }
}

// MODEL FOR BANS
// MODEL FOR BANS
// MODEL FOR BANS
var DraftModel = function () {
    var rawRegData = {};
    var sheetCode = ko.observable(''); // Bootcamp 4 code: 17ezRCt8Gw7ukF9HegQgg3k-4f96FE9xCiVuYAl0Hc7w
    var finishedLoading = ko.observable(false);
    var playerPool = ko.observableArray([]);
    var teamModels = ko.observableArray([]);

    // var stubNames = [
    //     "Dad", "Mom", "Jason", "n0thing", "Boyer's penis",
    //     "sister", "rent", "Sources", "Dennis", "Walgreens",
    //     "Theresa", "Superfuckinglongnamewhatadick", "siblings", "And", "golden",
    //     "literally", "Mom", "CHARLOTTE", "parents", "fuckups",
    //     "Metcalfe", "grandfather", "tree", "confirmed", "wat"
    // ];

    var SHEET_COLUMN_KEYS = {
        time: "Timestamp",
        name: "Real name",
        alias: "In-game name",
        email: "Email",
        skill: "Skill level"
    }

    var fetchRegistrationData = function () {

        if (Storage.recallSheetCode()) {
            // have code in storage, store it
            sheetCode(Storage.recallSheetCode())
            Storage.storeSheetCode(Storage.recallSheetCode());

            // pull data from sheet
            Tabletop.init(
            {
                key: '' + Storage.recallSheetCode(),
                callback: function(data, tabletop) {
                    console.log(data);
                    rawRegData = data;
                    fillPlayersAndTeams(rawRegData);
                    finishedLoading(true);
                },
                simpleSheet: true 
                }
            );
        } else {
            // no code on hand, dont load anything

        }
    };

    fetchRegistrationData();

    var playerModel = function (playerData) {
        var teamId = -1;

        var undraft = function (data) {
            var currentTeam = teamModels()[data.teamId()-1];
            var playerTeamIndex = currentTeam.players.indexOf(data);
            
            currentTeam.players.splice(playerTeamIndex, 1);
            data.teamId(-1);
            playerPool.push(data);

            Storage.storePool(playerPool);
            Storage.storeTeam(currentTeam);
        };

        return {
            email: playerData[SHEET_COLUMN_KEYS.email],
            alias: playerData[SHEET_COLUMN_KEYS.alias],
            name: playerData[SHEET_COLUMN_KEYS.name],
            skill: playerData[SHEET_COLUMN_KEYS.skill],
            regTime: playerData[SHEET_COLUMN_KEYS.time],
            teamId: ko.observable(teamId),
            undraft: undraft
        };
    };

    var findPlayerByEmail = function (listToSearch, email) {
        var i = listToSearch().length;
        while (i--) {
            if (listToSearch()[i].email === email) {
                return listToSearch()[i];
            }
        }
    };

    var teamModel = function (teamId) {
        return {
            id: teamId,
            name: ko.observable('Team ' + teamId),
            players: ko.observableArray([])
        }
    };

    var movePlayerToTeam = function (player, teamId) {
        var currentPlayer = player;
        var currentPlayerPoolIndex = playerPool.indexOf(currentPlayer);
        var currentTeam = teamModels()[teamId-1];

        currentPlayer.teamId(teamId);
        currentTeam.players.push(currentPlayer);
        playerPool()[currentPlayerPoolIndex] = currentPlayer;

        Storage.storePool(playerPool);
        Storage.storeTeam(currentTeam);
    };

    var assignPlayerToSavedTeam = function () {
        var i = playerPool().length;
        var currentPlayer = null;
        var currentPlayerTeamId = -1;

        var storedPool = Storage.recallPool();
        var currentPlayerFromStorage = null;
        
        while (i--) {
            currentPlayer = playerPool()[i];
            currentPlayerFromStorage = findPlayerByEmail(storedPool, currentPlayer.email);
            currentPlayerTeamId = currentPlayerFromStorage.teamId;

            // had team assignment already, move to team and remove from pool
            if (currentPlayerTeamId !== -1) {
                movePlayerToTeam(currentPlayer, currentPlayerTeamId);
            }
        }
    };

    // if first time running, make keys in storage
    if (Storage.recallCache() === null) {
        Storage.storeCache({});
    }

    if (Storage.recallPool()() === null) {
        Storage.storePool({});
    }

    // populate player data after fetch from Google
    var fillPlayersAndTeams = function (rawData) {
        var playerList = [];

        if (rawData) {
            var i = rawData.length;

            while (i--) {
                playerList.unshift(playerModel(rawData[i]));
            }
        }

        playerPool(playerList);

        var i = 8;

        while (i--) {
            var newTeam = teamModel(i+1);
            var recalledTeam = Storage.recallTeam(newTeam);
            teamModels.unshift(newTeam);
            console.log('saved team was !', Storage.recallTeam(newTeam));
            if (recalledTeam !== null) {
                newTeam.name(recalledTeam.name);
            }
        }

        // new players since last load? if so, overwrite saved player lists
        if (playerList.length !== Storage.recallCache().length) {
            Storage.storeCache(playerList);
            Storage.storePool(playerList);
        }

        assignPlayerToSavedTeam();

    };

    return {
        sheetCode: sheetCode,
        playerPool: playerPool,
        finishedLoading: finishedLoading,
        teamModels: teamModels,
        movePlayerToTeam: movePlayerToTeam,
        findPlayerByEmail: findPlayerByEmail
    };
};



// VIEW MODEL FOR BANS
// VIEW MODEL FOR BANS
// VIEW MODEL FOR BANS
var DraftViewModel = function () {
    var TheDraftModel = DraftModel();

    var teams = TheDraftModel.teamModels;

    var saveTeamName = function (team) {
        Storage.storeTeam(team);
    };

    var codeEntered = function (data, e) {
        var codeString = $(e.target).val();
        if (codeString.length > 0) {
            TheDraftModel.sheetCode(codeString);
            Storage.storeSheetCode(codeString)

            location.reload();
        }
    };

    var clearAllData = function (data, e) {
        var really = window.confirm("Really clear all data?  You can't undo this.");

        if (really === true) {
            Storage.storeCache('');
            Storage.storeSheetCode('');
            Storage.storePool('');

            // make this into a loop when you decide not to be a pleb
            Storage.storeTeam({ id: 1 });
            Storage.storeTeam({ id: 2 });
            Storage.storeTeam({ id: 3 });
            Storage.storeTeam({ id: 4 });
            Storage.storeTeam({ id: 5 });
            Storage.storeTeam({ id: 6 });
            Storage.storeTeam({ id: 7 });
            Storage.storeTeam({ id: 8 });

            location.reload();
        }
    };

    return {
        sheetCode: TheDraftModel.sheetCode,
        findPlayerByEmail: TheDraftModel.findPlayerByEmail,
        finishedLoading: TheDraftModel.finishedLoading,
        playerPool: TheDraftModel.playerPool,
        teams: teams,
        movePlayerToTeam: TheDraftModel.movePlayerToTeam,
        findPlayerByEmail: TheDraftModel.findPlayerByEmail,
        saveTeamName: saveTeamName,
        codeEntered: codeEntered,
        clearAllData: clearAllData
    };
};


$(document).ready(function() {
    var Draft = {
        vm: new DraftViewModel()
    };

    ko.applyBindings(Draft.vm);

    var onPlayerDrop = function (e) {
        var $player = $(e.toElement);
        var playerEmail = $player.data('playerdata').email;
        var playerData = Draft.vm.findPlayerByEmail(Draft.vm.playerPool, playerEmail);
        var $destinationList = $player.parent();
        var desinationTeamId = parseInt($destinationList.data('teamid'));

        Draft.vm.movePlayerToTeam(playerData, desinationTeamId);
        $player.remove();
    };

    var teamListSelectors = '.player-pool, .draft-listing-team1, .draft-listing-team2, .draft-listing-team3, .draft-listing-team4, .draft-listing-team5, .draft-listing-team6, .draft-listing-team7, .draft-listing-team8';

    Draft.vm.finishedLoading.subscribe(function (newVal) {
        if (newVal === true) {
            $(teamListSelectors).sortable ({
                connectWith: '.draft-listing',
                receive: function (){ onPlayerDrop(event) }
            }).disableSelection();
        }

    });

});




