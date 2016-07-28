@After=Login
Feature: /api/user/:id
  Fetch the user profile

  Background: Client defaults

    Given "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8" is the Accept header
    Given "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8" is the Content-Type header

  Scenario: GET

    Given "Bearer {token}" is the Authorization header
    When I GET {jwt.sub}
    Then the status code should be 200
    And the Content-Type header should equal "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8"
    And "$context" should equal "https://github.com/RHeactor/nucleus/wiki/JsonLD#User"
    And "$id" should equal "{jwt.sub}"
    And "email" should equal "mike.doe-{time}@example.com"
    And "name" should equal "Mike Doe"
    And "firstname" should equal "Mike"
    And "lastname" should equal "Doe"
    And "active" should equal true
    And "password" should not exist

  Scenario: GET (account that is not me)

    Given "Bearer {token}" is the Authorization header
    When I GET /api/user/1234567890
    Then the status code should be 403

  Scenario: Fetch Jane's acount

    Given "Bearer {janesToken}" is the Authorization header
    When I GET {janesJwt.sub}
    Then the status code should be 200
    And "name" should equal "Jane Doe"
    And "firstname" should equal "Jane"
    And "lastname" should equal "Doe"

  Scenario: Fetch Tonys's acount

    Given "Bearer {tonysToken}" is the Authorization header
    When I GET {tonysJwt.sub}
    Then the status code should be 200
    And "name" should equal "Tony Stark"
