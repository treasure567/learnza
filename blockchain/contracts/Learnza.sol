// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract Learnza is ERC20, ERC20Burnable, Ownable {
    using Strings for uint256;

    uint256 private constant TOTAL_SUPPLY = 1_000_000_000 * 10 ** 18;
    uint256 private constant CLAIM_AMOUNT = 100 * 10 ** 18;
    uint256 private constant CLAIM_COOLDOWN = 1 hours;

    struct ClaimHistory {
        address userAddress;
        uint256 amount;
        uint256 lastClaimed;
    }

    mapping(address => ClaimHistory) private claimHistories;

    uint256 private totalLearnzaClaimed;
    uint256 private totalWalletsClaimed;
    uint256 private totalLearnzaMinted;
    address[] private claimedWallets;

    event TokenClaimed(address indexed user, uint256 amount);

    constructor() ERC20("Learnza Token", "LEARNZA") Ownable(msg.sender) {
        _mint(msg.sender, TOTAL_SUPPLY);
        totalLearnzaMinted += TOTAL_SUPPLY;
    }

    function claimTokens() public {
        ClaimHistory storage userClaim = claimHistories[msg.sender];

        if (userClaim.userAddress == address(0)) {
            userClaim.userAddress = msg.sender;
            userClaim.amount = 0;
            userClaim.lastClaimed = 0;

            bool isNewClaimer = true;
            for (uint256 i = 0; i < claimedWallets.length; i++) {
                if (claimedWallets[i] == msg.sender) {
                    isNewClaimer = false;
                    break;
                }
            }

            if (isNewClaimer) {
                claimedWallets.push(msg.sender);
                totalWalletsClaimed++;
            }
        }

        if (userClaim.lastClaimed > 0) {
            uint256 nextAllowedClaim = userClaim.lastClaimed + CLAIM_COOLDOWN;
            require(
                block.timestamp >= nextAllowedClaim,
                "You can claim tokens every 3 hours"
            );
        }

        _transfer(address(this), msg.sender, CLAIM_AMOUNT);
        totalLearnzaClaimed += CLAIM_AMOUNT;

        userClaim.amount += CLAIM_AMOUNT;
        userClaim.lastClaimed = block.timestamp;

        emit TokenClaimed(msg.sender, CLAIM_AMOUNT);
    }

    function getClaimHistory(
        address _user
    ) public view returns (uint256, uint256) {
        ClaimHistory memory userClaim = claimHistories[_user];

        if (userClaim.userAddress == address(0)) {
            return (0, 0);
        }

        uint256 nextClaimTime = 0;
        if (userClaim.lastClaimed > 0) {
            nextClaimTime = userClaim.lastClaimed + CLAIM_COOLDOWN;
        }

        return (userClaim.amount, nextClaimTime);
    }

    function getClaimStatus(
        address _user
    ) public view returns (bool canClaim, uint256 timeLeft) {
        ClaimHistory memory userClaim = claimHistories[_user];

        if (userClaim.userAddress == address(0) || userClaim.lastClaimed == 0) {
            return (true, 0);
        }

        uint256 nextAllowedClaim = userClaim.lastClaimed + CLAIM_COOLDOWN;

        if (block.timestamp >= nextAllowedClaim) {
            return (true, 0);
        } else {
            return (false, nextAllowedClaim - block.timestamp);
        }
    }

    function checkBalance() public view returns (uint256) {
        return balanceOf(msg.sender);
    }

    function deductFromUserBalance(
        address _user,
        uint256 _amount
    ) public onlyOwner {
        _burn(_user, _amount);
    }
}
