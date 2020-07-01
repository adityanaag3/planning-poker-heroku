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
        this.getResponsesFromSalesforce();
    }

    @api
    updateVote(payload) {
        for (let playerResponse in this.playerResponses) {
            if (playerResponse.player.Id === payload.Player__c) {
                playerResponse.response = payload.Response__c;
                for (let estimateOption in this.estimateOptions) {
                    if (estimateOption.name === playerResponse.response) {
                        playerResponse.pokerCard.colorHexCode =
                            estimateOption.colorHexCode;
                    }
                }
            }
        }
    }

    @api
    getResponsesFromSalesforce() {
        getData('/api/getPlayerResponses', {
            gameId: this.gameId,
            storyId: this.storyId
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
