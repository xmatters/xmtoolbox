# xmtoolbox

The xmtoolbox is a easy to use, zero dependency, promise based node package to simplify the interaction with xMatters using the xMatters REST APIs. It wraps all documented APIs and adds simple backup, restore, and sync functionality.

All Issues and Questions: [https://github.com/xmatters/xmtoolbox/issues](https://github.com/xmatters/xmtoolbox/issues)

Working examples: [https://github.com/xmatters/xmtoolbox-quick-start](https://github.com/xmatters/xmtoolbox-quick-start)

xmtoolbox documentation: [https://xmatters.github.io/xmtoolbox/](https://xmatters.github.io/xmtoolbox/)

xmtoolbox node package: [https://www.npmjs.com/package/xmtoolbox](https://www.npmjs.com/package/xmtoolbox)

If you are new to node.js see the [Getting Started](#getting-started) section.

## Installation

    npm install xmtoolbox --save

## Getting Started

The following instructions get you started without an existing node.js project and will get all groups from xMatters. See the examples in [xmtoolbox-quick-start](https://github.com/xmatters/xmtoolbox-quick-start) for more examples.

1.  Install Node from <https://nodejs.org>. Install the latest Long Term Support(LTS) release.
1.  In terminal/command prompt, create new node project using the command `npm init` and follow prompts. The defaults are sufficient for getting started.
1.  In terminal/command prompt, install xmtoolbox using the command `npm install xmtoolbox --save`.
1.  Create a user in xMatters or add an an API key to an existing one. The user must have the role `Web Service User Role`. See the [user](#user) and [password](#password) sections for more information.
1.  Create a new file in this directory called `example.js` and place the contents below in that file. Replace the placeholders for [subdomain](#subdomain), [username](#user), and [password](#password) with your details.

    ```javascript
    const xm = require('../xmtoolbox');

    const np = xm.environments.create('subdomain', 'username', 'password');

    main();

    async function main() {
      const groups = await xm.groups.getMany(np);
      console.log(JSON.stringify(groups, null, 2));
    }
    ```

1.  In terminal/command prompt, run the example.js using the command `node example.js`

#### Subdomain

The xMatters subdomain is needed so that xmtoolbox know which xMatters environment it is interacting with. If your xMatters url is https://company.xmatters.com, your subdomain is company.

#### User

The xmtoolbox needs an xMatters user to make api requests using the xMatters API. The user must have the 'Web Services User Role' role. When creating an xmtoolbox environment you may specific the user as the actual user's username or an [API Key](https://help.xmatters.com/ondemand/user/apikeys.htm) created with that user.

### Password

To support a variety of deployments and situations, xmtoolbox supports many methods of specifying the password or API key that is used to authenticate the [user](#user). The password may be the xMatters user password, api key secret, or an xmtoolbox encryption key if the .xmpw file has been defined. The password can also be `undefined` if the encryption key is specified in the environment variable specified when creating the .xmpw file. To encrypt the password and create a .xmpw file, see [Encrypted Password](#encrypted-password) If this encryption method is not desirable you may implement any encryption or security mechanism desirable as long as the string form of the password or API key is supplied when creating the xmtoolbox environment.

### Encrypted Password

A xmtoolbox .xmpw file is an aes-256-gcm encrypted file that contains your xMatters password or API Key secret for each xMatters instance. A 32 character key is used to encrypt the file and must be provided to xmtoolbox via the password field or environment variable that is provided after following the instructions below.

To create encrypted xmtoolbox .xmpw file to store your password in encrypted format for each xMatters instance.

1. Run `npx create-xmpw` from this project directory.
1. Provide your xMatters subdomain. ex: company if your url is company.xmatters.com.
1. Provide your xMatters password or API key secret for the user or API key you will use.
1. Provide your 32 character key. Keys longer than 32 characters are truncated.

After following the steps above, the file is written to project directory with a name similar to the subdomain with extension `.xmpw`. The key may be provided in the password field or the environment variable given in the output after following the steps above.

## Warning

This package has the ability to modify data within xMatters for good and bad. Please use it responsibly. Test in non-production and don't make unnecessary requests against your xMatters instance. Also, be aware that according to xMatters, the inbound events and flow posts share the same bandwidth any interactions with the xMatters APIs, including the ones this package uses, so again please use responsibly.

## Examples

Full working examples are available in the [xmtoolbox-quick-start template](https://github.com/xmatters/xmtoolbox-quick-start).

To improve readability, `xm` is a reference to this package. `np` and `prod` in the below examples are environments that are assumed to exist as demonstrated in [getting started](#getting-started). Only the `np` (non-production) is included in the setup as an example but depending on your goals you may need to operate with two or more xMatters instances and will need to create them as needed.

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
- Subscriptions
- Subscription Forms (delete not available)
- Temporary Absences (Warning: These generate notifications when created)
- Workflow HTTP Trigger

## Odds and Ends

- Create Plan doesn't support loggingLevel but update does. For synchronizations this means there will be an update the second time the sync is run to update the loggingLevel if the logging level is different in the source than the default.
- Creating and Updating xMatters Type endpoints in communication plans is not supported via API. They exist in every plan but require configuration in the UI to set the authenticating user.
- Syncing any communication plan related data such as the plans, forms, scenarios, plan properties, plan constants, plan endpoints, shared libraries, or integrations require that the rest user have edit access for the communication plan(s). One way to accomplish this is to add the Rest Web Services Role to each of the communication plans. The specific user can also be added rather than the entire role.
- Form APIs do not exist to allow the updating and deleting communication plan forms and therefore they cannot be synced.

## Compatibility

### Node

xmtoobox is supported on many version of Node.js however the latest Long Term Support(LTS) version of [node.js](https://nodejs.org) is recommended.

### Operating Systems

xmtoolbox is supported on Linux, macOS, and Windows operating systems.
