# zkOracle and Off-chain operator

the zkApps Hackathon & Grant -- [Mina Navigators Program](https://minaprotocol.com/blog/mina-navigators-zk-grants-program)
> TBD: Best use case that suits Mina's native propoerties
>> IoT: provable edge computations.

- Milestone 0: Design a domain model.
    * [ERC677](https://github.com/ethereum/EIPs/issues/677)
- Milestone 1: Create a domain model (almost an SDK with Structs, Programs, Contracts, etc.) with o1js that articulates your project's foundations.
    * [oracles/price-feed-operator/contracts](oracles/price-feed-operator/contracts)  
    * [oracles/price-feed-operator/fetcher](oracles/price-feed-operator/fetcher)
    * [oracles/price-feed-operator/signer](oracles/price-feed-operator/signer)
- Milestone 2: Develop unit tests for the domain model to ensure each component works as intended.
    * [FeedTokenContract.test.ts](oracles/price-feed-operator/contracts/src/FeedTokenContract.test.ts)
- Milestone 3: Extend the domain model to integrate it with existing projects or utilize it for a new idea. This will involve actual coding and integration tasks.
    * [zkOracle-OFW](https://github.com/ubinix-warun/zkOracle-OCW)
- Milestone 4: Draft comprehensive documentation. Start with the README in the main repository, then move to more detailed docs using frameworks like NextJS. Make sure you provide a clear overview, diagrams, a getting started guide, and explain the relevance of "why Mina.”
    * [docs](docs)
- Milestone 5: Incorporate integration and end-to-end tests. This ensures that the complete application or tool works seamlessly and is free of major bugs.
- Bonus Milestone: Track and improve test coverage, targeting a specific percentage (e.g., 80% or more). Display a badge in the repository to showcase the coverage.
- Bonus Milestone: Educational content for your contribution
    - Example: A YouTube tutorial or blog that walks through your development process, how to use the application or tool, how you can build on top of it, etc…
