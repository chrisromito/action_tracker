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

- [x] - Clean up & refactor controllers & models to use modules.  Group files in modules based on app usage - ie. User, Account, and UserSessions can go in a 'user' module.
    - Implement service layer for common app functionalities.
    - Leverage Future, Either, & Io monads for service layer (chainable, immutable way to handle branching & errors in a pipeline)

- [x] - Implement data model for clients & domains.  Facilitate functionality comparable to a
        SAAS platform where users will send requests from their site to this platform.
    - Ex. Users on 'my.client-website.com' will run our plugin.  Our plugin sends requests to 'action-tracker.com/'.

- [ ] - Implement Neural network for Page Views
    [ ] - We want to be able to answer: "If Foo User is currently on page A, what page are they likely to go to next?"
        - Input: year, month, day, dayOfTheWeek, timeOfDay, pageId, pageSequence
        - Output: year, month, day, dayOfTheWeek, timeOfDay, pageId, pageSequence
