import { LightningElement } from 'lwc';
import { getData } from 'utils/fetchUtils';

const eventSource = new EventSource('/api/gameUpdatesStream');

export default class GamePlay extends LightningElement {
    gameValidationInProgress = true;
    gameValidated = false;

    gameKey;
    gameId;
    gameStatus;
    playerId;

    showTimer = false;
    timerDuration;

    get showBacklogItems() {
        return this.gameStatus === 'In Progress' && this.playerId
            ? true
            : false;
    }

    connectedCallback() {
        // eslint-disable-next-line no-restricted-globals
        this.gameKey = location.pathname.replace('/play/', '');
        getData('/api/validateGameKey', { gameKey: this.gameKey })
            .then((data) => {
                this.template.querySelector('utils-spinner').hide();
                this.gameValidationInProgress = false;
                if (data) {
                    this.gameValidated = true;
                    this.gameId = data.Id;
                    this.gameStatus = data.Phase__c;
                    this.showTimer = data.Show_Timer__c;
                    this.timerDuration = data.Timer_Duration__c;
                    let playerId = sessionStorage.getItem(
                        'playerId_' + this.gameId
                    );
                    if (playerId) {
                        this.playerId = playerId;
                        let playerName = sessionStorage.getItem(
                            'playerName_' + this.gameId
                        );
                        this.sendPlayerNameToHeader(playerName);
                    }
                }
            })
            .catch((error) => {
                this.gameValidationInProgress = false;
                console.error(error);
            });

        // Handler for events of type 'eventType' only
        eventSource.addEventListener('NewPlayerResponse', (event) => {
            let data = JSON.parse(event.data);
            let payload = data.sobject;
            if (payload.Game__c === this.gameId) {
                let storedReplayId = sessionStorage.getItem(
                    'replayId_NewPlayerResponse_' + this.gameId
                );
                if (!storedReplayId || data.event.replayId > storedReplayId) {
                    sessionStorage.setItem(
                        'replayId_NewPlayerResponse_' + this.gameId,
                        data.event.replayId
                    );
                    this.template
                        .querySelector('ui-backlog-items-for-review')
                        .updateVote(payload);
                }
            }
        });

        // Handler for events of type 'eventType' only
        eventSource.addEventListener('GameStateChange', (event) => {
            let data = JSON.parse(event.data);
            let payload = data.payload;
            if (payload.GameID__c === this.gameId) {
                if (payload.Type__c === 'GamePhaseChange') {
                    let storedReplayId = sessionStorage.getItem(
                        'replayId_' + payload.Type__c + '_' + this.gameId
                    );
                    if (
                        !storedReplayId ||
                        data.event.replayId > storedReplayId
                    ) {
                        sessionStorage.setItem(
                            'replayId_' + payload.Type__c + '_' + this.gameId,
                            data.event.replayId
                        );
                        this.gameStatus = payload.Data__c;
                        if (this.gameStatus === 'Completed') {
                            window.location.href = '/';
                        }
                    }
                } else if (payload.Type__c === 'StoryChange') {
                    let storedReplayId = sessionStorage.getItem(
                        'replayId_' + payload.Type__c + '_' + this.gameId
                    );
                    if (
                        !storedReplayId ||
                        data.event.replayId > storedReplayId
                    ) {
                        sessionStorage.setItem(
                            'replayId_' + payload.Type__c + '_' + this.gameId,
                            data.event.replayId
                        );
                        this.template
                            .querySelector('ui-backlog-items-for-review')
                            .getUnvotedItem();
                    }
                } else if (payload.Type__c === 'CardFlip') {
                    let storedReplayId = sessionStorage.getItem(
                        'replayId_' + payload.Type__c + '_' + this.gameId
                    );
                    if (
                        !storedReplayId ||
                        data.event.replayId > storedReplayId
                    ) {
                        sessionStorage.setItem(
                            'replayId_' + payload.Type__c + '_' + this.gameId,
                            data.event.replayId
                        );
                        this.template
                            .querySelector('ui-backlog-items-for-review')
                            .flipCards(payload.Data__c);
                    }
                } else if (payload.Type__c === 'ResetCards') {
                    let storedReplayId = sessionStorage.getItem(
                        'replayId_' + payload.Type__c + '_' + this.gameId
                    );
                    if (
                        !storedReplayId ||
                        data.event.replayId > storedReplayId
                    ) {
                        sessionStorage.setItem(
                            'replayId_' + payload.Type__c + '_' + this.gameId,
                            data.event.replayId
                        );
                        this.template
                            .querySelector('ui-backlog-items-for-review')
                            .resetCards();
                    }
                }
            }
        });
    }

    disconnectedCallback() {
        eventSource.close();
    }

    handlePlayerCreation(event) {
        this.playerId = event.detail.playerId;
        this.sendPlayerNameToHeader(event.detail.playerName);
    }

    sendPlayerNameToHeader(playerName) {
        const event = new CustomEvent('updateplayername', {
            detail: { playerName }
        });
        this.dispatchEvent(event);
    }
}
