<p align="center">
  <img src="https://github.com/adityanaag3/planning-poker-heroku/raw/master/src/client/resources/logo.png" alt="Planning Poker Icon" width="150"/>
</p>

# Planning Poker Player App for Guests

[![Github Workflow](https://github.com/adityanaag3/planning-poker-heroku/workflows/Formatting%20and%20Tests/badge.svg?branch=master)](https://github.com/adityanaag3/planning-poker-heroku/actions?query=workflow%3A%22Formatting+and+Tests%22) [![codecov](https://codecov.io/gh/adityanaag3/planning-poker-heroku/branch/master/graph/badge.svg)](https://codecov.io/gh/adityanaag3/planning-poker-heroku)

1. [About](#about)
1. [Prerequisites](#prerequisites)
1. [Installation](#installation)
1. [Building and contributing](#building-and-contributing)

## About

Planning poker is a consensus-based, gamified technique for estimating user stories in Scrum. This app allows guests (player's without a Salesforce License) to participate in the Planning Poker game that's run using Salesforce.

You'll need a free [Heroku account](https://signup.heroku.com) to set it up. A free account lets you run the game with a small group of players. If you run the game with a larger group, consider upgrading to a [Hobby Dyno](https://www.heroku.com/dynos).

## Prerequisites

Make sure you've installed the host app on Salesforce by following the instructions [here](https://github.com/adityanaag3/planning-poker-salesforce#installation).

## Installation

<ol>
    <li>Deploy to Heroku using the button below<br/>
        <p>
            <a href="https://heroku.com/deploy?template=https://github.com/adityanaag3/planning-poker-heroku/master">
                <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy">
            </a>
        </p>
    </li>
    <li>
        Set the enviroment variables as follows
        <table>
        <tr>
          <th>Variable</th>
          <th>Description</th>
        </tr>
        <tr>
          <td>SF_CONSUMER_KEY</td>
          <td>Consumer Key of the Salesforce Connected App</td>
        </tr>
        <tr>
          <td>SF_USERNAME</td>
          <td>Username of the integration user who has been assigned the <b>Planning Poker Player</b> permission set.</td>
        </tr>
        <tr>
          <td>SF_LOGIN_URL</td>
          <td>The login URL of your Salesforce org:<br/>
          <code>https://test.salesforce.com/</code> for scratch orgs and sandboxes<br/>
          <code>https://login.salesforce.com/</code> for Developer Edition and production</td>
        </tr>
        <tr>
          <td>PRIVATE_KEY</td>
          <td>Contents of the private.pem file generated from the certificate creation step</td>
        </tr>
        <tr>
          <td>SF_NAMESPACE</td>
          <td>Use <code>planningpokersf</code> if you have installed the host app using the packages listed <a href="https://github.com/adityanaag3/planning-poker-salesforce#using-a-package" target=""_blank>here</a>. Else, use the namespace from the host app's <a href="https://github.com/adityanaag3/planning-poker-salesforce/blob/master/sfdx-project.json" target="_blank">sfdx-project.json</a> file.</td>
        </tr>
      </table>
    </li>
</ol>

## Building and contributing

If you want to build the project from sources and contribute, run `npm install` to install the project build tools.
