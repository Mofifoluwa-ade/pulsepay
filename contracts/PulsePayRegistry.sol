// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * PulsePayRegistry
 * Maps email hashes to wallet addresses for recipient resolution.
 * Also handles pending payments (when recipient hasn't signed up yet).
 */
contract PulsePayRegistry {
    mapping(bytes32 => address) private emailToWallet;
    mapping(bytes32 => PendingPayment[]) private pendingPayments;

    struct PendingPayment {
        address sender;
        uint256 amount;    // in USDC (6 decimals)
        uint256 timestamp;
    }

    event WalletRegistered(bytes32 indexed emailHash, address wallet);
    event PaymentClaimed(bytes32 indexed emailHash, address wallet, uint256 amount);

    function register(bytes32 emailHash, address wallet) external {
        emailToWallet[emailHash] = wallet;
        emit WalletRegistered(emailHash, wallet);
    }

    function resolve(bytes32 emailHash) external view returns (address) {
        return emailToWallet[emailHash];
    }

    function storePending(bytes32 emailHash, uint256 amount) external payable {
        pendingPayments[emailHash].push(PendingPayment(msg.sender, amount, block.timestamp));
    }

    function claimPending(bytes32 emailHash) external {
        require(emailToWallet[emailHash] == msg.sender, "Not registered");
        // Release pending USDC to msg.sender
        // (full implementation uses USDC transferFrom)
        emit PaymentClaimed(emailHash, msg.sender, 0);
    }
}
