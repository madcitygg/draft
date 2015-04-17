var Storage = {
    POOL_KEY: 'csgochi-draft-pool',

    teamStorageKey: function (team) {
        return 'csgochi-draft-team' + team.id;
    },

    storePool: function (poolList) {
        localStorage.setItem(this.POOL_KEY, ko.toJSON(poolList));
    },

    recallPool: function () {
        return JSON.parse(localStorage.getItem(this.POOL_KEY));
    },

    storeTeam: function (team) {
        localStorage.setItem(teamStorageKey(team), ko.toJSON(team));
    },

    recallTeam: function (team) {
        return localStorage.getItem(teamStorageKey(team));
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

    var teamModel = function (teamId) {
        return {
            id: teamId,
            name: ko.observable('Team ' + teamId),
            players: ko.observableArray([])
        }
    };

    var movePlayerToTeam = function (player, teamId) {
        var currentTeam = teamModels()[teamId-1];
        currentTeam.players.push(player);
        Storage.storeTeam(currentTeam);
        playerPool.remove(player);
    };

    var assignPlayersToTeams = function () {
        var i = playerPool().length;
        var currentPlayer = null;
        var currentPlayerTeamId = -1;

        while (i--) {
            currentPlayer = playerPool()[i];
            currentPlayerTeamId = currentPlayer.teamId || -1;

            // had team assignment already, move to team and remove from pool
            if (currentPlayerTeamId !== -1) {
                movePlayerToTeam(currentPlayer, currentPlayerTeamId);
            }
        }
    };

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
            teamModels.unshift(teamModel(i+1))
        }

        if (ko.toJSON(playerList) !== JSON.stringify(Storage.recallPool()) ) {
            console.log('theyre not the same');
            Storage.storePool(playerList);
        }
    };

    return {
        playerPool: playerPool,
        finishedLoading: finishedLoading,
        teamModels: teamModels
    };
};

var TheDraftModel = DraftModel();



// VIEW MODEL FOR BANS
// VIEW MODEL FOR BANS
// VIEW MODEL FOR BANS
var DraftViewModel = function () {
    var allTeams = [
        TheDraftModel.team1,
        TheDraftModel.team2,
        TheDraftModel.team3,
        TheDraftModel.team4,
        TheDraftModel.team5,
        TheDraftModel.team6,
        TheDraftModel.team7,
        TheDraftModel.team8
    ];

    return {
        finishedLoading: TheDraftModel.finishedLoading,
        playerPool: TheDraftModel.playerPool,
        teams: TheDraftModel.teamModels
    };
};


$(document).ready(function() {
    var Draft = {
        vm: new DraftViewModel()
    };

    ko.applyBindings(Draft.vm);

    var onReceive = function (e) {
        var $player = $(e.toElement);
        var $destinationList = $player.parent();
        var teamIndex = parseInt($destinationList.data('teamid')) - 1;

        Draft.vm.teams()[teamIndex].players().push($player.text());

        Storage.storeTeam(Draft.vm.teams()[teamIndex]);
        console.log(Draft.vm.teams()[teamIndex]);
        
    };

    var teamListSelectors = '.player-pool, .draft-listing-team1, .draft-listing-team2, .draft-listing-team3, .draft-listing-team4, .draft-listing-team5, .draft-listing-team6, .draft-listing-team7, .draft-listing-team8';

    $(teamListSelectors).sortable ({
        connectWith: '.draft-listing',
        receive: function (){ onReceive(event) }
    }).disableSelection();

});





