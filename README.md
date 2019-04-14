If existing services for analytics aren't quite cutting it, then you may be better off creating your own microservice/app.  This provides a skeleton for you to build out an app that does just that.  The app is built on top of Express/Node/MongoDB, and is capable of tracking actions performed by users and other applications.

## Requirements:
- Node >= 10.14.x
- npm >= 6.4.1
- MongoDB >= 4.0.6

## Clone it:
`git clone https://github.com/NotMyRealNameHahaha/action_tracker.git && cd action_tracker`

## Install dependencies
`npm install`

## Run it
`npm run dev`

## Check out the trivial example
[http://0.0.0.0:8080/test]


## TODO
- [x] - Create in-app example page to see live demo.
- [x] - Implement Search Relevance Neural Network.  Implement utilities to make it easier to build a Neural Network using 'Actions'.
    - See 'src/server/neural'
- [x] - Implement data model for page views
- [x] - Build example page view & action graphs
    [x] - Real-time Activity
        [x] - HTML Markup
        [x] - JS implementation
        [ ] - Polish UI
    [ ] - Active users (time-series)
        [ ] - HTML Markup
        [ ] - JS implementation
        [ ] - Polish UI

- [ ] - Clean up & refactor controllers & models to use modules.  Group files in modules based on app usage - ie. User, Account, and UserSessions can go in a 'user' module.  Implement service layer for common app functionalities.  Leverage Future, Either, & Io monads for service layer (chainable, immutable way to handle branching & errors in a pipeline)

- [ ] - Implement Neural network for Page Views
    [ ] - Predict the sequence of pages a user will follow based on the year, month, day of month, day of week, and time of day
        - Input: year, month, day, day_of_week
        - Output: Url, index
