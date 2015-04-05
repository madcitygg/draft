// MODEL FOR BANS
// MODEL FOR BANS
// MODEL FOR BANS
var DraftModel = function () {
    var rawRegData = {};
    var finishedLoading = ko.observable(false);
    var playerPool = ko.observableArray([]);

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
                    fillPlayerPool(rawRegData);
                    finishedLoading(true);
                },
                simpleSheet: true 
            }
        )
    };

    fetchRegistrationData();

    var playerModel = function (playerData) {
        return {
            id: playerData[SHEET_KEY.time],
            alias: playerData[SHEET_KEY.alias],
            name: playerData[SHEET_KEY.name],
            email: playerData[SHEET_KEY.email],
            skill: playerData[SHEET_KEY.skill]
        };
    };

    var teamModel = function (teamId) {
        return {
            id: teamId,
            name: ko.observable('Team ' + teamId),
            players: ko.observableArray([])
        }
    };

    var fillPlayerPool = function (rawData) {
        var playerList = [];

        if (rawData) {
            var i = rawData.length;

            while (i--) {
                playerList.unshift(playerModel(rawData[i]));
            }
        }

        playerPool(playerList);
    };

    playerPool.subscribe(function (data1, data2) {
        console.log('changed');
        console.log(data1);
        console.log(data2);
    });

    return {
        playerPool: playerPool,
        finishedLoading: finishedLoading,
        team1: teamModel(1),
        team2: teamModel(2),
        team3: teamModel(3),
        team4: teamModel(4),
        team5: teamModel(5),
        team6: teamModel(6),
        team7: teamModel(7),
        team8: teamModel(8)
    }
};

var TheDraftModel = DraftModel();



// VIEW MODEL FOR BANS
// VIEW MODEL FOR BANS
// VIEW MODEL FOR BANS
var DraftViewModel = function () {
    var teamStorageKey = function (team) {
        return 'draft-team' + team.id;
    };

    var storeTeam = function (team) {
        localStorage.setItem(teamStorageKey(team), ko.toJSON(team));
    };

    var recallTeam = function (team) {
        localStorage.setItem(teamStorageKey(team), ko.toJSON(team));
    };


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
        teams: ko.observableArray(allTeams)
    };
};


$(document).ready(function() {
    var Draft = {
        vm: new DraftViewModel()
    };

    ko.applyBindings(Draft.vm);

    // $.getJSON("https://spreadsheets.google.com/feeds/list/1MK6tc6qXIhT7wTar0OFKPwyTN_ESgmnVQ7FKQ66HaoY/ovvwzpc/public/values?alt=json", function(data) {
    //     console.log(data.feed.entry);
    // });

    var onReceive = function (e) {
        var $player = $(e.toElement);
        var $destinationList = $player.parent();
        var teamIndex = parseInt($destinationList.data('teamid')) - 1

        Draft.vm.teams()[teamIndex].players().push($player.text());

        storeTeam(Draft.vm.teams()[teamIndex]);
        console.log(Draft.vm.teams()[teamIndex]);
        
    };

    var teamListSelectors = '.player-pool, .draft-listing-team1, .draft-listing-team2, .draft-listing-team3, .draft-listing-team4, .draft-listing-team5, .draft-listing-team6, .draft-listing-team7, .draft-listing-team8';

    $(teamListSelectors).sortable ({
        connectWith: '.draft-listing',
        receive: function (){ onReceive(event) }
    }).disableSelection();

});





