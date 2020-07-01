/* eslint-disable guard-for-in */
import { LightningElement, track, api } from 'lwc';
import { getData } from 'utils/fetchUtils';

export default class PlayerList extends LightningElement {
    error;

    @track playerResponses;

    @api gameId;
    @api storyId;
    @api cardsFlipped;
    @api estimateOptions;

    connectedCallback() {
        this.getResponsesFromSalesforce(this.storyId);
    }

    @api
    updateVote(payload) {
        for (let index in this.playerResponses) {
            let playerResponse = this.playerResponses[index];
            if (playerResponse.player.Id === payload.Player__c) {
                playerResponse.response = payload.Response__c;
                for (let estimateIndex in this.estimateOptions) {
                    let estimateOption = this.estimateOptions[estimateIndex];
                    if (estimateOption.name === playerResponse.response) {
                        if (playerResponse.pokerCard) {
                            playerResponse.pokerCard.colorHexCode =
                                estimateOption.colorHexCode;
                        } else {
                            playerResponse.pokerCard = {
                                name: playerResponse.response,
                                colorHexCode: estimateOption.colorHexCode
                            };
                        }
                    }
                }
            }
        }
    }

    @api
    getResponsesFromSalesforce(storyId) {
        getData('/api/getPlayerResponses', {
            gameId: this.gameId,
            storyId: storyId
        })
            .then((data) => {
                if (data) {
                    this.playerResponses = data;
                }
            })
            .catch((error) => {
                this.error = error;
                console.error(error);
            });
    }
}
