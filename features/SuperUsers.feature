@After=Index
Feature: SuperUsers
  Accounts may be granted superuser permissions which allows them to perform
  special actions

  Background: Client defaults

    Given "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8" is the Accept header
    Given "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8" is the Content-Type header

  Scenario: Angela registers her account and is granted superuser rights

    Given this is the request body
    --------------
    "email": "angela.maus-{time}@example.com",
    "firstname": "Angela",
    "lastname": "Maus",
    "password": "gone itself conversation each"
    --------------
    When I POST to {registrationEndpoint}
    Then the status code should be 201
    Given I have the accountActivationToken for "angela.maus-{time}@example.com" in "angelasActivationToken"
    And "Bearer {angelasActivationToken}" is the Authorization header
    When I POST to {accountActivationEndpoint}
    Then the status code should be 204
    Given the account for "angela.maus-{time}@example.com" is granted superuser permissions
    And this is the request body
    --------------
    "email": "angela.maus-{time}@example.com",
    "password": "gone itself conversation each"
    --------------
    When I POST to {loginEndpoint}
    Then the status code should be 201
    And the Content-Type header should equal "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8"
    And "$context" should equal "https://tools.ietf.org/html/rfc7519"
    And I store "token" as "angelasToken"
    And I parse JWT token into "angelasJwt"
    Given "Bearer {angelasToken}" is the Authorization header
    When I GET {angelasJwt.sub}
    Then the status code should be 200
    And "superUser" should equal true

  Scenario: can create other users and the users initial password is 12345678

    Given "Bearer {angelasToken}" is the Authorization header
    And this is the request body
    --------------
    "email": "heiko.fischer-{time}@example.com",
    "firstname": "Heiko",
    "lastname": "Fischer"
    --------------
    When I POST to {createUserEndpoint}
    Then the status code should be 201
    # Fetch the user
    When I follow the redirect
    Then the status code should be 200
    And the Content-Type header should equal "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8"
    And "$context" should equal "https://github.com/RHeactor/nucleus/wiki/JsonLD#User"
    And "email" should equal "heiko.fischer-{time}@example.com"
    # Try login as new user
    Given the Authorization header is empty
    And this is the request body
    --------------
    "email": "heiko.fischer-{time}@example.com",
    "password": "12345678"
    --------------
    When I POST to {loginEndpoint}
    Then the status code should be 201

  Scenario: Creating users is forbidden for others

    Given "Bearer {janesToken}" is the Authorization header
    And this is the request body
    --------------
    "email": "some.new.user-{time}@example.com",
    "firstname": "Some",
    "lastname": "User"
    --------------
    When I POST to {createUserEndpoint}
    Then the status code should be 403

  Scenario: can list all users

    Given "Bearer {angelasToken}" is the Authorization header
    When I POST to {userList}
    Then the status code should be 200
    And the Content-Type header should equal "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8"
    And a list of "https://github.com/RHeactor/nucleus/wiki/JsonLD#User" with 8 of 8 items should be returned

  Scenario: can search users by email

    Given "Bearer {angelasToken}" is the Authorization header
    And this is the request body
    --------------
    "email": "heiko.fischer-{time}@example.com"
    --------------
    When I POST to {userList}
    Then the status code should be 200
    And the Content-Type header should equal "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8"
    And a list of "https://github.com/RHeactor/nucleus/wiki/JsonLD#User" with 1 of 1 item should be returned
    And "firstname" of the 1st item should equal "Heiko"
    And "lastname" of the 1st item should equal "Fischer"
    And "email" of the 1st item should equal "heiko.fischer-{time}@example.com"

  Scenario: Listing all users is forbidden for others

    Given "Bearer {janesToken}" is the Authorization header
    When I POST to {userList}
    Then the status code should be 403

  Scenario: can activate and deactivate users

    # A new user registers
    Given the Authorization header is empty
    And this is the request body
    --------------
    "email": "superuser.activation-test-{time}@example.com",
    "firstname": "Mike",
    "lastname": "Doe",
    "password": "i will change this later"
    --------------
    When I POST to {registrationEndpoint}
    Then the status code should be 201
    # Admin searches the user by email
    Given "Bearer {angelasToken}" is the Authorization header
    And this is the request body
    --------------
    "email": "superuser.activation-test-{time}@example.com"
    --------------
    When I POST to {userList}
    Then the status code should be 200
    And I store the link to "toggle-active" of the 1st item as "activateUserEndpoint"
    # Activate the user
    Given "1" is the If-Match header
    When I PUT to {activateUserEndpoint}
    Then the status code should be 204
    And the etag header should equal "2"
    And the Last-Modified header should be now
    # Now the user can log-in
    Given the Authorization header is empty
    And this is the request body
    --------------
    "email": "superuser.activation-test-{time}@example.com",
    "password": "i will change this later"
    --------------
    When I POST to {loginEndpoint}
    Then the status code should be 201
    # Deactivate the user
    Given "Bearer {angelasToken}" is the Authorization header
    And "2" is the If-Match header
    And the request body is empty
    When I DELETE {activateUserEndpoint}
    Then the status code should be 204
    # Now the user can't log-in
    Given the Authorization header is empty
    And this is the request body
    --------------
    "email": "superuser.activation-test-{time}@example.com",
    "password": "i will change this later"
    --------------
    When I POST to {loginEndpoint}
    Then the status code should be 403

  Scenario: can change the email address of users

    Given the Authorization header is empty
    And this is the request body
    --------------
    "email": "superuser.email-change-test-{time}@example.com",
    "firstname": "Mike",
    "lastname": "Doe",
    "password": "some password"
    --------------
    When I POST to {registrationEndpoint}
    Then the status code should be 201
    # Admin searches the user by email
    Given "Bearer {angelasToken}" is the Authorization header
    And this is the request body
    --------------
    "email": "superuser.email-change-test-{time}@example.com"
    --------------
    When I POST to {userList}
    Then the status code should be 200
    And I store the link to "update-email" of the 1st item as "changeUserEmailEndpoint"
    # Change its email
    Given "1" is the If-Match header
    And this is the request body
    --------------
    "email": "superuser.changed.email-change-test-{time}@example.com"
    --------------
    When I PUT to {changeUserEmailEndpoint}
    Then the status code should be 204
    And the etag header should equal "2"
    And the Last-Modified header should be now
    # Search for the changed user
    Given "Bearer {angelasToken}" is the Authorization header
    And this is the request body
    --------------
    "email": "superuser.changed.email-change-test-{time}@example.com"
    --------------
    When I POST to {userList}
    Then the status code should be 200
    And "email" of the 1st item should equal "superuser.changed.email-change-test-{time}@example.com"
