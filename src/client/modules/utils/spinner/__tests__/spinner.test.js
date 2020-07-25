import { createElement } from 'lwc';
import Spinner from 'utils/spinner';

describe('utils-spinner', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('displays spinner correctly on load when showOnLoad is true', () => {
        const element = createElement('utils-spinner', {
            is: Spinner
        });
        element.showOnLoad = true;
        document.body.appendChild(element);

        const spinnerEl = element.shadowRoot.querySelector(
            '.slds-spinner_container'
        );
        expect(spinnerEl).not.toBeNull();

        const spinnerDotA = element.shadowRoot.querySelector(
            '.slds-spinner__dot-a'
        );
        expect(spinnerDotA).not.toBeNull();

        const spinnerDotB = element.shadowRoot.querySelector(
            '.slds-spinner__dot-b'
        );
        expect(spinnerDotB).not.toBeNull();
    });

    it('doesnt display spinner on load', () => {
        const element = createElement('utils-spinner', {
            is: Spinner
        });
        document.body.appendChild(element);

        const spinnerEl = element.shadowRoot.querySelector(
            '.slds-spinner_container'
        );
        expect(spinnerEl).toBeNull();
    });
});
