@After=Index
Feature: /api/status

  Background: Client defaults

    Given "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8" is the Accept header
    Given "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8" is the Content-Type header

  Scenario: GET

    When I GET {statusEndpoint}
    Then the status code should be 200
    And the Content-Type header should equal "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8"
    And "$context" should equal "https://github.com/RHeactor/nucleus/wiki/JsonLD#Status"
    And "status" should equal "ok"
    And "environment" should equal "testing"
