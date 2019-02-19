const _ref = 'calories'

export const IntakeForm = {
    ref: _ref,
    template:`
        <!--  Calorie/Intake form -->
        <div class="input-group predictors--${_ref}-container">
            <div class="mdc-text-field mdc-text-field--with-leading-icon">
                <i class="material-icons mdc-text-field__icon">restaurant</i>
                <input type="number"
                        v-model="calorie_intake"
                        ref="${_ref}"
                        id="predictors--${_ref}"
                        class="mdc-text-field__input"
                        min="0"
                        max="1000000">
                <label class="mdc-floating-label" for="predictors--${_ref}">
                    Calories
                </label>
                <div class="mdc-line-ripple"></div>
            </div>
        </div>
    `
}
