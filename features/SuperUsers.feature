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

  Scenario: SuperUsers can create other users and the users initial password is 12345678

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

  Scenario: SuperUsers can list all users

    Given "Bearer {angelasToken}" is the Authorization header
    When I POST to {userList}
    Then the status code should be 200
    And the Content-Type header should equal "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8"
    And a list of "https://github.com/RHeactor/nucleus/wiki/JsonLD#User" with 8 of 8 items should be returned

  Scenario: Listing all users is forbidden for others

    Given "Bearer {janesToken}" is the Authorization header
    When I POST to {userList}
    Then the status code should be 403

  Scenario: SuperUsers can search users by email

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
