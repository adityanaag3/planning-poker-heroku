/* eslint-disable no-unused-expressions */
import { LightningElement, api } from 'lwc';
import { getData, postData } from 'utils/fetchUtils';

export default class BacklogItemsForReview extends LightningElement {
    @api gameId;
    @api playerId;
    @api namespace;

    estimateOptions;
    currentItem;
    error;

    cardsFlipped = false;

    get storyId() {
        return this.currentItem.itemId;
    }

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

    resetTimer() {
        if (this.showTimer && this.template.querySelector('utils-timer')) {
            this.template.querySelector('utils-timer').resetTimer();
        }
    }

    @api
    resetCards() {
        this.template.querySelectorAll('.pokerCard').forEach((node) => {
            node.classList.remove('selectedPokerCard');
        });

        if (this.template.querySelector('ui-player-responses')) {
            this.template
                .querySelector('ui-player-responses')
                .getResponsesFromSalesforce(this.storyId);
        }

        this.resetTimer();
    }

    @api
    updateVote(payload) {
        if (this.template.querySelector('ui-player-responses')) {
            this.template
                .querySelector('ui-player-responses')
                .updateVote(payload);
        }
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
