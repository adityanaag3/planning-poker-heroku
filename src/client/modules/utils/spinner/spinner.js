import { LightningElement, api } from 'lwc';

export default class Spinner extends LightningElement {
    showSpinner = false;

    @api showOnLoad;

    @api
    show() {
        this.showSpinner = true;
    }

    @api
    hide() {
        this.showSpinner = false;
    }

    connectedCallback() {
        if (this.showOnLoad) {
            this.showSpinner = true;
        }
    }
}
