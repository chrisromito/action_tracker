const _ref = 'dayrange'

export const DateForm = {
    ref: _ref,
    template: `
        <div class="width--100">
            <div class="mdc-typography--headline6">
                Intake & Activity
            </div>
        </div>
        <!-- Date Slider -->
        <div class="input-group predictors--${_ref}-container">
            <p class="mdc-typography--body1 mdc-theme--primary pad--h-10 pad--bottom-0 margin--bottom-0">
                <b>Duration:</b> {{ dateRange }} days                    
            </p>
            <div class="mdc-slider mdc-slider--discrete mdc-slider--display-markers"
                    ref="${_ref}"
                    tabindex="0"
                    role="slider"
                    v-bind:aria-valuenow="dateRange"
                    aria-valuemin="0"
                    aria-valuemax="730"
                    aria-label="Select Value">
                <div class="mdc-slider__track-container">
                    <div class="mdc-slider__track"></div>
                    <div class="mdc-slider__track-marker-container"></div>
                </div>
                <div class="mdc-slider__thumb-container">
                    <div class="mdc-slider__pin">
                        <span class="mdc-slider__pin-value-marker"></span>
                    </div>
                    <svg class="mdc-slider__thumb"
                            width="21"
                            height="21">
                        <circle cx="10.5" cy="10.5" r="7.875"></circle>
                    </svg>
                    <div class="mdc-slider__focus-ring"></div>
                </div>
            </div>
        </div>
    `
}