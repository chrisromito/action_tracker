const _ref = 'pal'


export class ActivityLevel {
    constructor(pal, description='') {
        this.pal = pal
        this.description = description

        console.log(pal)
    }

    getEnergyExpenditure(bmr) {
        /** Get a person's total energy expenditure for a day
         *   when given their PAL & BMR
         * 
         *  NOTE:
         *    Tee = Total Energy expenditure (for a 24-hr period)
         *    BMR = Basal Metabolic Rate
         *  PAL = Tee / BMR
         *  @param bmr {Number}: The user's BMR
         *  @returns {Number}
         */
        return this.pal * bmr
    }
}


const palOptions = [
    ['Zero Activity', 1.20],
    ['Sedentary (little or no exercise)', 1.45],
    ['Low Activity (~3 1 hr. wrokouts/week)', 1.65],
    ['Moderate Activity (~5 1 hr. workouts/week)', 1.85],
    ['Hardcore Activity (heavy labor or 7-9 1 hr. workouts/week)', 2.0],
    ['Professional Athlete (12-14 1 hr. workouts week)', 2.4],
    ['Active Military Deployment', 4.6]
]

const optionStr = palOptions.map(
    (p)=> new ActivityLevel(p[1], p[0])
).map(
    (cls)=> `<li class="mdc-list-item" data-value="${cls.pal}">${cls.description}</li>`
).join('')


export const PhysicalActivityForm = {
    options: palOptions,
    ActivityLevel: ActivityLevel,
    ref: _ref,
    template: `
        <!-- Physical Activity Level -->
        <div ref="${_ref}"
                class="input-group pal--select mdc-select mdc-select--with-leading-icon">

            <i class="material-icons mdc-select__icon"> fitness_center </i>
            <div class="mdc-select__selected-text"></div>

            <div class="pal--select mdc-select__menu mdc-menu mdc-menu-surface">
                <ul class="mdc-list">
                    ${optionStr}
                </ul>
            </div>

            <span class="mdc-floating-label">
                Activity
            </span>
            <div class="mdc-line-ripple"></div>
        </div>
    `
}