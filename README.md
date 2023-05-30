# Lottery Contract

This is a simple lottery contract implemented on the Ethereum blockchain. It allows users to purchase lottery tickets and selects a winner based on a random number generated in a secure and fair manner.

## Contract Details

### State Variables

- `ticket_price` (uint256): The price of each lottery ticket in ether.
- `ticket_count` (uint256): The total number of tickets available for sale in the current lottery.
- `sold_tickets` (uint256): The number of tickets sold in the current lottery.
- `min_holders` (uint256): The minimum number of ticket holders required to start the lottery.
- `holders` (address payable[]): An array of addresses representing the ticket holders.
- `owner` (address): The address of the contract owner.
- `status` (bool): A flag indicating whether a lottery is in progress or not.

### Events

- `winner(address _winner)`: Emitted when a winner is selected. Includes the address of the winner as a parameter.

### Modifiers

- `onlyOwner()`: Allows only the contract owner to execute certain functions.

### Functions

- `purchase()`: Allows users to buy lottery tickets by sending the required amount of ether.
- `generate_random()`: Generates a random number in a secure and fair manner.
- `Start()`: Used by the contract owner to start the lottery and select a winner.
- `state_reset()`: Resets the contract state to start a new lottery.

## Random Number Generation

Generating random numbers in a deterministic system like Ethereum is non-trivial. In this contract, a secure and fair random number is generated using the following process:

1. When the `Start()` function is called to start the lottery, the `generate_random()` function is invoked internally.

2. The `generate_random()` function first assigns the current number of ticket holders to the `sold_tickets` variable.

3. It then uses the `keccak256` function, a cryptographic hash function, to generate a random hash. The input to the hash function includes:
   - `block.timestamp`: The current timestamp of the Ethereum block.
   - `block.difficulty`: The difficulty of the Ethereum block.
   - `sold_tickets`: The number of tickets sold in the current lottery.

   By combining these factors, the resulting hash is unique and unpredictable, ensuring fairness in the random number generation.

4. The random hash is converted to a `uint256` value using the `uint256(randomHash)` syntax.

5. The generated random number is obtained by calculating the modulo (`%`) of the converted hash with the number of sold tickets (`sold_tickets`). This ensures that the random number falls within the range of available ticket holders.

6. The generated random number is then returned as the result.


## Security Considerations

When working with smart contracts, it is important to consider the following security considerations:


- **Random number generation**: Although the provided random number generation process uses cryptographic hashing and block-related information, it is important to note that it is not entirely unpredictable. Deterministic systems like Ethereum may still be susceptible to certain attacks, such as manipulation by miners or front-running. Consider engaging with specialized libraries or external oracles for enhanced randomness if absolute unpredictability is required.

## Alternative Ways

Using chainlink VRF for random number generation is considered the best way to retrieve the randomness but using chainlink in this project would make it more time lengthy, so keeping the time constraints in mind I had to go with this approach.