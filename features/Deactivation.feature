@After=User
Feature: User deactivation
  As an admin
  I should be able to deactivate users
  so they can no longer us the system

  Background: Client defaults

    Given "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8" is the Accept header
    And   "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8" is the Content-Type header

  Scenario: Login with an deactivated account should not work

    Given the account for "mike.doe-{time}@example.com" is deactivated
    And this is the request body
    --------------
    "email": "mike.doe-{time}@example.com",
    "password": "serious garage excellent making"
    --------------
    When I POST to {loginEndpoint}
    Then the status code should be 403
