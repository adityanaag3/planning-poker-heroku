/* eslint-disable @lwc/lwc/no-unknown-wire-adapters */
import { LightningElement, wire } from 'lwc';
import { getData } from 'utils/fetchUtils';
import { routeParams } from '@lwce/router';

let eventSource;

export default class GamePlay extends LightningElement {
    gameValidationInProgress = true;
    gameValidated = false;

    gameKey;
    gameId;
    gameStatus;
    playerId;

    namespace;

    showTimer = false;
    timerDuration;

    @wire(routeParams) params;

    get showBacklogItems() {
        return this.gameStatus === 'In Progress' && this.playerId
            ? true
            : false;
    }

    validateGameKey() {
        getData('/api/validateGameKey', { gameKey: this.gameKey })
            .then((data) => {
                this.template.querySelector('utils-spinner').hide();
                this.gameValidationInProgress = false;
                if (data) {
                    this.gameValidated = true;
                    this.gameId = data.Id;
                    this.gameStatus = data[`${this.namespace}Phase__c`];
                    this.showTimer = data[`${this.namespace}Show_Timer__c`];
                    this.timerDuration =
                        data[`${this.namespace}Timer_Duration__c`];
                    let playerId = localStorage.getItem(
                        'playerId_' + this.gameId
                    );
                    if (playerId) {
                        this.playerId = playerId;
                        let playerName = localStorage.getItem(
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
    }

    initEventHandlers() {
        eventSource = new EventSource('/api/gameUpdatesStream');

        eventSource.onerror = () => {
            if (eventSource.readyState === EventSource.CLOSED) {
                this.initEventHandlers();
            }
        };

        // Handler for events of type 'eventType' only
        eventSource.addEventListener('NewPlayerResponse', (event) => {
            let data = JSON.parse(event.data);
            let payload = data.sobject;
            if (payload[`${this.namespace}Game__c`] === this.gameId) {
                let storedReplayId = localStorage.getItem(
                    'replayId_NewPlayerResponse_' + this.gameId
                );
                if (!storedReplayId || data.event.replayId > storedReplayId) {
                    localStorage.setItem(
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
            if (payload[`${this.namespace}GameID__c`] === this.gameId) {
                if (payload[`${this.namespace}Type__c`] === 'GamePhaseChange') {
                    let storedReplayId = localStorage.getItem(
                        'replayId_' +
                            payload[`${this.namespace}Type__c`] +
                            '_' +
                            this.gameId
                    );
                    if (
                        !storedReplayId ||
                        data.event.replayId > storedReplayId
                    ) {
                        localStorage.setItem(
                            'replayId_' +
                                payload[`${this.namespace}Type__c`] +
                                '_' +
                                this.gameId,
                            data.event.replayId
                        );
                        this.gameStatus = payload[`${this.namespace}Data__c`];
                        if (this.gameStatus === 'Completed') {
                            window.location.href = '/';
                        }
                    }
                } else if (
                    payload[`${this.namespace}Type__c`] === 'StoryChange'
                ) {
                    let storedReplayId = localStorage.getItem(
                        'replayId_' +
                            payload[`${this.namespace}Type__c`] +
                            '_' +
                            this.gameId
                    );
                    if (
                        !storedReplayId ||
                        data.event.replayId > storedReplayId
                    ) {
                        localStorage.setItem(
                            'replayId_' +
                                payload[`${this.namespace}Type__c`] +
                                '_' +
                                this.gameId,
                            data.event.replayId
                        );
                        this.template
                            .querySelector('ui-backlog-items-for-review')
                            .getUnvotedItem();
                    }
                } else if (payload[`${this.namespace}Type__c`] === 'CardFlip') {
                    let storedReplayId = localStorage.getItem(
                        'replayId_' +
                            payload[`${this.namespace}Type__c`] +
                            '_' +
                            this.gameId
                    );
                    if (
                        !storedReplayId ||
                        data.event.replayId > storedReplayId
                    ) {
                        localStorage.setItem(
                            'replayId_' +
                                payload[`${this.namespace}Type__c`] +
                                '_' +
                                this.gameId,
                            data.event.replayId
                        );
                        this.template
                            .querySelector('ui-backlog-items-for-review')
                            .flipCards(payload[`${this.namespace}Data__c`]);
                    }
                } else if (
                    payload[`${this.namespace}Type__c`] === 'ResetCards'
                ) {
                    let storedReplayId = localStorage.getItem(
                        'replayId_' +
                            payload[`${this.namespace}Type__c`] +
                            '_' +
                            this.gameId
                    );
                    if (
                        !storedReplayId ||
                        data.event.replayId > storedReplayId
                    ) {
                        localStorage.setItem(
                            'replayId_' +
                                payload[`${this.namespace}Type__c`] +
                                '_' +
                                this.gameId,
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

    connectedCallback() {
        this.gameKey = this.params.gameKey;
        // location.pathname.replace('/play/', '');
        getData('/api/getNamespace').then((data) => {
            this.namespace = data;
            this.validateGameKey();
            this.initEventHandlers();
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
