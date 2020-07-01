import { LightningElement } from 'lwc';
import { getData } from 'utils/fetchUtils';

export default class GameSelector extends LightningElement {
    fetchGame() {
        let gameKey = this.template.querySelector('[name=gameKey]').value;
        if (gameKey.length > 0) {
            this.template.querySelector('utils-spinner').show();
            getData('/api/validateGameKey', { gameKey })
                .then((data) => {
                    this.template.querySelector('utils-spinner').hide();
                    if (data) {
                        window.location.href = '/play/' + gameKey;
                    } else {
                        this.template
                            .querySelector('utils-toast')
                            .showToast('Invalid Game Key', 'error', true);
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
