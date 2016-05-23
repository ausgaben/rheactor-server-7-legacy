@After=Registration
Feature: User activation

  Background: Client defaults

    Given "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8" is the Accept header
    And   "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8" is the Content-Type header

  Scenario: Activate Mike's account

    Given I have the accountActivationToken for "mike.doe-{time}@example.com" in "activationToken"
    And "Bearer {activationToken}" is the Authorization header
    When I POST to {accountActivationEndpoint}
    Then the status code should be 204

  Scenario: Login with an inactive account should not work

    Given this is the request body
    --------------
    "email": "jane.doe-{time}@example.com",
    "password": "leg selection railroad wrapped"
    --------------
    When I POST to {loginEndpoint}
    Then the status code should be 403

  Scenario: Activate Jane's account

    Given I have the accountActivationToken for "jane.doe-{time}@example.com" in "janesActivationToken"
    And "Bearer {janesActivationToken}" is the Authorization header
    When I POST to {accountActivationEndpoint}
    Then the status code should be 204

  Scenario: Activate Tonys's account

    Given I have the accountActivationToken for "tony.stark-{time}@example.com" in "tonysActivationToken"
    And "Bearer {tonysActivationToken}" is the Authorization header
    When I POST to {accountActivationEndpoint}
    Then the status code should be 204
