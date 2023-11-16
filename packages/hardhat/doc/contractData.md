## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| contracts/BountiesMetaTxRelayer.sol | 877cc28aba3cbbe43627f9fa5d41342becfa335a |
| contracts/StandardBounties.sol | 403eaa95a8a9c438b9d128c6e89d15d9eb37e4e2 |


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **BountiesMetaTxRelayer** | Implementation |  |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | metaIssueBounty | Public ❗️ | 🛑  |NO❗️ |
| └ | metaIssueAndContribute | Public ❗️ |  💵 |NO❗️ |
| └ | metaContribute | Public ❗️ |  💵 |NO❗️ |
| └ | metaRefundContribution | Public ❗️ | 🛑  |NO❗️ |
| └ | metaRefundMyContributions | Public ❗️ | 🛑  |NO❗️ |
| └ | metaRefundContributions | Public ❗️ | 🛑  |NO❗️ |
| └ | metaDrainBounty | Public ❗️ | 🛑  |NO❗️ |
| └ | metaPerformAction | Public ❗️ | 🛑  |NO❗️ |
| └ | metaFulfillBounty | Public ❗️ | 🛑  |NO❗️ |
| └ | metaUpdateFulfillment | Public ❗️ | 🛑  |NO❗️ |
| └ | metaAcceptFulfillment | Public ❗️ | 🛑  |NO❗️ |
| └ | metaFulfillAndAccept | Public ❗️ | 🛑  |NO❗️ |
| └ | metaChangeBounty | Public ❗️ | 🛑  |NO❗️ |
| └ | metaChangeIssuer | Public ❗️ | 🛑  |NO❗️ |
| └ | metaChangeApprover | Public ❗️ | 🛑  |NO❗️ |
| └ | metaChangeData | Public ❗️ | 🛑  |NO❗️ |
| └ | metaChangeDeadline | Public ❗️ | 🛑  |NO❗️ |
| └ | metaAddIssuers | Public ❗️ | 🛑  |NO❗️ |
| └ | metaAddApprovers | Public ❗️ | 🛑  |NO❗️ |
| └ | getSigner | Internal 🔒 |   | |
||||||
| **StandardBounties** | Implementation |  |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | setMetaTxRelayer | External ❗️ | 🛑  |NO❗️ |
| └ | issueBounty | Public ❗️ | 🛑  | senderIsValid |
| └ | issueAndContribute | Public ❗️ |  💵 |NO❗️ |
| └ | contribute | Public ❗️ |  💵 | senderIsValid validateBountyArrayIndex callNotStarted |
| └ | refundContribution | Public ❗️ | 🛑  | senderIsValid validateBountyArrayIndex validateContributionArrayIndex onlyContributor hasNotPaid hasNotRefunded callNotStarted |
| └ | refundMyContributions | Public ❗️ | 🛑  | senderIsValid |
| └ | refundContributions | Public ❗️ | 🛑  | senderIsValid validateBountyArrayIndex onlyIssuer callNotStarted |
| └ | drainBounty | Public ❗️ | 🛑  | senderIsValid validateBountyArrayIndex onlyIssuer callNotStarted |
| └ | performAction | Public ❗️ | 🛑  | senderIsValid validateBountyArrayIndex |
| └ | fulfillBounty | Public ❗️ | 🛑  | senderIsValid validateBountyArrayIndex |
| └ | updateFulfillment | Public ❗️ | 🛑  | senderIsValid validateBountyArrayIndex validateFulfillmentArrayIndex onlySubmitter |
| └ | acceptFulfillment | Public ❗️ | 🛑  | senderIsValid validateBountyArrayIndex validateFulfillmentArrayIndex isApprover callNotStarted |
| └ | fulfillAndAccept | Public ❗️ | 🛑  | senderIsValid |
| └ | changeBounty | Public ❗️ | 🛑  | senderIsValid |
| └ | changeIssuer | Public ❗️ | 🛑  | senderIsValid validateBountyArrayIndex validateIssuerArrayIndex onlyIssuer |
| └ | changeApprover | External ❗️ | 🛑  | senderIsValid validateBountyArrayIndex onlyIssuer validateApproverArrayIndex |
| └ | changeIssuerAndApprover | External ❗️ | 🛑  | senderIsValid onlyIssuer |
| └ | changeData | Public ❗️ | 🛑  | senderIsValid validateBountyArrayIndex validateIssuerArrayIndex onlyIssuer |
| └ | changeDeadline | External ❗️ | 🛑  | senderIsValid validateBountyArrayIndex validateIssuerArrayIndex onlyIssuer |
| └ | addIssuers | Public ❗️ | 🛑  | senderIsValid validateBountyArrayIndex validateIssuerArrayIndex onlyIssuer |
| └ | addApprovers | Public ❗️ | 🛑  | senderIsValid validateBountyArrayIndex validateIssuerArrayIndex onlyIssuer |
| └ | getBounty | External ❗️ |   |NO❗️ |
| └ | transferTokens | Internal 🔒 | 🛑  | |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
