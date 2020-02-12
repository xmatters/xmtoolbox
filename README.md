# xmtoolbox

<aside class="notice">
This package is a work in progress. Currently updating JSDocs to properly document functions and adding sync module functionality.
</aside>

## Simple To Use

xmtoolbox is designed to simplify the interactions with the xMatters APIs and includes other helper functions for synchronizations from a file and between xMatters instances and for backup and restoration of xMatters data.

    //returns person with targetName jsmith
    const jsmith = await xm.people.get(np, 'jsmith')

    //gets group with group named MIM
    const MIM = await xm.groups.get(np, 'MIM')

## Installation

        npm install xmtoolbox

## Setup

1.  Create user with 'Web Service User Role` for each xMatters Instance
2.  Follow Examples to leverage package.
3.  Setup an xMatters environment for each instance you are interacting with. This is an example of one:

        const xm = require('../xmtoolbox');

        //xMatters username and password stored as environment variables.
        const SUBDOMAIN = process.env.SUBDOMAIN; // https://SUBDOMAIN.xmatters.com
        const USERNAME = process.env.USERNAME;
        const PASSWORD = process.env.PASSWORD;
        const options = {logLevel: 'debug'};

        const prod = xm.environments.create(SUBDOMAIN, USERNAME, PASSWORD, options);

## Examples

Full working examples are available in the [xmtoolbox-quick-start template](https://github.com/brannonvann/xmtoolbox-quick-start).

### REST API Examples

#### Get User with Devices

        const person = await xm.people.get(prod, 'amunster', { embed: 'devices' });
        console.log(person.firstName); //Arnold

#### Get Users with Devices and Roles

        // matches weblogin and email for @example.com
        const query = { embed: 'roles,devices', search: '@example.com' };
        const people = await xm.people.getMany(prod, query);

## API

The API documentation is available at [https://brannonvann.github.io/xmtoolbox/index.html](https://brannonvann.github.io/xmtoolbox/index.html).

## Notes

- Create Plan doesn't support loggingLevel but update does. For synchronizations this means there will be an update the second time the sync is run to update the loggingLevel if the logging level is different in the source than the default.
- Creating and Updating xMatters Type endpoints in communication plans is not supported via API. They exist in every plan but require configuration in the UI to set the authenticating user.
- Syncing any communication plan related data such as the plans, forms, scenarios, plan properties, plan constants, plan endpoints, shared libraries, or integrations require that the rest user have edit access for the communication plan(s). One way to accomplish this is to add the Rest Web Services Role to each of the communication plans. The specific user can also be added rather than the entire role.
- Form APIs do not exist to allow the updating and deleting comm plan forms and therefore they cannot be synced. Scenarios depend on forms. If scenarios are synchronized the forms must be created independently of the sync with the same properties in the form layout.
