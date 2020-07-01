import { LightningElement } from 'lwc';

export default class App extends LightningElement {
    playerName;

    handlePlayerName(event) {
        this.playerName = event.detail.playerName;
    }
}
