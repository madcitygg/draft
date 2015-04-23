var Storage = {
    POOL_KEY:  'csgochi-draft-pool',
    CACHE_KEY: 'csgochi-draft-cache',

    teamStorageKey: function (team) {
        return 'csgochi-draft-team' + team.id;
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
        return JSON.parse(localStorage.getItem(this.POOL_KEY));
    },

    storeTeam: function (team) {
        localStorage.setItem(this.teamStorageKey(team), ko.toJSON(team));
    },

    recallTeam: function (team) {
        return localStorage.getItem(this.teamStorageKey(team));
    }
}

// MODEL FOR BANS
// MODEL FOR BANS
// MODEL FOR BANS
var DraftModel = function () {
    var rawRegData = {};
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

    var SHEET_KEY = {
        time: "Timestamp",
        name: "Real name",
        alias: "In-game name",
        email: "Email",
        skill: "Skill level"
    }

    var fetchRegistrationData = function () {
        Tabletop.init(
            {
                key: '1MK6tc6qXIhT7wTar0OFKPwyTN_ESgmnVQ7FKQ66HaoY',
                callback: function(data, tabletop) {
                    rawRegData = data;
                    fillPlayersAndTeams(rawRegData);
                    finishedLoading(true);
                },
                simpleSheet: true 
            }
        )
    };

    fetchRegistrationData();

    var playerModel = function (playerData) {
        var teamId = -1;

        var playerWasDrafted = function () {
            // console.log(playerData);
        };

        return {
            email: playerData[SHEET_KEY.email],
            alias: playerData[SHEET_KEY.alias],
            name: playerData[SHEET_KEY.name],
            skill: playerData[SHEET_KEY.skill],
            regTime: playerData[SHEET_KEY.time],
            teamId: ko.observable(teamId)
        };
    };

    var findPlayerByEmail = function (email) {
        var i = playerPool().length;
        while (i--) {
            if (playerPool()[i].email === email) {
                return playerPool()[i];
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

    var assignPlayersToTeams = function () {
        var i = playerPool().length;
        var currentPlayer = null;
        var currentPlayerTeamId = -1;

        while (i--) {
            currentPlayer = playerPool()[i];

            console.log('currentPlayer team', currentPlayer.teamId());
            currentPlayerTeamId = currentPlayer.teamId();

            // console.log('currentPlayer.teamId', currentPlayerTeamId);

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

    if (Storage.recallPool() === null) {
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

        assignPlayersToTeams();

        var i = 8;

        while (i--) {
            teamModels.unshift(teamModel(i+1))
        }

        console.log('playerList has this many players', playerList.length);
        console.log('localStorage has this many players', Storage.recallCache().length);

        // new players since last load? if so, overwrite saved player lists
        if (playerList.length !== Storage.recallCache().length) {
            Storage.storeCache(playerList);
            Storage.storePool(playerList);
        }

    };

    return {
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

    return {
        findPlayerByEmail: TheDraftModel.findPlayerByEmail,
        finishedLoading: TheDraftModel.finishedLoading,
        playerPool: TheDraftModel.playerPool,
        teams: TheDraftModel.teamModels,
        movePlayerToTeam: TheDraftModel.movePlayerToTeam,
        findPlayerByEmail: TheDraftModel.findPlayerByEmail
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
        var playerData = Draft.vm.findPlayerByEmail(playerEmail);
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





