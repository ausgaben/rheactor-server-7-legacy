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
    Given the Authorization header is empty
    And this is the request body
    --------------
    "email": "heiko.fischer-{time}@example.com",
    "password": "12345678"
    --------------
    When I POST to {loginEndpoint}
    Then the status code should be 201
