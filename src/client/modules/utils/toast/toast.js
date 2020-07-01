import { LightningElement, api } from 'lwc';

export default class Toast extends LightningElement {
    message;
    variant;
    show = false;

    get sldsClass() {
        if (this.variant === 'error') {
            return 'slds-notify slds-notify_toast slds-theme_error';
        }
        return 'slds-notify slds-notify_toast slds-theme_success';
    }

    get svgUrl() {
        if (this.variant === 'error') {
            return '/resources/icons/utility-sprite/svg/symbols.svg#error';
        }
        return '/resources/icons/utility-sprite/svg/symbols.svg#success';
    }

    @api
    showToast(message, variant, autoClose) {
        this.message = message;
        this.variant = variant;
        this.show = true;
        if (autoClose === true) {
            setTimeout(() => {
                this.show = false;
            }, 5000);
        }
    }

    closeToast() {
        this.show = false;
    }
}
