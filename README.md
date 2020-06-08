# xmtoolbox

The xmtoolbox is a promise based node package to simplify the interaction with xMatters using the REST APIs. It wraps all documented APIs and adds simple backup, restore, and sync functionality.

Please have a look at the [xmtoolbox-quick-start template](https://github.com/brannonvann/xmtoolbox-quick-start) for a full working node app.

<aside class="notice">
This library is currently in development. Please report any issues to: https://github.com/brannonvann/xmtoolbox/issues 
</aside>

## Simple To Use

xmtoolbox is designed to simplify the interactions with the xMatters APIs and includes other helper functions for synchronizations from a file and between xMatters instances for backup and restoration of xMatters data.

    //returns person with targetName jsmith
    const jsmith = await xm.people.get(np, 'jsmith')

    //gets group with group named MIM
    const MIM = await xm.groups.get(np, 'MIM')

## Installation

    npm install xmtoolbox --save

## Setup

1.  Create user with 'Web Service User Role` for each xMatters Instance
2.  Follow Examples to leverage package.
3.  Setup an xMatters environment for each instance you are interacting with. This is an example of one:

        const xm = require('../xmtoolbox');

        //xMatters username and password stored as environment variables.
        const SUBDOMAIN = process.env.SUBDOMAIN; // https://SUBDOMAIN.xmatters.com
        const USERNAME = process.env.USERNAME;
        const PASSWORD = process.env.PASSWORD;

        //options doc: https://brannonvann.github.io/xmtoolbox/module-environments.html#.EnvironmentOptions
        const options = {logLevel: 'debug', readOnly: false};

        //create non-production xMatters environment
        const np = xm.environments.create(SUBDOMAIN, USERNAME, PASSWORD, options);

## Warning

This package has the ability to modify data within xMatters for good and bad. Please use it responsibly. Test in non-production and don't make unnecessary requests against your xMatters instance. Also, be aware that according to xMatters, the inbound events and flow posts share the same bandwidth any interactions with the xMatters APIs, including the ones this package uses, so again please use responsibly.

## Examples

Full working examples are available in the [xmtoolbox-quick-start template](https://github.com/brannonvann/xmtoolbox-quick-start).

To improve readability, `xm` is a reference to this package. `np` and `prod` in the below examples are environments that are assumed to exist as explained in [setup](#setup). Only the `np` (non-production) is included in the setup as an example but depending on your goals you may need to operate with two or more xMatters instances and will need to create them as needed.

### Get User with Devices

        const person = await xm.people.get(np, 'amunster', { embed: 'devices' });
        console.log(person.firstName); //Arnold

### Get Users with Devices and Roles

        // matches weblogin and email for @example.com
        const query = { embed: 'roles,devices', search: '@example.com' };
        const people = await xm.people.getMany(np, query);

### Migrate groups, people, and devices from production to non-production xMatters

        const syncOptions = {
            people: true,
            peopleFilter: p => p.targetName.startsWith('U001'), //Optional
            devices: true,
            groups: true,
            shifts: true
        };

        (async () => {
            await xm.sync.xMattersToxMatters(prod, np, syncOptions);
        })();

### Backup People and Devices from xMatters to a file

        const extractOptions = {
            people: true,
            devices: true
            //groups: true, // include groups
            //shifts: true // and shifts too!
        }

        const path = `./data/${np.subdomain}.people.json`;

        (async () => {
            const data = await xm.sync.ExtractData(np, extractOptions);
            require('fs').writeFileSync(path, JSON.stringify(data, null, 2));
        })();

### Restore People and Devices from File to xMatters

        const syncOptions = {
            people: true,
            devices: true,
            //groups: true, // include groups
            //shifts: true // and shifts too!
        };

        const path = `./data/${np.subdomain}.people.json`;

        (async () => {
            const text = require('fs').readFileSync(path, 'utf8');
            await xm.sync.DataToxMatters(JSON.parse(text), np, syncOptions);
        })();

## API

The API documentation is available at [https://brannonvann.github.io/xmtoolbox/index.html](https://brannonvann.github.io/xmtoolbox/index.html).

## Supported Data

This lists below refer to xMatters objects as defined in the xMatters REST API documentation.

### Can be obtained from xMatters

- Audits
- Devices
- Device Names
- Device Types
- Dynamic Teams
- Events
- Event Suppressions
- Forms
- Groups
- Group Roster
- Import Jobs
- Integrations
- On-Call
- People
- Plans (Workflows)
- Plan Constants
- Plan Endpoints
- Plan Properties
- Roles
- Scenarios
- Shared Libraries
- Shifts
- Sites
- Subscription Forms
- Subscriptions
- Temporary Absences

### Can be created, updated, or deleted in xMatters

Object as defined by xMatters (caveats)

- Devices
- Dynamic Teams
- Groups
- Group Roster
- Integrations
- People
- Plans (Workflows)
- Plan Constants
- Plan Endpoints
- Plan Properties (delete not available)
- Scenarios (delete not available)
- Shared Libraries
- Shifts
- Sites
- Subscriptions (supporting subscription forms need to be manually created and maintained)
- Temporary Absences (Warning: These generate notifications when created)
- Workflow HTTP Trigger

## Odds and Ends

- Create Plan doesn't support loggingLevel but update does. For synchronizations this means there will be an update the second time the sync is run to update the loggingLevel if the logging level is different in the source than the default.
- Creating and Updating xMatters Type endpoints in communication plans is not supported via API. They exist in every plan but require configuration in the UI to set the authenticating user.
- Syncing any communication plan related data such as the plans, forms, scenarios, plan properties, plan constants, plan endpoints, shared libraries, or integrations require that the rest user have edit access for the communication plan(s). One way to accomplish this is to add the Rest Web Services Role to each of the communication plans. The specific user can also be added rather than the entire role.
- Form APIs do not exist to allow the updating and deleting comm plan forms and therefore they cannot be synced. Scenarios depend on forms. If scenarios are synchronized the forms must be created independently of the sync with the same properties in the form layout.
