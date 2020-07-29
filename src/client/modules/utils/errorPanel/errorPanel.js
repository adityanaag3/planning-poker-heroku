import { LightningElement, api } from 'lwc';
import { getErrorMessage } from 'utils/reduceErrors';

export default class ErrorPanel extends LightningElement {
    @api error;

    get errorMessages() {
        return getErrorMessage(this.error);
    }
}
