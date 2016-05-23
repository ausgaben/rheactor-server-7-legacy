@After=Login
Feature: Tokens

  Background: Client defaults

    Given "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8" is the Accept header
    Given "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8" is the Content-Type header
    Given "Bearer {token}" is the Authorization header

  Scenario: Verify the token

    When I POST to {tokenVerifyEndpoint}
    Then the status code should be 204

  Scenario: Prolong a token

    When I POST to {tokenRenewEndpoint}
    Then the status code should be 201
    And the Content-Type header should equal "application/vnd.resourceful-humans.rheactor.v1+json; charset=utf-8"
    And "$context" should equal "https://tools.ietf.org/html/rfc7519"
    And "token" should exist
    And "token" should not equal "{token}"
    And JWT sub should equal "{jwt.sub}"
    And JWT iss should equal "renew"
    And JWT exp should be 30 minutes in the future

  Scenario: Passing invalid tokens

    Given "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE0NjE2ODQ1MjcsImV4cCI6MTQ2MTY4NjMyNywiaXNzIjoibG9naW4iLCJzdWIiOiJodHRwczovL2FwaS5uZXR3b3Joay5uZXQvYXBpL3VzZXIvOCJ9.Sw6dFk3eqEfOBmd2nJX8WHc4TGI9MkhbkKQF71QQtsc7SLeqxL9cD0vsen-8SvPsbJslL14o2TbkotvUuqSbM650j1ILmYL2Pa4ShEacjAn0nZ0Lym2YSULu8n0fc20zQwzP-fHBxkOvcSBqXDukR0pzM8KMhIufe2xSiDqlnp4" is the Authorization header
    When I POST to {tokenVerifyEndpoint}
    Then the status code should be 401
