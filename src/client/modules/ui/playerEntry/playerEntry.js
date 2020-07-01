import { LightningElement, api } from 'lwc';
import { getData, postData } from 'utils/fetchUtils';

export default class PlayerEntry extends LightningElement {
    @api gameId;
    registrationSuccessful = false;

    connectedCallback() {
        let doesPlayerExist = sessionStorage.getItem('playerId_' + this.gameId);
        if (doesPlayerExist) {
            this.registrationSuccessful = true;
        }
    }

    addPlayer() {
        let playerName = this.template.querySelector('[name=playerName]').value;
        if (playerName.length > 0) {
            this.template.querySelector('utils-spinner').show();
            getData('/api/verifyPlayer', { playerName, gameId: this.gameId })
                .then((data) => {
                    if (!data) {
                        postData('/api/insertPlayer', {
                            gameId: this.gameId,
                            playerName
                        })
                            .then((playerData) => {
                                this.template
                                    .querySelector('utils-spinner')
                                    .hide();
                                this.registrationSuccessful = true;
                                sessionStorage.setItem(
                                    'playerId_' + this.gameId,
                                    playerData
                                );
                                sessionStorage.setItem(
                                    'playerName_' + this.gameId,
                                    playerName
                                );
                                const event = new CustomEvent('playercreated', {
                                    detail: { playerId: playerData, playerName }
                                });
                                this.dispatchEvent(event);
                            })
                            .catch((error) => {
                                this.template
                                    .querySelector('utils-spinner')
                                    .hide();
                                this.template
                                    .querySelector('utils-toast')
                                    .showToast(
                                        'An error occurred',
                                        'error',
                                        true
                                    );
                                console.error(error);
                            });
                    } else {
                        this.template.querySelector('utils-spinner').hide();
                        this.template
                            .querySelector('utils-toast')
                            .showToast(
                                'A player with this name already exists',
                                'error',
                                true
                            );
                    }
                })
                .catch((error) => {
                    this.template.querySelector('utils-spinner').hide();
                    this.template
                        .querySelector('utils-toast')
                        .showToast('An error occurred', 'error', true);
                    console.error(error);
                });
        }
    }
}
