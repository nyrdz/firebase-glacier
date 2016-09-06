#firebase-glacier
Specification and tools to document firebase projects

--------

##Usage

###To use as command line utility
`npm install -g firebase-glacier`

`firebase-glacier` in the terminal will read `./glacier.yml` and output at `./firebase_spec/`

`firebase-glacier init` in the terminal will create `./glacier.yml` and output an initial build at `./firebase_spec/`

###To use as module
`npm install --save-dev firebase-glacier`

--------

##Motivations
This project was born from my necessity of a better way to design and write firebase's database rules

I based the main idea of the project on [swagger](http://swagger.io/), which is an open standard to define language-agnostic interfaces to REST APIs. With glacier, I adapted this concepts and ideas to fit a firebase project

The objective of glacier is to work on a single document that can be processed to generate useful output: database rules, storage rules and even html showing relevant formatted information in a visually pleasant way

The document to work with is called **glacier document**

----------

##glacier document specification

The language to write a glacier document is yaml.

It contains five main fields at its root:

 - glacier
 - info
 - auth
 - database
 - storage

glacier
: Indicates the firebase-glacier version

info
: Contains information relevant to the project users

auth
: Contains the configuration options of the auth service

database
: Contains the database rules design

storage
: Contains the storage rules design

----------


###Main fields breakdown

####glacier
Indicates the firebase-glacier version

    glacier: "0.2"

----------

####info
Contains information relevant to the project users

    info:
	    version: "0.0.0"
	    title: MyApp API
	    description: Reference to MyApp API
	    termsOfService: terms
	    license: Copyright 2016 MyApp
	    config:
	        web:
	            apiKey: none
	            authDomain: none
	            databaseURL: none
	            storageBucket: none
	    glossary:
	        User: A user that can be assigned one or more role
	        Admin: A user with elevated privileges

----------

####auth
Contains the configuration options of the auth service

    auth:
	    methods:
	        - email
	        - google
	        - facebook
	        - anonymous
	    oauthRedirectDomains:
	        - localhost
	    allowMultipleAccountsWithSameEmail: false

####database
Contains the database rules design

    database:
	    /users:
	        .read: true
	        .indexOn:
	            - email
	            - name
	            - lastname
	            - birthdate
	        /$uid:
	            .write: "auth.uid === $uid"
	            .validate: "newData.hasChildren(['email', 'name', 'lastname'])"
	            /email:
	                .validate: "newData.isString()"
	            /name:
	                .validate: "newData.isString()"
	            /lastname:
	                .validate: "newData.isString()"

####storage
Contains the database rules design

>Still to be defined

----------

##Processors

At this point, the project counts with just the database rules processor. It'll read the **glacier document** and serialize the `database` field in json format and will be saved into a file ready to be imported to the firebase project.

To invoke all processors (database rules processor and storage rules processor, for now) just:

    var glacier = require('firebase-glacier')
    glacier.build()

It'll read the glacier document from `./firebase_spec/glacier.yml` and output `./firebase_spec/database.rules.json` and `./firebase_spec/storage.rules.json`

###Database rules processor
The **database rules processor** will ignore all metadata fields and remove the leading slashes from any child of the `database` root field and

    var glacier = require('firebase-glacier')
    glacier.buildDbRules()

###Storage rules processor
Not implemented yet

###Html generator
Not implemented yet

----------

##Metadata
The json document used to define rules in firebase says little about what they are meant for when you're not the one that designed those rules (unless you know how security rules work). For this reason, glacier reserves the `$` character (at the start of the field) to define arbitrary metadata in the glacier document. A metadata field is meant to be used by a processor.

For example:

    /messenger:
	    $notes: Conversations messages record
	    /$conversation:
	        /members:
	            $notes: Key sided object containing the uids of the conversation members
	        /messages:
	            /$key:
	                /$uid:
	                    $notes: Message owner
	                /message:
	                    .validate: "newData.isString()"

Here, we are defining `$notes` as a metadata field that explains what the parent field represents/does/etc. and can be used, say, by the **html generator** to show this notes to the reader in a stylized way.

Another one:

    /users:
	    /$uid:
		    /status:
			    $notes: Represent the current status of the user
			    $acceptedValues:
				    - Online
				    - Offline
				    - Suspended
				    - Banned
In this example we defined the `$acceptedValues` metadata field. This one can be used by the **database rules processor** to generate the `.validate` field using the array values instead of manually writing a cumbersome long string to accomplish that rule:
`(newData.val() === 'Online') || (newData.val() === 'Offline') || ...`
By the way, this feature is **not implemented yet**

----------

##Middleware
For the **database rules processor**, the registered middleware (can be more than one of course) is the first agent to handle the **glacier document**. Its input is an object representation of the **glacier document**. Its output must be the same object already processed. After every middleware is invoked, the **database rules processor** will continue its job

###Built-in middleware
####decorators
This middleware allows to define arbitrary decorators that'll get replaced with the values they're associated. Decorators are defined as fields of a `decorators` field placed at the root of the glacier document.
Currently, **the use of decorators inside the definition of others decorators is not supported**.

Example:

    glacier: ...
    info: ...
    auth: ...
    database: ...
    storage: ...
    decorators:
	    owner: "auth.uid === $uid"
	    client: "root.child('clients').hasChild(auth.uid)"
	    admin: "root.child('admins').hasChild(auth.uid)"
	    create: "(!data.exists() && newData.exists())"
	    update: "(data.exists() && newData.exists())"
	    delete: "(data.exists() && !newData.exists())"
	    timestamp: "newData.val() === now"
	    isString: "newData.isString()"
	    starsRate: "(newData.val() === 1 || newData.val() === 2 || newData.val() === 3 || newData.val() === 4 || newData.val() === 5)"

Usage:

    database:
	    /users:
		    .read: true
		    /$uid:
			    .write: @owner
			    /email:
				    .validate: @isString
			    /name
				    .validate: @isString
			    /$other:
				    .validate: false
	    /products:
		    .read: true
			/$key:
				.write: @admin
				/name:
					.validate: @isString
				/rating:
					/$uid:
						.write: @client
						/stars:
							.validate: @starsRate
						/$other:
							.validate: false
				/$other:
					.validate: false

####validate
This middleware allows to define metadata that starts with "$validate" as a chunk of a ".validate" field. The ".validate" field gets generated by concatenating all "$validate..." fields. If defined, ".validate" is concatenated too. The OR operation is applied between the "$validate..." fields

Example:

    database:
		/$something:
			/status:
				.write: true
				$validate_REQUESTING: "(!data.exists() && newData.val() === 'REQUESTING')"
				$validate_CANCELED: "(data.val() === 'REQUESTING' && newData.val() === 'CANCELED')"
				$validate_REJECTED: "(data.val() === 'REQUESTING' && newData.val() === 'REJECTED')"
				$validate_ACCEPTED: "(data.val() === 'REQUESTING' && newData.val() === 'ACCEPTED')"
				$validate_FINISHED: "(data.val() === 'ACCEPTED' && newData.val() === 'FINISHED')"

Example output:

    database:
		/$something:
			/status:
				.write: true
				.validate: "(!data.exists() && newData.val() === 'REQUESTING') || (data.val() === 'REQUESTING' && newData.val() === 'CANCELED') || (data.val() === 'REQUESTING' && newData.val() === 'REJECTED') || (data.val() === 'REQUESTING' && newData.val() === 'ACCEPTED') || (data.val() === 'ACCEPTED' && newData.val() === 'FINISHED')"