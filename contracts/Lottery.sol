// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.19;

contract Lottery {
    uint256 ticket_price;
    uint256 ticket_count;
    uint256 sold_tickets;
    uint256 min_holders;
    address payable[] public holders;
    address owner;

    event winner(address _winner);

    bool status;

    constructor(
        uint256 init_price,
        uint256 init_count,
        uint256 _min
    ) {
        owner = msg.sender;
        ticket_price = init_price;
        ticket_count = init_count;
        min_holders = _min;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    // Ticket Purchase: Implement a function to let users buy lottery tickets. Each ticket costs a set
    // amount of ether.

    function purchase() public payable {
        require(holders.length < ticket_count, "sold out");
        require(ticket_price <= msg.value, "Not enough ether Paid");
        holders.push(payable(msg.sender));
    }

    // Random Number Generation: After a certain number of tickets have been sold, the contract
    // should generate a random number in a secure and fair manner. This is the challenging part,
    // as generating random numbers in a deterministic system like Ethereum is non-trivial.

    function generate_random() internal returns (uint256) {
        sold_tickets = holders.length;
        bytes32 randomHash = keccak256(
            abi.encodePacked(block.timestamp, block.difficulty, sold_tickets)
        );
        uint256 randomNumber = uint256(randomHash) % sold_tickets;
        return randomNumber;
    }

    // Selecting a Winner: Based on the random number, the contract should select a winner from
    // the ticket holders.
    // Prize Distribution: The contract should then distribute the prize, which is the sum of the
    // ticket sales, to the winner.

    function Start() public onlyOwner {
        require(!status, "already in progress");
        require(
            holders.length >= min_holders,
            "minimum numbers of holders not met"
        );
        status = true;

        address _winner = holders[generate_random()];
        emit winner(_winner);
        payable(_winner).transfer(sold_tickets * ticket_price);
    }

    // Starting a New Lottery: After a winner is chosen and the prize is distributed, the contract
    // should allow for a new lottery to start

    function state_reset(
        uint256 init_price,
        uint256 init_count,
        uint256 _min
    ) public onlyOwner {
        status = false;
        delete holders;
        ticket_price = init_price;
        ticket_count = init_count;
        min_holders = _min;
    }
}
