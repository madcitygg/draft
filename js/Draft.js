// MODEL FOR BANS
// MODEL FOR BANS
// MODEL FOR BANS
var DraftModel = function () {
    var teamModel = function (teamId) {
        return {
            id: teamId,
            name: ko.observable('Team ' + teamId),
            players: ko.observableArray([])
        }
    }

    var playerPool = ko.observableArray([
        "Dad", "Mom", "Jason", "n0thing", "Boyer's penis",
        "sister", "rent", "Sources", "Dennis", "Walgreens",
        "Theresa", "Superfuckinglongnamewhatadick", "siblings", "And", "golden",
        "literally", "Mom", "CHARLOTTE", "parents", "fuckups",
        "Metcalfe", "grandfather", "tree", "confirmed", "wat"
    ]);

    return {
        playerPool: playerPool,
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
        playerPool: TheDraftModel.playerPool,
        teams: ko.observableArray(allTeams)
    };
};


$(document).ready(function() {
    var Draft = {
        vm: new DraftViewModel()
    };

    ko.applyBindings(Draft.vm);

    $.getJSON("https://spreadsheets.google.com/feeds/list/1icgIwr1-8bIV0KA5sYNTNKcx_Jnr4O5IancV48Hlul8/ovvwzpc/public/values?alt=json", function(data) {
        console.log(data.feed.entry);
    });

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




