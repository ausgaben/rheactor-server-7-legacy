# TODO

## Backend

- Add aggregated model cache
- Process backend events asynchronously
  - push notification commands to AWS SNS, which calls Lambda to send emails
- re-add lwip: https://github.com/EyalAr/lwip/issues/239 is fixed ([code](https://github.com/ResourcefulHumans/staRHs-webapp/blob/95f4ab43f64e7b8c0335281b35a2a3e89555140e/server/api/user.js#L61))

## Json-LD

- The relations do not contain the information about the appropriate 
  method. Look into hydra.
