// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PredictWars — ETH Price Prediction Game on MegaETH
/// @notice Score-based on-chain prediction game. No real funds at stake.
/// @dev Deployed on MegaETH Testnet (chainId: 6343)
contract PredictWars {
    // ─────────────────────────────────────────────
    // Types
    // ─────────────────────────────────────────────
    enum Direction { UP, DOWN }

    struct Prediction {
        address   player;
        Direction direction;
        int256    entryPrice;   // ETH/USD × 100  (e.g. $3500.50 → 350050)
        uint256   bid;          // Points wagered
        uint256   timestamp;
        bool      resolved;
        bool      won;
    }

    struct PlayerStats {
        uint256 totalPredictions;
        uint256 wins;
        uint256 score;
        string  username;
        bool    exists;
    }

    // ─────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────
    mapping(address => PlayerStats) public playerStats;
    mapping(address => bool)        public hasActivePrediction;
    mapping(address => uint256)     public activePredictionId;

    Prediction[] public predictions;
    address[]    public allPlayers;

    uint256 public constant PREDICTION_DURATION = 30;      // 30 seconds
    uint256 public constant STARTING_SCORE      = 1000;
    uint256 public constant DEFAULT_BID         = 100;

    // ─────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────
    event PredictionMade(
        uint256 indexed predId,
        address indexed player,
        Direction       direction,
        int256          entryPrice,
        uint256         bid,
        uint256         resolveAfter
    );

    event PredictionResolved(
        uint256 indexed predId,
        address indexed player,
        bool            won,
        int256          exitPrice,
        uint256         bid,
        uint256         newScore
    );

    event UsernameSet(address indexed player, string username);

    // ─────────────────────────────────────────────
    // Errors
    // ─────────────────────────────────────────────
    error HasActivePrediction();
    error NoPredictionFound();
    error AlreadyResolved();
    error TooEarlyToResolve();
    error InvalidPrice();
    error UsernameTooLong();
    error BidTooHigh();
    error BidZero();

    // ─────────────────────────────────────────────
    // Internal: register player
    // ─────────────────────────────────────────────
    function _registerIfNew(address _player) internal {
        if (!playerStats[_player].exists) {
            playerStats[_player].exists = true;
            playerStats[_player].score  = STARTING_SCORE;
            allPlayers.push(_player);
        }
    }

    // ─────────────────────────────────────────────
    // Write Functions
    // ─────────────────────────────────────────────

    /// @notice Set or update display name (also registers player with 1000 pts)
    /// @param _username Display name, max 32 chars
    function setUsername(string calldata _username) external {
        if (bytes(_username).length == 0 || bytes(_username).length > 32) revert UsernameTooLong();
        _registerIfNew(msg.sender);
        playerStats[msg.sender].username = _username;
        emit UsernameSet(msg.sender, _username);
    }

    /// @notice Submit a new UP/DOWN prediction
    /// @param _direction  0 = UP, 1 = DOWN
    /// @param _entryPrice Current ETH/USD price × 100
    /// @param _bid        Points to wager (0 = use DEFAULT_BID)
    function predict(
        Direction _direction,
        int256    _entryPrice,
        uint256   _bid
    ) external {
        if (hasActivePrediction[msg.sender]) revert HasActivePrediction();
        if (_entryPrice <= 0)               revert InvalidPrice();

        _registerIfNew(msg.sender);

        uint256 effectiveBid = _bid == 0 ? DEFAULT_BID : _bid;
        if (effectiveBid > playerStats[msg.sender].score) revert BidTooHigh();

        uint256 predId = predictions.length;
        predictions.push(Prediction({
            player:     msg.sender,
            direction:  _direction,
            entryPrice: _entryPrice,
            bid:        effectiveBid,
            timestamp:  block.timestamp,
            resolved:   false,
            won:        false
        }));

        hasActivePrediction[msg.sender] = true;
        activePredictionId[msg.sender]  = predId;

        emit PredictionMade(
            predId,
            msg.sender,
            _direction,
            _entryPrice,
            effectiveBid,
            block.timestamp + PREDICTION_DURATION
        );
    }

    /// @notice Resolve an expired prediction
    /// @dev Permissionless. Exit price supplied by caller (V0 trust model).
    function resolve(uint256 _predId, int256 _exitPrice) external {
        if (_predId >= predictions.length)                              revert NoPredictionFound();
        Prediction storage pred = predictions[_predId];
        if (pred.resolved)                                              revert AlreadyResolved();
        if (block.timestamp < pred.timestamp + PREDICTION_DURATION)    revert TooEarlyToResolve();
        if (_exitPrice <= 0)                                            revert InvalidPrice();

        bool won = (pred.direction == Direction.UP)
            ? _exitPrice > pred.entryPrice
            : _exitPrice < pred.entryPrice;

        pred.resolved = true;
        pred.won      = won;

        PlayerStats storage stats = playerStats[pred.player];
        stats.totalPredictions++;
        if (won) {
            stats.wins++;
            stats.score += pred.bid;
        } else {
            stats.score = stats.score >= pred.bid ? stats.score - pred.bid : 0;
        }

        hasActivePrediction[pred.player] = false;

        emit PredictionResolved(
            _predId, pred.player, won, _exitPrice, pred.bid, stats.score
        );
    }

    // ─────────────────────────────────────────────
    // View Functions
    // ─────────────────────────────────────────────

    function getLeaderboard() external view returns (
        address[] memory addrs,
        string[]  memory usernames,
        uint256[] memory scores,
        uint256[] memory wins,
        uint256[] memory totals
    ) {
        uint256 len = allPlayers.length;
        addrs     = new address[](len);
        usernames = new string[](len);
        scores    = new uint256[](len);
        wins      = new uint256[](len);
        totals    = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            address p             = allPlayers[i];
            PlayerStats storage s = playerStats[p];
            addrs[i]     = p;
            usernames[i] = s.username;
            scores[i]    = s.score;
            wins[i]      = s.wins;
            totals[i]    = s.totalPredictions;
        }
    }

    function getActivePrediction(address _player) external view returns (
        bool      active,
        uint256   predId,
        Direction direction,
        int256    entryPrice,
        uint256   bid,
        uint256   resolveAfter
    ) {
        active = hasActivePrediction[_player];
        if (active) {
            predId       = activePredictionId[_player];
            Prediction storage pred = predictions[predId];
            direction    = pred.direction;
            entryPrice   = pred.entryPrice;
            bid          = pred.bid;
            resolveAfter = pred.timestamp + PREDICTION_DURATION;
        }
    }

    function getTotalPlayers()     external view returns (uint256) { return allPlayers.length; }
    function getTotalPredictions() external view returns (uint256) { return predictions.length; }
}
