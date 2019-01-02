# vue-acfx

## Introduction

`vue-acfx` is a plugin for [Vue.js](http://vuejs.org) applications, and a framework for implementing authz and access control.  It is still a work in progress, not completed yet. There shall be a [vue-cli](http://cli.vuejs.org/) plugin for it, after the main features shall been completed, to help you incorporate it into new projects.

Design goals:

- Provide a working login / authorization data protocol, yet the API endpoints and authz data interpretation could be customized in your project
- Browser path access and back-end API requests are controlled inside local Javascript code first, reducing traffic generated from misuse
- Control existence of actionable UI elements simply with `v-ac="actionname"` attribute, according to authz data of route + action
- Support not logged-in users to access part of your routes, while trying to access authorized ones will direct them to login
- Minimize the efforts needed to introduce all above functionalities into your projects, just use the ready-made plugin and menu component, etc.

## Running Demo App

The source code root is the demo app, temporarily. The code of vue plugin is now in `authPlugin` folder.

``` bash
# install deps
npm install

# Compiles and hot-reloads for development
npm run serve

# Compiles and minifies for production
npm run build
```

## Progress

Implemented:
- [x] get menu contents for user from backend
- [x] get ACL of route, actions from backend
- [x] enforce router navigation path access control
- [x] hide UI elements for not allowed actions

Next:
- [ ] intercept axios to enforce request url access control
- [ ] handle back-end response for session expiration
- [ ] vue plugin and vue-cli plugin deployment

## License
[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2018 briskr
