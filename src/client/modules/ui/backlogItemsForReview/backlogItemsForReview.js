import { LightningElement, api } from 'lwc';
import { getData, postData } from 'utils/fetchUtils';

export default class BacklogItemsForReview extends LightningElement {
    @api gameId;
    @api playerId;

    estimateOptions;
    currentItem;
    error;

    cardsFlipped = false;

    //timer
    @api showTimer;
    @api timerDuration;

    connectedCallback() {
        this.getUnvotedItem();
    }

    @api
    getUnvotedItem() {
        getData('/api/getUnvotedItem', { gameId: this.gameId })
            .then((data) => {
                this.error = undefined;
                if (data) {
                    this.estimateOptions = data.cards;
                    this.currentItem = data;
                    this.cardsFlipped = false;
                    this.resetCards();
                }
            })
            .catch((error) => {
                this.error = error;
                console.error(error);
            });
    }

    @api
    flipCards(flipped) {
        if (flipped === 'true') {
            this.cardsFlipped = true;
        } else {
            this.cardsFlipped = false;
        }
    }

    @api
    resetCards() {
        this.template
            .querySelector('ui-player-responses')
            .getResponsesFromSalesforce();
    }

    @api
    updateVote(payload) {
        this.template.querySelector('ui-player-responses').updateVote(payload);
    }

    handleSelectedOption(event) {
        let selectedOption = event.target.dataset.label;
        this.template.querySelectorAll('.pokerCard').forEach((node) => {
            node.classList.remove('selectedPokerCard');
        });
        event.target.classList.add('selectedPokerCard');

        postData('/api/captureVote', {
            storyId: this.currentItem.itemId,
            response: selectedOption,
            gameId: this.gameId,
            playerId: this.playerId
        })
            .then(() => {
                this.error = undefined;
            })
            .catch((error) => {
                this.template
                    .querySelector('utils-toast')
                    .showToast('An error occurred', 'error', true);
                this.error = error;
            });
    }

    handleTimeUp() {
        this.cardsFlipped = true;
    }
}
